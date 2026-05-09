import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Flame, ListChecks, MailCheck, Lightbulb, Trophy, Target,
  Wallet, Plus, Check, X, Camera, ChevronRight, Sunrise,
} from "lucide-react";
import { toast } from "sonner";
import { getDashboard, saveGoal, deleteGoal, updateGoalProgress, saveFollowUp, toggleFollowUp, deleteFollowUp, togglePlan } from "@/lib/dashboard.functions";
import { getMe } from "@/lib/profile.functions";
import { XpBadge } from "@/components/xp-badge";

export const Route = createFileRoute("/_authenticated/app")({ component: HomePage });

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
  const togFu = useServerFn(toggleFollowUp);
  const delFu = useServerFn(deleteFollowUp);

  const today = new Date();
  const greet = today.getHours() < 12 ? "Morning" : today.getHours() < 18 ? "Afternoon" : "Evening";
  const dateStr = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const d = dash.data;

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:py-10">
      {/* Hero */}
      <section className="rounded-3xl bg-[image:var(--gradient-warm)] p-6 text-white shadow-[var(--shadow-soft)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">{dateStr}</p>
            <h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">
              {greet}{d?.name ? `, ${d.name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="mt-1 max-w-md text-sm text-white/85">Your Creator OS — what's on, what's working, what's next.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/film-this"><Button variant="secondary" className="rounded-full"><Camera className="mr-1.5 h-4 w-4" />Film this</Button></Link>
            <Link to="/motivation"><Button variant="secondary" className="rounded-full"><Sunrise className="mr-1.5 h-4 w-4" />Motivation</Button></Link>
            <Link to="/wins"><Button variant="secondary" className="rounded-full"><Trophy className="mr-1.5 h-4 w-4" />Wins</Button></Link>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <HeroStat icon={Flame} label="Posting streak" value={`${d?.streak ?? 0}d`} sub={`${d?.posts_last_7 ?? 0} posts this week`} />
          <HeroStat icon={ListChecks} label="Today's tasks" value={`${d?.todays_tasks.length ?? 0}`} sub={`${d?.upcoming_tasks.length ?? 0} upcoming`} />
          <HeroStat icon={MailCheck} label="Follow-ups due" value={`${d?.follow_ups.length ?? 0}`} sub={d?.follow_ups[0]?.brand ?? "All clear"} />
          <HeroStat icon={Wallet} label="Income (month)" value={`£${(d?.income_this_month ?? 0).toLocaleString()}`} sub="Logged in tracker" />
        </div>
      </section>

      {/* XP + Wins ribbon */}
      <div className="mt-5"><XpBadge /></div>
      {d && (
        <Card className="mt-4 rounded-3xl border-0 bg-[image:var(--gradient-mint)] p-4 text-white">
          <div className="flex items-start gap-3">
            <Trophy className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex flex-wrap gap-2">
              {d.wins.map((w, i) => <span key={i} className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold backdrop-blur">{w}</span>)}
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Today's tasks */}
        <Card className="rounded-3xl p-5 lg:col-span-2">
          <Header icon={ListChecks} title="Today's tasks" cta={{ label: "Planner", to: "/planner" }} />
          {d?.todays_tasks.length === 0 ? (
            <Empty text="Nothing on for today. Add ideas in your weekly planner." to="/planner" cta="Open planner" />
          ) : (
            <ul className="mt-3 space-y-2">
              {d?.todays_tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-3">
                  <button onClick={() => togPlan({ data: { id: t.id, done: !t.done } }).then(refresh)}
                    className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 ${t.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                    {t.done && <Check className="h-3 w-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.idea}</p>
                    {t.hook && <p className="text-xs text-muted-foreground">"{t.hook}"</p>}
                  </div>
                  {t.slot_label && <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.slot_label}</span>}
                </li>
              ))}
            </ul>
          )}

          {d && d.upcoming_tasks.length > 0 && (
            <div className="mt-5 border-t border-border/40 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coming up</p>
              <ul className="mt-2 space-y-1.5">
                {d.upcoming_tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{t.idea}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(t.plan_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Follow-ups */}
        <Card className="rounded-3xl p-5">
          <Header icon={MailCheck} title="Follow-ups" />
          {d?.follow_ups.length === 0 ? (
            <Empty text="No follow-ups due." />
          ) : (
            <ul className="mt-3 space-y-2">
              {d?.follow_ups.map((f) => {
                const overdue = f.due_date < new Date().toISOString().slice(0, 10);
                return (
                  <li key={f.id} className="rounded-2xl bg-secondary/40 p-3">
                    <div className="flex items-start gap-2">
                      <button onClick={() => togFu({ data: { id: f.id, done: true } }).then(refresh)}
                        className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-muted-foreground/30 hover:border-primary"><Check className="h-3 w-3 opacity-0 hover:opacity-100" /></button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{f.title}</p>
                        {f.brand && <p className="text-xs text-muted-foreground">{f.brand}</p>}
                        <p className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider ${overdue ? "text-rose-600" : "text-muted-foreground"}`}>
                          {overdue ? "Overdue · " : "Due "}{new Date(f.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <button onClick={() => delFu({ data: { id: f.id } }).then(refresh)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <FollowUpAdder onAdded={refresh} />
        </Card>

        {/* Goals */}
        <Card className="rounded-3xl p-5 lg:col-span-2">
          <Header icon={Target} title="Current goals" />
          {d?.goals.length === 0 ? <Empty text="No goals yet. Set one below — even a tiny one counts." /> : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {d?.goals.map((g) => <GoalRow key={g.id} g={g} onChange={refresh} />)}
            </ul>
          )}
          <GoalAdder onAdded={refresh} />
        </Card>

        {/* Monetisation snapshot */}
        <Card className="rounded-3xl p-5">
          <Header icon={Wallet} title="Monetisation" cta={{ label: "Tracker", to: "/income-tracker" }} />
          <div className="mt-3">
            <p className="font-display text-3xl font-black">£{(d?.income_this_month ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">This month, across logged income</p>
          </div>
          {d && Object.keys(d.income_by_currency).length > 1 && (
            <ul className="mt-3 space-y-1 text-xs">
              {Object.entries(d.income_by_currency).map(([c, v]) => (
                <li key={c} className="flex justify-between rounded-lg bg-secondary/40 px-2 py-1"><span>{c}</span><span className="font-semibold">{v.toLocaleString()}</span></li>
              ))}
            </ul>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/invoices"><Button variant="outline" size="sm" className="w-full rounded-full">Invoice</Button></Link>
            <Link to="/affiliates"><Button variant="outline" size="sm" className="w-full rounded-full">Affiliates</Button></Link>
          </div>
        </Card>

        {/* Ideas waiting */}
        <Card className="rounded-3xl p-5 lg:col-span-2">
          <Header icon={Lightbulb} title="Ideas waiting on you" cta={{ label: "Generator", to: "/generator" }} />
          {d?.ideas_waiting.length === 0 ? <Empty text="No saved ideas. Use the Generator and hit save." to="/generator" cta="Open Generator" /> : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {d?.ideas_waiting.slice(0, 6).map((i) => (
                <li key={i.id} className="rounded-2xl bg-secondary/40 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{i.kind}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold">{i.title || i.body.slice(0, 80)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Today's brief */}
        <Card className="rounded-3xl border-0 bg-[image:var(--gradient-bloom)] p-5 text-white lg:col-span-1">
          <div className="flex items-center gap-2"><Camera className="h-4 w-4" /><p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Film today</p></div>
          {d?.today_brief ? (
            <>
              <p className="mt-2 font-display text-xl font-black leading-snug">{d.today_brief.film}</p>
              <p className="mt-2 text-sm text-white/85">"{d.today_brief.hook}"</p>
              <Link to="/film-this"><Button variant="secondary" size="sm" className="mt-4 rounded-full">Open brief <ChevronRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-white/85">No brief yet. Get one in 5 seconds.</p>
              <Link to="/film-this"><Button variant="secondary" size="sm" className="mt-4 rounded-full"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Generate brief</Button></Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function HeroStat({ icon: Icon, label, value, sub }: { icon: typeof Flame; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
      <div className="flex items-center gap-1.5 text-white/80"><Icon className="h-3.5 w-3.5" /><p className="text-[10px] font-bold uppercase tracking-wider">{label}</p></div>
      <p className="mt-1 font-display text-2xl font-black leading-none">{value}</p>
      <p className="mt-1 truncate text-[11px] text-white/70">{sub}</p>
    </div>
  );
}

function Header({ icon: Icon, title, cta }: { icon: typeof Flame; title: string; cta?: { label: string; to: string } }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-primary"><Icon className="h-4 w-4" /></span>
        <h3 className="font-display text-lg font-black">{title}</h3>
      </div>
      {cta && <Link to={cta.to} className="text-xs font-semibold text-primary hover:underline">{cta.label} →</Link>}
    </div>
  );
}

function Empty({ text, to, cta }: { text: string; to?: string; cta?: string }) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-border/60 p-5 text-center">
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
    <li className="rounded-2xl bg-secondary/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{g.kind.replace("_", " ")}</p>
          <p className="truncate text-sm font-semibold">{g.title}</p>
        </div>
        <button onClick={() => del({ data: { id: g.id } }).then(onChange)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-bold">{Number(g.current_value).toLocaleString()}{g.unit ?? ""} <span className="text-muted-foreground">/ {Number(g.target_value).toLocaleString()}{g.unit ?? ""}</span></span>
        <span className="font-bold text-primary">{pct}%</span>
      </div>
      <Progress value={pct} className="mt-2 h-2" />
      {edit ? (
        <div className="mt-2 flex gap-1">
          <Input value={val} onChange={(e) => setVal(e.target.value)} type="number" className="h-7 rounded-lg text-xs" />
          <Button size="sm" className="h-7 rounded-lg" onClick={() => { upd({ data: { id: g.id, current_value: Number(val) || 0 } }).then(() => { setEdit(false); onChange(); }); }}>Save</Button>
        </div>
      ) : (
        <button onClick={() => setEdit(true)} className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary">Update progress</button>
      )}
      {g.deadline && <p className="mt-1 text-[10px] text-muted-foreground">By {new Date(g.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>}
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
  if (!open) return <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground"><Plus className="h-3.5 w-3.5" />Add goal</button>;
  return (
    <div className="mt-4 grid gap-2 rounded-2xl border border-border/50 p-3 sm:grid-cols-2">
      <div className="space-y-1"><Label className="text-xs">Goal</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hit 10k IG followers" className="h-9 rounded-lg" /></div>
      <div className="space-y-1"><Label className="text-xs">Kind</Label>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm">
          <option value="followers">Followers</option><option value="monthly_income">Monthly income</option>
          <option value="posts_month">Posts / month</option><option value="brand_deals">Brand deals</option><option value="custom">Custom</option>
        </select>
      </div>
      <div className="space-y-1"><Label className="text-xs">Target</Label><Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="10000" className="h-9 rounded-lg" /></div>
      <div className="space-y-1"><Label className="text-xs">Unit (optional)</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="£, followers, posts…" className="h-9 rounded-lg" /></div>
      <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Deadline (optional)</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-9 rounded-lg" /></div>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" className="rounded-full" disabled={!title || !target} onClick={async () => {
          try { await save({ data: { title, kind, target_value: Number(target), unit: unit || undefined, deadline: deadline || undefined } });
            setTitle(""); setTarget(""); setUnit(""); setDeadline(""); setOpen(false); onAdded(); toast.success("Goal added"); }
          catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
        }}>Save goal</Button>
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
  if (!open) return <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground"><Plus className="h-3.5 w-3.5" />Add follow-up</button>;
  return (
    <div className="mt-3 grid gap-2 rounded-2xl border border-border/50 p-3">
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