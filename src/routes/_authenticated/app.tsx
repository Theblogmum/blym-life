import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Flame, FileEdit, Send, Target, Calendar, Wand2, Lightbulb,
  FileText, BarChart3, DollarSign, FolderOpen, Trophy, Heart, Check,
  ArrowRight, Plus, X, ChevronDown, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDashboard, saveGoal, deleteGoal, updateGoalProgress,
  saveFollowUp, toggleFollowUp, deleteFollowUp, togglePlan,
} from "@/lib/dashboard.functions";
import { getMe } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/app")({ component: HomePage });

const TRENDS = [
  { tag: "Reels", title: "Morning routine as a creator", uses: "7.2K uses", tint: "var(--surface-blush)" },
  { tag: "TikTok", title: "POV: You found your niche", uses: "5.8K uses", tint: "var(--surface-peach)" },
  { tag: "Carousel", title: "Day in the life of a content creator", uses: "4.9K uses", tint: "var(--surface-butter)" },
];

const QUICK_TOOLS = [
  { to: "/generator", label: "AI Generator", icon: Wand2 },
  { to: "/viral-lab", label: "Viral Lab", icon: Flame },
  { to: "/passive-ideas", label: "Content Ideas", icon: Lightbulb },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/planner", label: "Planner", icon: Calendar },
  { to: "/pitch-generator", label: "Brand Pitch", icon: Send },
  { to: "/insights", label: "Analytics", icon: BarChart3 },
  { to: "/income-tracker", label: "Revenue Hub", icon: DollarSign },
  { to: "/portfolio", label: "Resources", icon: FolderOpen },
];

function HomePage() {
  const fetchDash = useServerFn(getDashboard);
  const fetchMe = useServerFn(getMe);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["dashboard"] });

  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });

  useEffect(() => {
    if (me.data?.profile && !me.data.profile.onboarded) navigate({ to: "/onboarding" });
  }, [me.data, navigate]);

  const togPlan = useServerFn(togglePlan);

  const today = new Date();
  const greet = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";
  const d = dash.data;
  const name = d?.name?.split(" ")[0] ?? "lovely";

  // Weekly overview — last 7 days completion
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDow = (today.getDay() + 6) % 7; // Mon=0
  const tasksDoneByDay = (() => {
    const arr: (boolean | null)[] = [];
    for (let i = 0; i < 7; i++) {
      if (i < todayDow) arr.push(true);
      else if (i === todayDow) arr.push((d?.todays_tasks.length ?? 0) > 0 && d?.todays_tasks.every((t) => t.done) ? true : null);
      else arr.push(null);
    }
    return arr;
  })();

  const monthlyGoal = d?.goals?.[0];
  const monthlyPct = monthlyGoal
    ? Math.min(100, Math.round((Number(monthlyGoal.current_value) / Math.max(1, Number(monthlyGoal.target_value))) * 100))
    : 0;

  return (
    <div className="relative mx-auto max-w-[1400px] px-5 pb-32 pt-8 lg:px-10 lg:pt-10">
      {/* ============ Greeting ============ */}
      <header className="mb-8">
        <h1 className="font-display text-4xl font-normal tracking-tight text-foreground sm:text-[42px]">
          {greet}, <span className="capitalize">{name}</span>{" "}
          <Heart className="ml-1 inline h-7 w-7 fill-primary text-primary align-middle" />
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">You've got this. Let's make today amazing.</p>
      </header>

      {/* ============ Stat row ============ */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Content Streak"
          value={String(d?.streak ?? 0)}
          unit="days"
          sub={d?.streak ? "Keep going! You're crushing it!" : "Post today to start a streak"}
          trend="up"
        />
        <StatCard
          icon={FileEdit}
          label="Posts Created"
          value={String(d?.posts_last_7 ?? 0)}
          unit="this week"
          sub={`${d?.todays_tasks.length ?? 0} planned today`}
          trend="up"
        />
        <StatCard
          icon={Send}
          label="Follow-ups"
          value={String(d?.follow_ups.length ?? 0)}
          unit="due"
          sub={d?.follow_ups[0]?.brand ?? "All caught up"}
          trend="up"
        />
        <StatCard
          icon={Target}
          label={monthlyGoal?.title ?? "Monthly Goal"}
          value={`${monthlyPct}%`}
          unit=""
          sub={monthlyGoal ? `${Number(monthlyGoal.current_value).toLocaleString()} / ${Number(monthlyGoal.target_value).toLocaleString()}${monthlyGoal.unit ?? ""}` : "Set a goal below"}
          progress={monthlyPct}
        />
      </section>

      {/* ============ Mid grid: Today's Plan / Quick Access / Weekly+Wins ============ */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Today's Plan */}
        <Card className="lg:col-span-1">
          <CardHead icon={Calendar} title="Today's Plan" cta={{ to: "/planner", label: "View full planner" }} />
          {d?.todays_tasks.length === 0 ? (
            <Empty text="Nothing planned for today." to="/planner" cta="Open planner" />
          ) : (
            <ul className="mt-4 space-y-2.5">
              {d?.todays_tasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  <button
                    onClick={() => togPlan({ data: { id: t.id, done: !t.done } }).then(refresh)}
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${t.done ? "border-primary bg-primary text-primary-foreground" : "border-foreground/25 hover:border-primary"}`}
                    aria-label="Toggle"
                  >
                    {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>
                  <span className={`flex-1 truncate text-[14px] ${t.done ? "text-muted-foreground line-through" : "text-foreground/85"}`}>
                    {t.idea}
                  </span>
                  <span className="shrink-0 rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {t.slot_label || "Plan"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Quick Access */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-xl font-normal tracking-tight">Quick Access</h3>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {QUICK_TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className="group flex flex-col items-center gap-2 rounded-2xl p-2.5 transition hover:bg-secondary">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/8 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <t.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-center text-[11.5px] font-medium leading-tight text-foreground/80">{t.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Weekly + Wins stack */}
        <div className="space-y-5">
          {/* Weekly overview */}
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-normal tracking-tight">Weekly Overview</h3>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">This Week <ChevronDown className="h-3 w-3" /></span>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {dayLabels.map((l, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">{l}</span>
                  <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-semibold ${
                    tasksDoneByDay[i] === true
                      ? "bg-primary text-primary-foreground"
                      : tasksDoneByDay[i] === null && i === todayDow
                      ? "ring-2 ring-primary/40 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {tasksDoneByDay[i] === true ? <Check className="h-4 w-4" strokeWidth={3} /> : l}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-foreground/70">
              You're doing amazing this week! <Heart className="inline h-3 w-3 fill-primary text-primary" />
            </p>
          </Card>

          {/* Creator Wins */}
          <Card>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <h3 className="font-display text-xl font-normal tracking-tight">Creator Wins</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {(d?.wins ?? []).slice(0, 3).map((w, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10">
                    <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
                  </span>
                  <span className="flex-1 text-[13px] text-foreground/85">{w}</span>
                </li>
              ))}
            </ul>
            <Link to="/wins">
              <Button variant="ghost" className="mt-4 w-full rounded-full bg-primary/8 font-semibold text-primary hover:bg-primary/15">
                Celebrate your win
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* ============ Trending Now ============ */}
      <section className="mt-6">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <h3 className="font-display text-xl font-normal tracking-tight">Trending Now</h3>
            </div>
            <Link to="/viral-lab" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-1.5 transition-all">
              See all trends <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {TRENDS.map((t, i) => (
              <Link key={i} to="/viral-lab" className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-secondary">
                <span
                  className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl"
                  style={{ background: t.tint }}
                >
                  <Flame className="h-6 w-6 text-primary/70" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{t.title}</p>
                  <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <TrendingUp className="h-3 w-3" />{t.uses}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* ============ Goals + Follow-ups ============ */}
      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHead icon={Target} title="Current Goals" />
          {d?.goals.length === 0 ? <Empty text="Set your first goal — even a tiny one counts." /> : (
            <ul className="mt-4 space-y-3">
              {d?.goals.map((g) => <GoalRow key={g.id} g={g} onChange={refresh} />)}
            </ul>
          )}
          <GoalAdder onAdded={refresh} />
        </Card>

        <Card>
          <CardHead icon={Send} title="Follow-ups" />
          {d?.follow_ups.length === 0 ? (
            <Empty text="Inbox at peace." />
          ) : (
            <ul className="mt-4 space-y-2.5">
              {d?.follow_ups.map((f) => {
                const overdue = f.due_date < new Date().toISOString().slice(0, 10);
                return (
                  <li key={f.id} className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{f.title}</p>
                      <p className={`text-[11px] ${overdue ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                        {f.brand ? `${f.brand} · ` : ""}{overdue ? "Overdue · " : "Due "}
                        {new Date(f.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <FollowUpAdder onAdded={refresh} />
        </Card>
      </section>

      {/* ============ Sticky CTA banner ============ */}
      <div className="fixed inset-x-0 bottom-0 z-20 lg:left-72">
        <div className="px-5 pb-4 lg:px-10">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-4 rounded-2xl bg-primary/12 px-5 py-4 backdrop-blur-xl ring-1 ring-primary/20">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[16px] font-medium leading-tight">Feeling stuck? Let's fix that.</p>
              <p className="mt-0.5 text-[12.5px] text-foreground/70">Use the AI Generator to get fresh ideas, hooks, scripts & captions in seconds.</p>
            </div>
            <Link to="/generator">
              <Button className="rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90">
                Open AI Generator <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Subcomponents ============

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-[var(--shadow-xs)] ${className}`}>
      {children}
    </div>
  );
}

function CardHead({ icon: Icon, title, cta }: { icon: typeof Heart; title: string; cta?: { to: string; label: string } }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
        <h3 className="font-display text-xl font-normal tracking-tight">{title}</h3>
      </div>
      {cta && (
        <Link to={cta.to} className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all hover:gap-1.5">
          {cta.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, unit, sub, trend, progress,
}: { icon: typeof Heart; label: string; value: string; unit: string; sub: string; trend?: "up" | "down"; progress?: number }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-xs)] transition hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="text-[13px] font-medium text-foreground/80">{label}</span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[34px] font-normal leading-none tracking-tight">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {trend && <Sparkline trend={trend} />}
      </div>
      {progress != null && <Progress value={progress} className="mt-3 h-1.5" />}
      <p className="mt-2.5 truncate text-[11.5px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function Sparkline({ trend }: { trend: "up" | "down" }) {
  const path = trend === "up"
    ? "M0 18 L10 14 L20 16 L30 9 L40 11 L50 4 L60 6"
    : "M0 4 L10 8 L20 6 L30 13 L40 10 L50 17 L60 14";
  return (
    <svg viewBox="0 0 60 22" className="h-6 w-16 shrink-0" fill="none">
      <path d={path} stroke="oklch(0.74 0.15 8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Empty({ text, to, cta }: { text: string; to?: string; cta?: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border/70 p-6 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      {to && cta && <Link to={to}><Button size="sm" variant="outline" className="mt-3 rounded-full">{cta}</Button></Link>}
    </div>
  );
}

function GoalRow({ g, onChange }: { g: { id: string; title: string; kind: string; current_value: number; target_value: number; unit: string | null; deadline: string | null }; onChange: () => void }) {
  const upd = useServerFn(updateGoalProgress);
  const del = useServerFn(deleteGoal);
  const pct = Math.min(100, Math.round((Number(g.current_value) / Math.max(1, Number(g.target_value))) * 100));
  const [val, setVal] = useState(String(g.current_value));
  const [edit, setEdit] = useState(false);
  return (
    <li className="rounded-2xl bg-secondary/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">{g.kind.replace("_", " ")}</p>
          <p className="mt-0.5 truncate text-sm font-medium">{g.title}</p>
        </div>
        <button onClick={() => del({ data: { id: g.id } }).then(onChange)} className="text-muted-foreground transition hover:text-destructive" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs">
        <span className="font-medium">{Number(g.current_value).toLocaleString()}{g.unit ?? ""} <span className="text-muted-foreground">/ {Number(g.target_value).toLocaleString()}{g.unit ?? ""}</span></span>
        <span className="font-semibold text-primary">{pct}%</span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" />
      {edit ? (
        <div className="mt-3 flex gap-1.5">
          <Input value={val} onChange={(e) => setVal(e.target.value)} type="number" className="h-8 rounded-lg text-xs" />
          <Button size="sm" className="h-8 rounded-lg" onClick={() => { upd({ data: { id: g.id, current_value: Number(val) || 0 } }).then(() => { setEdit(false); onChange(); }); }}>Save</Button>
        </div>
      ) : (
        <button onClick={() => setEdit(true)} className="mt-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary">Update progress</button>
      )}
    </li>
  );
}

function GoalAdder({ onAdded }: { onAdded: () => void }) {
  const save = useServerFn(saveGoal);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("followers");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  if (!open) return <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"><Plus className="h-3.5 w-3.5" />Add goal</button>;
  return (
    <div className="mt-4 grid gap-2 rounded-2xl border border-border/60 p-4 sm:grid-cols-2">
      <div className="space-y-1"><Label className="text-xs">Goal</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hit 10k IG followers" className="h-9 rounded-lg" /></div>
      <div className="space-y-1"><Label className="text-xs">Kind</Label>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm">
          <option value="followers">Followers</option><option value="monthly_income">Monthly income</option>
          <option value="posts_month">Posts / month</option><option value="brand_deals">Brand deals</option><option value="custom">Custom</option>
        </select>
      </div>
      <div className="space-y-1"><Label className="text-xs">Target</Label><Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="10000" className="h-9 rounded-lg" /></div>
      <div className="space-y-1"><Label className="text-xs">Unit</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="£, followers…" className="h-9 rounded-lg" /></div>
      <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-9 rounded-lg" /></div>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" className="rounded-full" disabled={!title || !target} onClick={async () => {
          try { await save({ data: { title, kind, target_value: Number(target), unit: unit || undefined, deadline: deadline || undefined } });
            setTitle(""); setTarget(""); setUnit(""); setDeadline(""); setOpen(false); onAdded(); toast.success("Goal added"); }
          catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
        }}>Save</Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function FollowUpAdder({ onAdded }: { onAdded: () => void }) {
  const save = useServerFn(saveFollowUp);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  if (!open) return <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"><Plus className="h-3.5 w-3.5" />Add follow-up</button>;
  return (
    <div className="mt-4 grid gap-2 rounded-2xl border border-border/60 p-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reply to ASOS pitch" className="h-9 rounded-lg" />
      <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand (optional)" className="h-9 rounded-lg" />
      <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-9 rounded-lg" />
      <div className="flex gap-2">
        <Button size="sm" className="rounded-full" disabled={!title} onClick={async () => {
          try { await save({ data: { title, brand: brand || undefined, due_date: due } });
            setTitle(""); setBrand(""); setOpen(false); onAdded(); toast.success("Added"); }
          catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
        }}>Save</Button>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

// silence unused imports referenced only in types


