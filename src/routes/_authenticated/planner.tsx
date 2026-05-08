import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listWeek, upsertPlan, togglePlanDone, deletePlan } from "@/lib/planner.functions";

export const Route = createFileRoute("/_authenticated/planner")({
  component: PlannerPage,
});

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function fmt(d: Date) { return d.toISOString().slice(0, 10); }

function PlannerPage() {
  const list = useServerFn(listWeek);
  const upsert = useServerFn(upsertPlan);
  const toggle = useServerFn(togglePlanDone);
  const del = useServerFn(deletePlan);
  const qc = useQueryClient();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  }), [weekStart]);
  const start = fmt(days[0]);
  const end = fmt(days[6]);

  const q = useQuery({
    queryKey: ["week", start],
    queryFn: () => list({ data: { start, end } }),
  });

  const items = (q.data?.items ?? []) as any[];
  const byDay = (d: string) => items.filter((i) => i.plan_date === d);

  const add = useMutation({
    mutationFn: (p: { plan_date: string; idea: string }) => upsert({ data: p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["week", start] }),
    onError: (e: any) => toast.error(e.message),
  });
  const tog = useMutation({
    mutationFn: (p: { id: string; done: boolean }) => toggle({ data: p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["week", start] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["week", start] }),
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-secondary p-2 text-primary"><CalendarDays className="h-5 w-5" /></div>
          <div>
            <h1 className="font-display text-3xl font-black">Weekly Planner</h1>
            <p className="text-sm text-muted-foreground">Your content week — sorted.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}>← Prev</Button>
          <Button variant="outline" className="rounded-full" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}>Next →</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {days.map((d) => {
          const key = fmt(d);
          const dayItems = byDay(key);
          return (
            <DayCard
              key={key}
              date={d}
              items={dayItems}
              onAdd={(idea) => add.mutate({ plan_date: key, idea })}
              onToggle={(id, done) => tog.mutate({ id, done })}
              onDelete={(id) => remove.mutate(id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayCard({ date, items, onAdd, onToggle, onDelete }: { date: Date; items: any[]; onAdd: (idea: string) => void; onToggle: (id: string, done: boolean) => void; onDelete: (id: string) => void }) {
  const [val, setVal] = useState("");
  const isToday = fmt(date) === fmt(new Date());
  return (
    <Card className={`rounded-3xl p-4 ${isToday ? "ring-2 ring-primary" : ""}`}>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg font-bold">{date.toLocaleDateString("en-GB", { weekday: "short" })}</p>
        <p className="text-xs text-muted-foreground">{date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-start gap-2 rounded-2xl bg-secondary/60 p-2 text-sm">
            <button onClick={() => onToggle(i.id, !i.done)} className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${i.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
              {i.done && <Check className="h-3 w-3" />}
            </button>
            <p className={`flex-1 ${i.done ? "line-through text-muted-foreground" : ""}`}>{i.idea}</p>
            <button onClick={() => onDelete(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (val.trim()) { onAdd(val.trim()); setVal(""); } }} className="mt-3 flex gap-1">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add idea…" className="h-8 rounded-full text-xs" />
        <Button type="submit" size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0"><Plus className="h-4 w-4" /></Button>
      </form>
    </Card>
  );
}