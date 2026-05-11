import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Flame, Wand2, Calendar, Heart, ArrowRight, Zap,
  MessageSquare, TrendingUp, DollarSign, Target, Flag,
  Trophy, Clock,
} from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { getMe } from "@/lib/profile.functions";
import { TrialPill } from "@/components/trial-pill";

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
  const navigate = useNavigate();

  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDash() });

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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/75 backdrop-blur">
                <Sparkles className="h-3 w-3" /> Your Studio
              </p>
              <h1 className="font-display text-[36px] font-black leading-[1.05] tracking-tight text-foreground sm:text-[52px]">
                {greet},
                <br />
                <span className="capitalize bg-gradient-to-r from-[oklch(0.45_0.22_8)] to-[oklch(0.55_0.22_8)] bg-clip-text text-transparent">{name}.</span>
              </h1>
              <p className="mt-3 max-w-md text-[15px] text-foreground/70">
                What do you want to create today? Your toolkit is ready.
              </p>
            </div>
            <TrialPill />
          </div>

          {/* Stat strip */}
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <HeroStat icon={Flame} label="Streak" value={`${streak}`} unit={streak === 1 ? "day" : "days"} />
            <HeroStat icon={Zap} label="Posts this week" value={`${postsWeek}`} />
            <HeroStat icon={Target} label="Goal" value={`${monthlyPct}%`} progress={monthlyPct} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-10 lg:px-10 lg:pt-14">
        {/* QUICK ACTIONS */}
        <section className="mb-14">
          <SectionHead eyebrow="Start now" title="Quick actions" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-foreground hover:shadow-[var(--shadow-bold)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background transition group-hover:bg-primary">
                  <a.icon className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <p className="mt-4 font-display text-[18px] font-bold leading-tight">{a.label}</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">{a.hint}</p>
                <ArrowRight className="absolute right-4 top-4 h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            ))}
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

function HeroStat({ icon: Icon, label, value, unit, progress }: { icon: typeof Flame; label: string; value: string; unit?: string; progress?: number }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-foreground/70" />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60">{label}</p>
      </div>
      <p className="mt-2 flex items-baseline gap-1.5 font-display text-[32px] font-black leading-none tabular-nums text-foreground">
        {value}
        {unit && <span className="text-[13px] font-normal text-foreground/60">{unit}</span>}
      </p>
      {typeof progress === "number" && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full bg-foreground transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
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
