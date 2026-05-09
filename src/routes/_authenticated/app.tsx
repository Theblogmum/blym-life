import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Flame, ListChecks, MailCheck, Lightbulb, Trophy, Target,
  Wallet, Plus, Check, X, Camera, ChevronRight, Sunrise, TrendingUp,
  Wand2, FileText, MessageSquareHeart, Calendar, Quote, ArrowUpRight,
  Heart, Scissors, Mic, Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDashboard, saveGoal, deleteGoal, updateGoalProgress,
  saveFollowUp, toggleFollowUp, deleteFollowUp, togglePlan,
} from "@/lib/dashboard.functions";
import { getMe } from "@/lib/profile.functions";
import { XpBadge } from "@/components/xp-badge";

export const Route = createFileRoute("/_authenticated/app")({ component: HomePage });

// ---- Curated rotating content (deterministic by day) ----
const TRENDS = [
  { tag: "Reels", title: "POV captions outperforming voiceovers", note: "Quiet, text-led storytelling is back." },
  { tag: "TikTok", title: "Slow morning routines + soft lo-fi audio", note: "Average watch-time up 22% this week." },
  { tag: "Pinterest", title: "Editorial flatlays with handwritten notes", note: "Saves spiking on cosy lifestyle pins." },
  { tag: "Instagram", title: "Carousel 'unhinged thoughts' essays", note: "Comments 3× higher than reels." },
  { tag: "YouTube Shorts", title: "Whisper ASMR product reveals", note: "Strong retention for UGC creators." },
  { tag: "Reels", title: "Day-in-the-life with narrated journal entries", note: "Reaching saved + shared milestones fast." },
  { tag: "TikTok", title: "Get-ready-with-me 'unfiltered' confessionals", note: "High follow rate from new viewers." },
];
const QUOTES = [
  { q: "Showing up softly is still showing up.", a: "Daily reminder" },
  { q: "Your taste is your edge — protect it.", a: "Creator note" },
  { q: "One small post today beats the perfect post never.", a: "Bloom" },
  { q: "You don't need a bigger audience. You need a deeper one.", a: "Strategy whisper" },
  { q: "The algorithm rewards consistency, not perfection.", a: "Quiet truth" },
  { q: "Make it look easy. The hard part is yours alone.", a: "Editor's note" },
  { q: "A creative life is built one Tuesday at a time.", a: "Bloom" },
];
function pickByDay<T>(arr: T[]): T {
  const day = Math.floor(Date.now() / 86400000);
  return arr[day % arr.length];
}
function pickTrends(n = 3): typeof TRENDS {
  const day = Math.floor(Date.now() / 86400000);
  return Array.from({ length: n }, (_, i) => TRENDS[(day + i) % TRENDS.length]);
}

const AI_TOOLS = [
  { to: "/generator", label: "Idea Generator", icon: Wand2, tint: "surface-blush" },
  { to: "/film-this", label: "Film This", icon: Camera, tint: "surface-peach" },
  { to: "/viral-lab", label: "Viral Lab", icon: TrendingUp, tint: "surface-butter" },
  { to: "/repurpose", label: "Repurpose", icon: Scissors, tint: "surface-mint" },
  { to: "/script-tightener", label: "Script Tightener", icon: Mic, tint: "surface-sky" },
  { to: "/cta-generator", label: "CTA Lines", icon: Zap, tint: "surface-plum" },
  { to: "/pitch-generator", label: "Brand Pitch", icon: FileText, tint: "surface-stone" },
  { to: "/response-writer", label: "DM Replies", icon: MessageSquareHeart, tint: "surface-blush" },
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
  const togFu = useServerFn(toggleFollowUp);
  const delFu = useServerFn(deleteFollowUp);

  const today = new Date();
  const greet = today.getHours() < 12 ? "Morning" : today.getHours() < 18 ? "Afternoon" : "Evening";
  const dateStr = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const d = dash.data;
  const quote = pickByDay(QUOTES);
  const trends = pickTrends(3);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:py-12">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden rounded-[2rem] bg-aurora p-6 sm:p-10 grain">
        <div className="relative">
          <p className="eyebrow">{dateStr}</p>
          <h1 className="mt-2 font-display text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl">
            {greet}<span className="text-foreground/60">,</span>{" "}
            <span className="italic">{d?.name ? d.name.split(" ")[0] : "lovely"}</span>
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Your creator headquarters. Quiet, organised, and quietly ambitious — just like you.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/film-this"><Button className="rounded-full bg-foreground text-background hover:bg-foreground/90"><Camera className="mr-1.5 h-4 w-4" />Today's brief</Button></Link>
            <Link to="/planner"><Button variant="outline" className="rounded-full border-foreground/15 bg-background/60 backdrop-blur"><Calendar className="mr-1.5 h-4 w-4" />Plan the week</Button></Link>
            <Link to="/generator"><Button variant="outline" className="rounded-full border-foreground/15 bg-background/60 backdrop-blur"><Sparkles className="mr-1.5 h-4 w-4" />New ideas</Button></Link>
          </div>

          {/* Stat strip */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Flame} label="Streak" value={`${d?.streak ?? 0} days`} sub={`${d?.posts_last_7 ?? 0} posts this week`} />
            <Stat icon={ListChecks} label="Today" value={`${d?.todays_tasks.length ?? 0} tasks`} sub={`${d?.upcoming_tasks.length ?? 0} coming up`} />
            <Stat icon={MailCheck} label="Follow-ups" value={`${d?.follow_ups.length ?? 0}`} sub={d?.follow_ups[0]?.brand ?? "All clear"} />
            <Stat icon={Wallet} label="This month" value={`£${(d?.income_this_month ?? 0).toLocaleString()}`} sub="Income logged" />
          </div>
        </div>
      </section>

      {/* ============ XP ribbon ============ */}
      <div className="mt-6"><XpBadge /></div>

      {/* ============ WINS strip ============ */}
      {d && d.wins.length > 0 && (
        <div className="mt-6 flex items-center gap-3 overflow-x-auto rounded-full border border-border/60 bg-card/60 px-4 py-3 backdrop-blur">
          <Trophy className="h-4 w-4 shrink-0 text-primary" />
          <span className="eyebrow shrink-0">Your wins</span>
          <div className="flex gap-2">
            {d.wins.map((w, i) => (
              <span key={i} className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground/80">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* ============ MAIN GRID ============ */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Today's tasks (wide) */}
        <Card className="card-elegant rounded-[1.75rem] border-0 p-6 lg:col-span-2">
          <SectionHead icon={ListChecks} eyebrow="Today" title="Your tasks" cta={{ label: "Open planner", to: "/planner" }} />
          {d?.todays_tasks.length === 0 ? (
            <Empty text="The slate is clean. Add a few intentions in the planner." to="/planner" cta="Open planner" />
          ) : (
            <ul className="mt-5 space-y-2.5">
              {d?.todays_tasks.map((t) => (
                <li key={t.id} className="group flex items-start gap-3 rounded-2xl border border-transparent bg-secondary/50 p-3.5 transition hover:border-border hover:bg-card">
                  <button
                    onClick={() => togPlan({ data: { id: t.id, done: !t.done } }).then(refresh)}
                    className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full border transition ${t.done ? "border-primary bg-primary text-primary-foreground" : "border-foreground/20 hover:border-primary"}`}
                    aria-label="Toggle task"
                  >
                    {t.done && <Check className="h-3 w-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.idea}</p>
                    {t.hook && <p className="mt-0.5 text-xs italic text-muted-foreground">"{t.hook}"</p>}
                  </div>
                  {t.slot_label && <span className="eyebrow shrink-0 rounded-full bg-background px-2 py-1">{t.slot_label}</span>}
                </li>
              ))}
            </ul>
          )}

          {d && d.upcoming_tasks.length > 0 && (
            <div className="mt-6 border-t border-border/60 pt-5">
              <p className="eyebrow">Up next</p>
              <ul className="mt-3 space-y-2">
                {d.upcoming_tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-foreground/80">{t.idea}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(t.plan_date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Daily motivational quote */}
        <Card className="card-elegant relative overflow-hidden rounded-[1.75rem] border-0 p-6">
          <div className="absolute inset-0 opacity-60" style={{ background: "var(--gradient-bloom)" }} />
          <div className="relative">
            <Quote className="h-5 w-5 text-foreground/70" />
            <p className="mt-4 font-display text-2xl font-light leading-snug text-foreground">
              "{quote.q}"
            </p>
            <p className="mt-4 eyebrow text-foreground/70">— {quote.a}</p>
            <Link to="/motivation" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:gap-2 transition-all">
              More creator notes <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* Today's brief */}
        <Card className="card-elegant relative overflow-hidden rounded-[1.75rem] border-0 p-6">
          <div className="absolute inset-0 opacity-50" style={{ background: "var(--gradient-sunrise)" }} />
          <div className="relative">
            <div className="flex items-center gap-2"><Camera className="h-4 w-4" /><p className="eyebrow">Film today</p></div>
            {d?.today_brief ? (
              <>
                <p className="mt-3 font-display text-xl font-normal leading-snug">{d.today_brief.film}</p>
                <p className="mt-2 text-sm italic text-muted-foreground">"{d.today_brief.hook}"</p>
                <Link to="/film-this">
                  <Button size="sm" className="mt-5 rounded-full bg-foreground text-background hover:bg-foreground/90">
                    Open brief <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground">No brief yet — get a fresh one in 5 seconds.</p>
                <Link to="/film-this">
                  <Button size="sm" className="mt-4 rounded-full bg-foreground text-background hover:bg-foreground/90">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />Generate brief
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Card>

        {/* Follow-ups */}
        <Card className="card-elegant rounded-[1.75rem] border-0 p-6 lg:col-span-2">
          <SectionHead icon={MailCheck} eyebrow="Pipeline" title="Follow-ups" />
          {d?.follow_ups.length === 0 ? (
            <Empty text="No follow-ups due. Your inbox is at peace." />
          ) : (
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {d?.follow_ups.map((f) => {
                const overdue = f.due_date < new Date().toISOString().slice(0, 10);
                return (
                  <li key={f.id} className="rounded-2xl border border-border/60 bg-secondary/40 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => togFu({ data: { id: f.id, done: true } }).then(refresh)}
                        className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border border-foreground/20 hover:border-primary"
                        aria-label="Mark done"
                      >
                        <Check className="h-3 w-3 opacity-0 hover:opacity-100" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{f.title}</p>
                        {f.brand && <p className="text-xs text-muted-foreground">{f.brand}</p>}
                        <p className={`mt-1 eyebrow ${overdue ? "text-rose-700" : ""}`}>
                          {overdue ? "Overdue · " : "Due "}{new Date(f.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <button onClick={() => delFu({ data: { id: f.id } }).then(refresh)} className="text-muted-foreground transition hover:text-destructive" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <FollowUpAdder onAdded={refresh} />
        </Card>

        {/* Monetisation snapshot */}
        <Card className="card-elegant rounded-[1.75rem] border-0 p-6">
          <SectionHead icon={Wallet} eyebrow="Money" title="Monetisation" cta={{ label: "Tracker", to: "/income-tracker" }} />
          <div className="mt-5">
            <p className="font-display text-4xl font-light leading-none tracking-tight">£{(d?.income_this_month ?? 0).toLocaleString()}</p>
            <p className="mt-2 text-xs text-muted-foreground">This month, across logged income</p>
          </div>
          {d && Object.keys(d.income_by_currency).length > 1 && (
            <ul className="mt-4 space-y-1 text-xs">
              {Object.entries(d.income_by_currency).map(([c, v]) => (
                <li key={c} className="flex justify-between rounded-lg bg-secondary px-2.5 py-1.5"><span>{c}</span><span className="font-semibold">{v.toLocaleString()}</span></li>
              ))}
            </ul>
          )}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Link to="/invoices"><Button variant="outline" size="sm" className="w-full rounded-full text-xs">Invoice</Button></Link>
            <Link to="/business"><Button variant="outline" size="sm" className="w-full rounded-full text-xs">Business</Button></Link>
            <Link to="/affiliates"><Button variant="outline" size="sm" className="w-full rounded-full text-xs">Affiliates</Button></Link>
          </div>
        </Card>

        {/* Goals */}
        <Card className="card-elegant rounded-[1.75rem] border-0 p-6 lg:col-span-2">
          <SectionHead icon={Target} eyebrow="Direction" title="Current goals" />
          {d?.goals.length === 0 ? <Empty text="No goals yet. Set one below — even a tiny one counts." /> : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {d?.goals.map((g) => <GoalRow key={g.id} g={g} onChange={refresh} />)}
            </ul>
          )}
          <GoalAdder onAdded={refresh} />
        </Card>

        {/* Trends */}
        <Card className="card-elegant rounded-[1.75rem] border-0 p-6">
          <SectionHead icon={TrendingUp} eyebrow="This week" title="Trending" />
          <ul className="mt-5 space-y-3">
            {trends.map((t, i) => (
              <li key={i} className="rounded-2xl border border-border/50 bg-secondary/40 p-3.5">
                <p className="eyebrow text-primary">{t.tag}</p>
                <p className="mt-1.5 text-sm font-medium leading-snug">{t.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.note}</p>
              </li>
            ))}
          </ul>
          <Link to="/viral-lab" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:gap-2 transition-all">
            Explore Viral Lab <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        {/* Ideas waiting */}
        <Card className="card-elegant rounded-[1.75rem] border-0 p-6 lg:col-span-2">
          <SectionHead icon={Lightbulb} eyebrow="Saved" title="Ideas waiting on you" cta={{ label: "Generator", to: "/generator" }} />
          {d?.ideas_waiting.length === 0 ? (
            <Empty text="No saved ideas yet. Use the Generator and tap save." to="/generator" cta="Open Generator" />
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {d?.ideas_waiting.slice(0, 6).map((i) => (
                <li key={i.id} className="rounded-2xl border border-border/50 bg-secondary/40 p-3.5 transition hover:border-border hover:bg-card">
                  <p className="eyebrow text-primary">{i.kind}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug">{i.title || i.body.slice(0, 80)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* AI tools quick access */}
        <Card className="card-elegant rounded-[1.75rem] border-0 p-6 lg:col-span-3">
          <SectionHead icon={Wand2} eyebrow="Studio" title="AI tools, ready when you are" />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AI_TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className="group">
                <div className={`${t.tint} relative flex h-full flex-col justify-between gap-6 rounded-2xl border border-border/40 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]`}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-background/80 text-foreground shadow-[var(--shadow-xs)]">
                    <t.icon className="h-4 w-4" />
                  </span>
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{t.label}</p>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer signature */}
      <p className="mt-10 text-center text-xs text-muted-foreground">
        Made with <Heart className="inline h-3 w-3 text-primary" /> for creators who do it softly and seriously.
      </p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: typeof Flame; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/70 p-3.5 backdrop-blur">
      <div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" /><p className="eyebrow">{label}</p></div>
      <p className="mt-1.5 font-display text-2xl font-light leading-none tracking-tight">{value}</p>
      <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function SectionHead({ icon: Icon, eyebrow, title, cta }: { icon: typeof Flame; eyebrow: string; title: string; cta?: { label: string; to: string } }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <div className="mt-1 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-foreground/70"><Icon className="h-4 w-4" /></span>
          <h3 className="font-display text-xl font-normal tracking-tight">{title}</h3>
        </div>
      </div>
      {cta && (
        <Link to={cta.to} className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground hover:gap-2 transition-all">
          {cta.label} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function Empty({ text, to, cta }: { text: string; to?: string; cta?: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border/70 p-6 text-center">
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
    <li className="rounded-2xl border border-border/50 bg-secondary/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="eyebrow text-primary">{g.kind.replace("_", " ")}</p>
          <p className="mt-1 truncate text-sm font-medium">{g.title}</p>
        </div>
        <button onClick={() => del({ data: { id: g.id } }).then(onChange)} className="text-muted-foreground transition hover:text-destructive" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-medium">{Number(g.current_value).toLocaleString()}{g.unit ?? ""} <span className="text-muted-foreground">/ {Number(g.target_value).toLocaleString()}{g.unit ?? ""}</span></span>
        <span className="font-semibold text-foreground">{pct}%</span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" />
      {edit ? (
        <div className="mt-3 flex gap-1.5">
          <Input value={val} onChange={(e) => setVal(e.target.value)} type="number" className="h-8 rounded-lg text-xs" />
          <Button size="sm" className="h-8 rounded-lg" onClick={() => { upd({ data: { id: g.id, current_value: Number(val) || 0 } }).then(() => { setEdit(false); onChange(); }); }}>Save</Button>
        </div>
      ) : (
        <button onClick={() => setEdit(true)} className="mt-3 eyebrow hover:text-foreground transition">Update progress</button>
      )}
      {g.deadline && <p className="mt-2 text-[10px] text-muted-foreground">By {new Date(g.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>}
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
  if (!open) return <button onClick={() => setOpen(true)} className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium transition hover:bg-foreground hover:text-background"><Plus className="h-3.5 w-3.5" />Add goal</button>;
  return (
    <div className="mt-5 grid gap-2 rounded-2xl border border-border/60 p-4 sm:grid-cols-2">
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
  if (!open) return <button onClick={() => setOpen(true)} className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium transition hover:bg-foreground hover:text-background"><Plus className="h-3.5 w-3.5" />Add follow-up</button>;
  return (
    <div className="mt-5 grid gap-2 rounded-2xl border border-border/60 p-4">
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
