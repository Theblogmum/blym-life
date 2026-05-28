import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listWeek, upsertPlan, togglePlanDone, deletePlan } from "@/lib/planner.functions";
import { useSubscription } from "@/hooks/use-subscription";
import { PageHero } from "@/components/page-hero";
import { cn } from "@/lib/utils";

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
  const sub = useSubscription();
  const isFree = !sub.loading && !sub.isActive;
  const thisWeekStart = startOfWeek(new Date()).getTime();
  const nextWeekStart = thisWeekStart + 7 * 24 * 60 * 60 * 1000;
  const lockedNext = isFree && weekStart.getTime() >= nextWeekStart;
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
    <div>
      <PageHero
        icon={CalendarDays}
        eyebrow="this week"
        title="Weekly planner"
        description="Your content week — sorted, soft, and one tap away."
        variant="sky"
      />
      <div className="page-shell">
        <div className="section-block flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">week of</p>
            <p className="mt-1.5 font-display text-[18px] font-bold tracking-[-0.01em] sm:text-[20px]">
              {days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {days[6].toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}>← Prev</Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={lockedNext}
              title={lockedNext ? "Free plan: 1 week ahead. Upgrade to Creator for the full calendar." : undefined}
              onClick={() => {
                if (lockedNext) {
                  toast.error("Free plan only plans 1 week ahead. Upgrade to Creator for the full calendar.");
                  return;
                }
                const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d);
              }}
            >
              Next →
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-3.5 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}

function DayCard({ date, items, onAdd, onToggle, onDelete }: { date: Date; items: any[]; onAdd: (idea: string) => void; onToggle: (id: string, done: boolean) => void; onDelete: (id: string) => void }) {
  const [val, setVal] = useState("");
  const isToday = fmt(date) === fmt(new Date());
  return (
    <div className={cn(
      "soft-card soft-card-hover relative p-4 sm:p-5",
      isToday && "border-primary/40 shadow-[var(--shadow-soft)]"
    )}>
      {isToday && (
        <span aria-hidden className="pointer-events-none absolute -top-px left-4 right-4 h-[2px] rounded-full bg-[image:var(--gradient-warm)] opacity-70" />
      )}
      <div className="flex items-baseline justify-between">
        <p className="font-display text-[15px] font-bold tracking-[-0.005em]">
          {date.toLocaleDateString("en-GB", { weekday: "short" })}
          {isToday && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">today</span>}
        </p>
        <p className="text-[11px] text-muted-foreground tabular-nums">{date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
      </div>
      <div className="mt-3 space-y-1.5">
        {items.length === 0 && (
          <p className="rounded-xl bg-foreground/[0.025] px-3 py-2.5 text-[12px] text-foreground/45">
            nothing planned. one tiny idea is enough.
          </p>
        )}
        {items.map((i) => (
          <div key={i.id} className="group flex items-start gap-2 rounded-xl bg-foreground/[0.03] px-2.5 py-2 text-[13px] transition hover:bg-foreground/[0.05]">
            <button
              onClick={() => onToggle(i.id, !i.done)}
              aria-label={i.done ? "Mark undone" : "Mark done"}
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-300 active:scale-90",
                i.done
                  ? "border-[oklch(0.6_0.16_155)] bg-[oklch(0.6_0.16_155)] text-white scale-105"
                  : "border-foreground/25 hover:border-foreground/55"
              )}
            >
              {i.done && <Check className="h-3 w-3" strokeWidth={3} />}
            </button>
            <p className={cn("flex-1 leading-snug", i.done && "line-through text-muted-foreground/70")}>{i.idea}</p>
            <button
              onClick={() => onDelete(i.id)}
              aria-label="Delete"
              className="text-foreground/30 opacity-0 transition group-hover:opacity-100 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (val.trim()) { onAdd(val.trim()); setVal(""); } }} className="mt-3 flex gap-1.5">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add a tiny idea…" className="h-9 rounded-full border-border/50 bg-background text-[12.5px] placeholder:text-foreground/40" />
        <Button type="submit" size="sm" variant="ghost" className="h-9 w-9 rounded-full p-0 hover:bg-foreground/[0.06]"><Plus className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}