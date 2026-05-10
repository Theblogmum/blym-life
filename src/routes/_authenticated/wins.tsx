import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Sparkles, RefreshCw, Eye, Heart, MessageCircle, Bookmark, FileText, Wallet } from "lucide-react";
import { summariseWins } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/wins")({ component: Page });

function Page() {
  const fn = useServerFn(summariseWins);
  const fetchUsage = useServerFn(getUsageToday);
  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const q = useQuery({ queryKey: ["wins-summary"], queryFn: () => fn(), staleTime: 5 * 60 * 1000 });
  const premium = !!usage.data?.premium; const inTrial = !!usage.data?.inTrial;
  const s = q.data?.stats;
  return (
    <div>
      <PageHero icon={Trophy} eyebrow="Doing better than you think" title="Let me show you what you've actually done." description="I pulled your posts, portfolio, invoices and income from the last 30 days — here are the wins you forgot to count 💛" variant="mint">
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>
      <section className="mx-auto max-w-4xl space-y-5 px-5 py-10">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="rounded-full" disabled={q.isFetching} onClick={() => q.refetch()}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
        {q.isLoading && <Card className="rounded-3xl p-10 text-center text-sm text-muted-foreground"><Sparkles className="mx-auto mb-2 h-5 w-5 animate-pulse" />Counting your wins…</Card>}
        {s && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={FileText} label="Posts logged" value={s.posts_30d} />
            <Stat icon={Eye} label="Views" value={s.total_views} />
            <Stat icon={Heart} label="Likes" value={s.total_likes} />
            <Stat icon={MessageCircle} label="Comments" value={s.total_comments} />
            <Stat icon={Bookmark} label="Saves" value={s.total_saves} />
            <Stat icon={Trophy} label="Portfolio" value={s.portfolio_items} />
            <Stat icon={Wallet} label="Invoices" value={s.invoices_30d} />
            <Stat icon={Sparkles} label="Income £" value={Object.values(s.income_30d).reduce((a, b) => a + b, 0)} />
          </div>
        )}
        {q.data && (
          <>
            <Card className="rounded-3xl border-0 bg-[image:var(--gradient-mint)] p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Honest message</p>
              <p className="mt-2 font-display text-xl font-black leading-snug">{q.data.message}</p>
            </Card>
            <Card className="rounded-3xl p-5">
              <h3 className="font-display text-lg font-black">Real wins</h3>
              <ul className="mt-3 space-y-2 text-sm">{q.data.wins.map((w, i) => <li key={i} className="rounded-2xl bg-secondary/40 p-3">✨ {w}</li>)}</ul>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="rounded-3xl p-5">
                <h3 className="font-display text-base font-black">What to be proud of</h3>
                <ul className="mt-3 space-y-2 text-sm">{q.data.proud_of.map((w, i) => <li key={i} className="rounded-xl bg-secondary/40 p-3">{w}</li>)}</ul>
              </Card>
              <Card className="rounded-3xl p-5">
                <h3 className="font-display text-base font-black">Invisible progress</h3>
                <ul className="mt-3 space-y-2 text-sm">{q.data.invisible_progress.map((w, i) => <li key={i} className="rounded-xl bg-secondary/40 p-3">{w}</li>)}</ul>
              </Card>
            </div>
            <Card className="rounded-3xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next tiny step</p>
              <p className="mt-2 text-base">{q.data.next_tiny_step}</p>
            </Card>
          </>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <Card className="rounded-2xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3.5 w-3.5" /><p className="text-[10px] font-bold uppercase tracking-wider">{label}</p></div>
      <p className="mt-1 font-display text-2xl font-black">{value.toLocaleString()}</p>
    </Card>
  );
}