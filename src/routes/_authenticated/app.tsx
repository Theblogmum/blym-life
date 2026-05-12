import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Flame, Wand2, Calendar, Heart, ArrowRight, Zap,
  MessageSquare, TrendingUp, DollarSign, Flag,
  Trophy, Clock,
} from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { getMe } from "@/lib/profile.functions";
import { TrialPill } from "@/components/trial-pill";
import { getDailyIdea } from "@/lib/daily-idea.functions";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/app")({ component: HomePage });

const QUICK = [
  { to: "/viral-lab", label: "Viral Hook", icon: Flame, hint: "Scroll-stopping openers" },
  { to: "/generator", label: "Reel Script", icon: Wand2, hint: "Full script in seconds" },
  { to: "/generator", label: "Caption", icon: MessageSquare, hint: "On-brand & ready" },
  { to: "/planner", label: "Plan Week", icon: Calendar, hint: "Map out your week" },
];

const CATEGORIES = [
  {
    label: "Create",
    icon: Sparkles,
    blurb: "Ideas, scripts, captions",
    count: 16,
    accent: "from-[oklch(0.78_0.16_18)] to-[oklch(0.55_0.22_8)]",
    href: "/generator",
    sample: [
      { to: "/viral-lab", label: "Viral Lab" },
      { to: "/generator", label: "Idea Generator" },
      { to: "/script-tightener", label: "Script Tightener" },
      { to: "/templates", label: "Templates" },
    ],
  },
  {
    label: "Grow",
    icon: TrendingUp,
    blurb: "Audits, insights, brand pitches",
    count: 11,
    accent: "from-[oklch(0.72_0.18_340)] to-[oklch(0.55_0.22_8)]",
    href: "/insights",
    sample: [
      { to: "/insights", label: "Insights" },
      { to: "/profile-audit", label: "Profile Audit" },
      { to: "/pitch-generator", label: "Brand Pitch" },
      { to: "/media-kit", label: "Media Kit" },
    ],
  },
  {
    label: "Monetise",
    icon: DollarSign,
    blurb: "Invoices, packages, income",
    count: 6,
    accent: "from-[oklch(0.74_0.14_155)] to-[oklch(0.5_0.16_165)]",
    href: "/business",
    sample: [
      { to: "/business", label: "Business Mode" },
      { to: "/invoices", label: "Invoices" },
      { to: "/income-tracker", label: "Income Tracker" },
      { to: "/affiliates", label: "Affiliates" },
    ],
  },
  {
    label: "Mindset",
    icon: Heart,
    blurb: "Motivation, wins, recovery",
    count: 3,
    accent: "from-[oklch(0.82_0.1_60)] to-[oklch(0.62_0.18_30)]",
    href: "/motivation",
    sample: [
      { to: "/motivation", label: "Daily Motivation" },
      { to: "/wins", label: "Doing Better" },
      { to: "/rejection-recovery", label: "Rejection Recovery" },
    ],
  },
];

function HomePage() {
  const fetchDash = useServerFn(getDashboard);
  const fetchMe = useServerFn(getMe);
  const fetchIdea = useServerFn(getDailyIdea);
  const navigate = useNavigate();

  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });
  const idea = useQuery({
    queryKey: ["daily-idea", new Date().toISOString().slice(0, 10)],
    queryFn: () => fetchIdea(),
    staleTime: 1000 * 60 * 60 * 6,
  });

  useEffect(() => {
    if (me.data?.profile && !me.data.profile.onboarded) navigate({ to: "/onboarding" });
  }, [me.data, navigate]);

  const today = new Date();
  const greet = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";
  const d = dash.data;
  const name = d?.name?.split(" ")[0] ?? "lovely";

  const monthlyGoal = d?.goals?.[0];
  const monthlyPct = monthlyGoal
    ? Math.min(100, Math.round((Number(monthlyGoal.current_value) / Math.max(1, Number(monthlyGoal.target_value))) * 100))
    : 0;

  const streak = d?.streak ?? 0;
  const postsWeek = d?.posts_last_7 ?? 0;
  const focusSuggestion =
    postsWeek === 0
      ? "Create your first post today — start with a viral hook."
      : streak === 0
      ? "Post once today to start a streak."
      : monthlyGoal && monthlyPct < 100
      ? `Move closer to "${monthlyGoal.title}" — you're ${monthlyPct}% there.`
      : "Plan tomorrow's post while today's energy is high.";

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-[image:var(--gradient-hero)]">
        <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)", backgroundSize: "60px 60px, 80px 80px" }} />
        <div className="relative mx-auto max-w-[1200px] px-5 pb-12 pt-10 lg:px-10 lg:pb-16 lg:pt-14">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
            {/* LEFT — greeting, prompt, quick actions */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-[36px] font-black leading-[1.05] tracking-tight text-foreground sm:text-[52px]">
                    {greet},
                    <br />
                    <span className="capitalize bg-gradient-to-r from-[oklch(0.45_0.22_8)] to-[oklch(0.55_0.22_8)] bg-clip-text text-transparent">{name}.</span>
                  </h1>
                  <p className="mt-3 max-w-md text-[15px] text-foreground/70">
                    {focusSuggestion}
                  </p>
                </div>
                <div className="lg:hidden"><TrialPill /></div>
              </div>

              <div className="mt-10">
                <p className="text-[13px] text-foreground/55">
                  Want to start with…
                </p>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-2 font-display text-[22px] leading-[1.35] tracking-tight sm:text-[26px]">
                  {QUICK.map((a, i) => (
                    <span key={a.label} className="inline-flex items-baseline">
                      <Link
                        to={a.to}
                        className="group inline-flex items-baseline gap-1.5 text-foreground/55 underline-offset-[6px] decoration-foreground/20 hover:text-foreground hover:decoration-foreground/60 hover:underline"
                      >
                        <a.icon className="h-4 w-4 self-center text-foreground/40 group-hover:text-foreground" strokeWidth={1.75} />
                        <span className="font-semibold">{a.label.toLowerCase()}</span>
                      </Link>
                      {i < QUICK.length - 1 && (
                        <span aria-hidden className="text-foreground/30">·</span>
                      )}
                    </span>
                  ))}
                  <span className="text-foreground/40">?</span>
                </div>
              </div>
            </div>

            {/* RIGHT — ONE clean progress widget: weekly consistency */}
            <div className="flex flex-col gap-3">
              <div className="hidden justify-end lg:flex"><TrialPill /></div>
              <ConsistencyWidget postsWeek={postsWeek} streak={streak} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-10 lg:px-10 lg:pt-14">
        {/* DAILY IDEA */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60">
                    Today's idea · just for you
                  </p>
                </div>
              </div>
              <Link to="/generator">
                <Button size="sm" variant="outline" className="h-8 rounded-lg text-[12px]">
                  Open in Generator <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>

            {idea.isLoading ? (
              <div className="mt-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            ) : idea.data ? (
              <div className="mt-5">
                <p className="font-display text-[22px] font-bold leading-snug sm:text-[26px]">
                  "{idea.data.idea.hook}"
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-foreground/8 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground/75">
                    {idea.data.idea.format}
                  </span>
                  <span className="text-[12.5px] text-muted-foreground">{idea.data.idea.why}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/generator">
                    <Button size="sm" className="h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90">
                      <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Build the script
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 rounded-lg"
                    onClick={() => idea.refetch()}
                  >
                    Try another
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">Couldn't load today's idea — try refreshing.</p>
            )}
          </div>
        </section>

        {/* TOOLKIT — visual hub */}
        <section className="mb-14">
          <SectionHead eyebrow="Your Toolkit" title="Browse by category" sub="36 tools, organised. Jump in." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <div key={c.label} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition hover:border-foreground/40 hover:shadow-[var(--shadow-bold)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${c.accent} text-white shadow-[var(--shadow-soft)]`}>
                      <c.icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div>
                      <h3 className="font-display text-[22px] font-bold leading-tight">{c.label}</h3>
                      <p className="text-[12.5px] text-muted-foreground">{c.blurb}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-[11px] font-bold tabular-nums text-foreground/70">
                    {c.count} tools
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {c.sample.map((s) => (
                    <Link
                      key={s.to}
                      to={s.to}
                      className="rounded-lg border border-border bg-background px-2.5 py-1 text-[12px] font-medium text-foreground/75 transition hover:border-foreground hover:text-foreground"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
                <Link
                  to={c.href}
                  className="mt-5 inline-flex items-center gap-1 text-[13px] font-bold text-primary transition group-hover:gap-2"
                >
                  Open {c.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* TODAY's FOCUS + WINS */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-border bg-[image:var(--gradient-mesh)] p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60">Today's focus</p>
            </div>
            <p className="mt-4 font-display text-[22px] font-bold leading-snug sm:text-[26px]">
              {focusSuggestion}
            </p>
            {monthlyGoal && (
              <div className="mt-5 rounded-2xl bg-card/80 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Flag className="h-4 w-4 shrink-0 text-primary" />
                    <p className="truncate text-[13px] font-semibold">{monthlyGoal.title}</p>
                  </div>
                  <span className="shrink-0 text-[12px] font-bold tabular-nums">{monthlyPct}%</span>
                </div>
                <Progress value={monthlyPct} className="mt-2 h-1.5" />
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/generator">
                <Button className="h-10 rounded-lg bg-foreground px-5 text-background hover:bg-foreground/90">
                  <Zap className="mr-1.5 h-4 w-4" /> Create now
                </Button>
              </Link>
              <Link to="/planner">
                <Button variant="outline" className="h-10 rounded-lg">
                  <Calendar className="mr-1.5 h-4 w-4" /> Open planner
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.92_0.06_60)] text-[oklch(0.4_0.14_40)]">
                <Trophy className="h-3.5 w-3.5" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60">This week</p>
            </div>
            <p className="mt-4 font-display text-[42px] font-black leading-none tabular-nums">{postsWeek}</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">posts shipped</p>

            <div className="mt-6 space-y-3 border-t border-border pt-5">
              <MiniRow icon={Flame} label="Current streak" value={`${streak}d`} />
              <MiniRow icon={Clock} label="Posts shipped" value={`${postsWeek}`} />
            </div>

            <Link to="/wins" className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-bold text-primary hover:gap-2 transition-all">
              See all wins <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h2 className="mt-1 font-display text-[26px] font-black leading-tight tracking-tight sm:text-[32px]">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function MiniRow({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function ConsistencyWidget({ postsWeek, streak }: { postsWeek: number; streak: number }) {
  // Show last 7 days as dots — filled if a post landed that day (best-effort: distribute postsWeek across most recent days).
  const today = new Date();
  const filled = Math.min(7, postsWeek);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      isToday: i === 6,
      filled: i >= 7 - filled,
    };
  });
  const goal = 5;
  const pct = Math.min(100, Math.round((postsWeek / goal) * 100));
  return (
    <div className="rounded-3xl bg-card/80 p-6 backdrop-blur shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/55">This week</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/8 px-2.5 py-1 text-[11px] font-bold text-foreground/75">
          <Flame className="h-3 w-3" /> {streak}d streak
        </span>
      </div>
      <p className="mt-3 font-display text-[40px] font-black leading-none tabular-nums text-foreground">
        {postsWeek}
        <span className="ml-1.5 text-[14px] font-normal text-foreground/55">/ {goal} posts</span>
      </p>
      <p className="mt-1.5 text-[12.5px] text-muted-foreground">
        {pct >= 100 ? "Consistency goal hit — you're on fire." : `${pct}% of your weekly rhythm.`}
      </p>
      <div className="mt-5 flex items-end justify-between gap-1.5">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={
                d.filled
                  ? "h-8 w-full rounded-md bg-foreground"
                  : d.isToday
                  ? "h-8 w-full rounded-md border border-dashed border-foreground/30 bg-foreground/5"
                  : "h-8 w-full rounded-md bg-foreground/8"
              }
              aria-hidden
            />
            <span className={`text-[10px] font-semibold ${d.isToday ? "text-foreground" : "text-foreground/45"}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
