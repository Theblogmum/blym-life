import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Flame, Wand2, FileText, Calendar,
  Heart, ArrowRight, Zap, MessageSquare,
} from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { getMe } from "@/lib/profile.functions";
import { TrialPill } from "@/components/trial-pill";

export const Route = createFileRoute("/_authenticated/app")({ component: HomePage });

const CREATE_ACTIONS = [
  { to: "/viral-lab", label: "Viral Hook", icon: Flame, hint: "Scroll-stopping openers" },
  { to: "/generator", label: "Reel Script", icon: Wand2, hint: "Full script in seconds" },
  { to: "/generator", label: "Caption", icon: MessageSquare, hint: "On-brand & ready to post" },
  { to: "/planner", label: "Content Plan", icon: Calendar, hint: "Map out your week" },
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
      ? "Create your first reel today — start with a viral hook."
      : streak === 0
      ? "Post once today to start a streak."
      : monthlyGoal && monthlyPct < 100
      ? `Move closer to "${monthlyGoal.title}" — you're ${monthlyPct}% there.`
      : "Plan tomorrow's post while today's energy is high.";

  return (
    <div className="relative mx-auto max-w-[1100px] px-5 pb-20 pt-8 lg:px-10 lg:pt-12">
      {/* ============ Greeting + Trial pill ============ */}
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[30px] font-normal leading-tight tracking-tight text-foreground sm:text-[40px]">
            {greet}, <span className="capitalize">{name}</span>{" "}
            <Heart className="ml-0.5 inline h-6 w-6 fill-primary text-primary align-middle" />
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">What do you want to create today?</p>
        </div>
        <TrialPill />
      </header>

      {/* ============ HERO: Quick create actions ============ */}
      <section className="mb-10">
        <div className="rounded-[28px] bg-[image:var(--gradient-warm)] p-[1.5px] shadow-[var(--shadow-soft)]">
          <div className="rounded-[26.5px] bg-card px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Start here</span>
            </div>
            <h2 className="mt-2 font-display text-[26px] font-normal leading-tight tracking-tight sm:text-[32px]">
              What do you want to create today?
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CREATE_ACTIONS.map((a, i) => (
                <Link
                  key={i}
                  to={a.to}
                  className="group flex flex-col items-start gap-3 rounded-2xl bg-secondary/60 p-5 transition hover:bg-primary hover:text-primary-foreground"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-card text-primary shadow-[var(--shadow-xs)] transition group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground">
                    <a.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-[18px] font-normal leading-tight">{a.label}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground transition group-hover:text-primary-foreground/85">{a.hint}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-7 flex justify-center">
              <Link to="/generator">
                <Button size="lg" className="h-12 rounded-full bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90">
                  <Zap className="mr-1.5 h-4 w-4" /> Create my next post
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Snapshot card ============ */}
      <section>
        <div className="rounded-3xl bg-secondary/40 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <h3 className="font-display text-[20px] font-normal tracking-tight">Your Creator Snapshot</h3>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <SnapshotStat label="Streak" value={`${streak}`} unit={streak === 1 ? "day" : "days"} />
            <SnapshotStat label="Posts this week" value={`${postsWeek}`} />
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">Goal progress</p>
              <p className="mt-1.5 font-display text-[28px] font-normal leading-none tracking-tight">{monthlyPct}%</p>
              <Progress value={monthlyPct} className="mt-3 h-1.5" />
            </div>
          </div>
          <div className="mt-7 flex flex-wrap items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/40">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Your best focus today</p>
              <p className="mt-0.5 text-[14px] text-foreground/85">{focusSuggestion}</p>
            </div>
            <Link to="/generator">
              <Button size="sm" variant="ghost" className="rounded-full font-semibold text-primary hover:bg-primary/10">
                Let's go <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Subtle secondary links ============ */}
      <section className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12.5px] text-muted-foreground">
        <Link to="/planner" className="inline-flex items-center gap-1 transition hover:text-foreground"><Calendar className="h-3.5 w-3.5" /> Planner</Link>
        <Link to="/templates" className="inline-flex items-center gap-1 transition hover:text-foreground"><FileText className="h-3.5 w-3.5" /> Templates</Link>
        <Link to="/insights" className="inline-flex items-center gap-1 transition hover:text-foreground">📈 Insights</Link>
        <Link to="/wins" className="inline-flex items-center gap-1 transition hover:text-foreground">🏆 Wins</Link>
      </section>
    </div>
  );
}

function SnapshotStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <p className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 flex items-baseline gap-1.5 font-display text-[28px] font-normal leading-none tracking-tight">
        {value}
        {unit && <span className="text-[12px] font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}
