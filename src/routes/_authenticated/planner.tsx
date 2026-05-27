import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, Check, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { listWeek, upsertPlan, togglePlanDone, deletePlan } from "@/lib/planner.functions";
import { getUsageToday } from "@/lib/usage.functions";
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
function startOfMonth(d: Date) { const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0,0,0,0); return x; }
function endOfMonth(d: Date) { const x = new Date(d.getFullYear(), d.getMonth() + 1, 0); x.setHours(0,0,0,0); return x; }

function PlannerPage() {
  const list = useServerFn(listWeek);
  const upsert = useServerFn(upsertPlan);
  const toggle = useServerFn(togglePlanDone);
  const del = useServerFn(deletePlan);
  const fetchUsage = useServerFn(getUsageToday);
  const qc = useQueryClient();

  const [view, setView] = useState<"week" | "month">("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const tier = (usage.data?.tier ?? "free") as string;
  const canMonthly = tier !== "free";

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  }), [weekStart]);

  const monthStartDate = useMemo(() => startOfMonth(monthAnchor), [monthAnchor]);
  const monthEndDate = useMemo(() => endOfMonth(monthAnchor), [monthAnchor]);

  const start = view === "week" ? fmt(days[0]) : fmt(monthStartDate);
  const end = view === "week" ? fmt(days[6]) : fmt(monthEndDate);

  const q = useQuery({
    queryKey: [view, start, end],
    queryFn: () => list({ data: { start, end } }),
  });

  const items = (q.data?.items ?? []) as any[];
  const byDay = (d: string) => items.filter((i) => i.plan_date === d);

  const add = useMutation({
    mutationFn: (p: { plan_date: string; idea: string }) => upsert({ data: p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [view, start, end] }),
    onError: (e: any) => toast.error(e.message),
  });
  const tog = useMutation({
    mutationFn: (p: { id: string; done: boolean }) => toggle({ data: p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [view, start, end] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [view, start, end] }),
  });

  return (
    <div>
      <PageHero
        icon={CalendarDays}
        eyebrow={view === "week" ? "this week" : "this month"}
        title={view === "week" ? "Weekly planner" : "Monthly planner"}
        description="Your content week — sorted, soft, and one tap away."
        variant="sky"
      />
      <div className="page-shell">
        <div className="section-block flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{view === "week" ? "week of" : "month of"}</p>
            <p className="mt-1.5 font-display text-[18px] font-bold tracking-[-0.01em] sm:text-[20px]">
              {view === "week"
                ? `${days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                : monthAnchor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-border/60 bg-card p-0.5 shadow-[var(--shadow-xs)]">
              <button
                onClick={() => setView("week")}
                className={cn(
                  "rounded-full px-3.5 py-1 text-[12px] font-semibold transition",
                  view === "week" ? "bg-foreground text-background" : "text-foreground/65 hover:text-foreground",
                )}
              >Week</button>
              <button
                onClick={() => canMonthly ? setView("month") : toast.message("Monthly view is on Creator (£6.99/mo) and up.")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-[12px] font-semibold transition",
                  view === "month" ? "bg-foreground text-background" : "text-foreground/65 hover:text-foreground",
                )}
              >Month{!canMonthly && <Lock className="h-3 w-3" />}</button>
            </div>
            {view === "week" ? (
              <>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}>← Prev</Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}>Next →</Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1))}>← Prev</Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1))}>Next →</Button>
              </>
            )}
          </div>
        </div>

        {view === "week" ? (
          <div className="grid gap-3 sm:gap-3.5 md:grid-cols-2 lg:grid-cols-3">
            {days.map((d) => {
              const key = fmt(d);
              return (
                <DayCard
                  key={key}
                  date={d}
                  items={byDay(key)}
                  onAdd={(idea) => add.mutate({ plan_date: key, idea })}
                  onToggle={(id, done) => tog.mutate({ id, done })}
                  onDelete={(id) => remove.mutate(id)}
                />
              );
            })}
          </div>
        ) : canMonthly ? (
          <MonthGrid
            anchor={monthAnchor}
            byDay={byDay}
            onAdd={(date, idea) => add.mutate({ plan_date: date, idea })}
            onToggle={(id, done) => tog.mutate({ id, done })}
            onDelete={(id) => remove.mutate(id)}
          />
        ) : (
          <div className="soft-card mx-auto max-w-xl p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-foreground/[0.05]"><Lock className="h-5 w-5 text-foreground/60" /></div>
            <p className="mt-3 font-display text-[18px] font-bold tracking-[-0.005em]">Monthly view is a Creator perk</p>
            <p className="mt-1.5 text-[13px] text-muted-foreground">Upgrade to Creator (£6.99/mo) to plan your whole month at a glance — weekly view stays free.</p>
            <Link to="/settings"><Button className="mt-4 rounded-full">Upgrade</Button></Link>
          </div>
        )}
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

function MonthGrid({
  anchor,
  byDay,
  onAdd,
  onToggle,
  onDelete,
}: {
  anchor: Date;
  byDay: (d: string) => any[];
  onAdd: (date: string, idea: string) => void;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const first = startOfMonth(anchor);
  const last = endOfMonth(anchor);
  const leading = (first.getDay() + 6) % 7; // Mon=0
  const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - leading + 1;
    if (dayNum < 1 || dayNum > last.getDate()) cells.push(null);
    else cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), dayNum));
  }
  const todayKey = fmt(new Date());
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [val, setVal] = useState("");
  return (
    <div className="soft-card overflow-hidden p-3 sm:p-4">
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/55">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d} className="py-1.5">{d}</div>)}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="min-h-[88px] rounded-xl bg-foreground/[0.015]" />;
          const key = fmt(d);
          const dayItems = byDay(key);
          const isToday = key === todayKey;
          const isOpen = openKey === key;
          return (
            <button
              key={key}
              onClick={() => { setOpenKey(isOpen ? null : key); setVal(""); }}
              className={cn(
                "group relative min-h-[88px] rounded-xl border bg-card p-2 text-left transition hover:-translate-y-[1px] hover:shadow-[var(--shadow-xs)]",
                isToday ? "border-primary/50" : "border-border/40",
                isOpen && "ring-2 ring-primary/40",
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("text-[11.5px] font-bold tabular-nums", isToday && "text-primary")}>{d.getDate()}</span>
                {dayItems.length > 0 && (
                  <span className="rounded-full bg-foreground/[0.06] px-1.5 py-0.5 text-[9px] font-semibold text-foreground/70">{dayItems.length}</span>
                )}
              </div>
              <div className="mt-1 space-y-0.5">
                {dayItems.slice(0, 2).map((i) => (
                  <p key={i.id} className={cn("truncate text-[10.5px] leading-tight text-foreground/75", i.done && "line-through text-foreground/40")}>{i.idea}</p>
                ))}
                {dayItems.length > 2 && <p className="text-[9.5px] text-foreground/45">+{dayItems.length - 2} more</p>}
              </div>
            </button>
          );
        })}
      </div>

      {openKey && (
        <div className="mt-4 rounded-2xl border border-border/50 bg-card p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-[15px] font-bold tracking-[-0.005em]">
              {new Date(openKey).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <button onClick={() => setOpenKey(null)} className="text-[11px] text-muted-foreground hover:text-foreground">close</button>
          </div>
          <div className="mt-2 space-y-1.5">
            {byDay(openKey).length === 0 && (
              <p className="rounded-xl bg-foreground/[0.025] px-3 py-2.5 text-[12px] text-foreground/45">nothing planned. one tiny idea is enough.</p>
            )}
            {byDay(openKey).map((i) => (
              <div key={i.id} className="group flex items-start gap-2 rounded-xl bg-foreground/[0.03] px-2.5 py-2 text-[13px] transition hover:bg-foreground/[0.05]">
                <button
                  onClick={() => onToggle(i.id, !i.done)}
                  aria-label={i.done ? "Mark undone" : "Mark done"}
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all duration-300 active:scale-90",
                    i.done ? "border-[oklch(0.6_0.16_155)] bg-[oklch(0.6_0.16_155)] text-white" : "border-foreground/25 hover:border-foreground/55",
                  )}
                >{i.done && <Check className="h-3 w-3" strokeWidth={3} />}</button>
                <p className={cn("flex-1 leading-snug", i.done && "line-through text-muted-foreground/70")}>{i.idea}</p>
                <button onClick={() => onDelete(i.id)} aria-label="Delete" className="text-foreground/30 opacity-0 transition group-hover:opacity-100 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (val.trim()) { onAdd(openKey, val.trim()); setVal(""); } }} className="mt-3 flex gap-1.5">
            <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add a tiny idea…" className="h-9 rounded-full border-border/50 bg-background text-[12.5px] placeholder:text-foreground/40" />
            <Button type="submit" size="sm" variant="ghost" className="h-9 w-9 rounded-full p-0 hover:bg-foreground/[0.06]"><Plus className="h-4 w-4" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}