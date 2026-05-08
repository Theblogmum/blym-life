import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Copy, Check, Camera, Lock } from "lucide-react";
import { toast } from "sonner";
import { listTodayBriefs, generateBrief, markBrief } from "@/lib/briefs.functions";
import { getMe } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/app")({
  component: DashboardPage,
});

function DashboardPage() {
  const fetchBriefs = useServerFn(listTodayBriefs);
  const fetchMe = useServerFn(getMe);
  const gen = useServerFn(generateBrief);
  const mark = useServerFn(markBrief);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const briefs = useQuery({ queryKey: ["briefs", "today"], queryFn: () => fetchBriefs() });

  useEffect(() => {
    if (me.data && me.data.profile && !me.data.profile.onboarded) {
      navigate({ to: "/onboarding" });
    }
  }, [me.data, navigate]);

  const generate = useMutation({
    mutationFn: () => gen({ data: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["briefs", "today"] }),
    onError: (e: any) => toast.error(e.message || "Couldn't generate"),
  });

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const tier = me.data?.profile?.tier ?? "free";
  const used = briefs.data?.briefs.length ?? 0;
  const remaining = tier === "free" ? Math.max(0, 3 - used) : Infinity;

  const latest = briefs.data?.briefs[0];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="font-display text-3xl font-black">Today's plan</h1>
        </div>
        {tier === "free" && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs">
            {remaining} of 3 left today
          </span>
        )}
      </div>

      {!latest && !generate.isPending && (
        <Card className="mt-6 rounded-3xl border-dashed p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Camera className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">No brief yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap below and we'll write one for you.</p>
          <Button
            className="mt-5 rounded-full px-6"
            disabled={remaining === 0}
            onClick={() => generate.mutate()}
          >
            <Sparkles className="mr-2 h-4 w-4" /> Tell me what to film
          </Button>
        </Card>
      )}

      {generate.isPending && <BriefSkeleton />}

      {latest && (
        <BriefCard
          key={latest.id}
          brief={latest}
          onMark={(p) => mark({ data: { id: latest.id, ...p } }).then(() => qc.invalidateQueries({ queryKey: ["briefs", "today"] }))}
        />
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="rounded-full"
          disabled={generate.isPending || remaining === 0}
          onClick={() => generate.mutate()}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {latest ? "Generate another" : "Generate"}
        </Button>
        {remaining === 0 && tier === "free" && (
          <Link to="/settings">
            <Button variant="ghost" className="rounded-full text-muted-foreground">
              <Lock className="mr-2 h-4 w-4" /> Daily limit reached — upgrade
            </Button>
          </Link>
        )}
      </div>

      {briefs.data && briefs.data.briefs.length > 1 && (
        <div className="mt-10">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Earlier today</h3>
          <div className="space-y-3">
            {briefs.data.briefs.slice(1).map((b: any) => (
              <Card key={b.id} className="rounded-2xl p-4">
                <p className="text-sm font-medium">{b.film}</p>
                <p className="mt-1 text-xs text-muted-foreground">"{b.hook}"</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BriefSkeleton() {
  return (
    <Card className="mt-6 animate-pulse rounded-3xl p-6">
      <div className="h-4 w-1/3 rounded bg-secondary" />
      <div className="mt-4 h-6 w-2/3 rounded bg-secondary" />
      <div className="mt-3 h-20 w-full rounded bg-secondary" />
    </Card>
  );
}

function BriefCard({ brief, onMark }: { brief: any; onMark: (p: { filmed?: boolean; saved?: boolean }) => Promise<unknown> }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(brief.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    toast.success("Caption copied");
  };
  return (
    <Card className="mt-6 overflow-hidden rounded-3xl border-0 bg-[image:var(--gradient-warm)] p-[2px] shadow-[var(--shadow-soft)]">
      <div className="rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">🎥 Today · Film this</p>
        <p className="mt-2 text-2xl font-display font-black leading-snug">{brief.film}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Hook">"{brief.hook}"</Field>
          <Field label="Post at">{brief.post_at}</Field>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Caption</p>
            <button onClick={copy} className="flex items-center gap-1 text-xs text-primary">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-1 whitespace-pre-line rounded-2xl bg-secondary/60 p-3 text-sm">{brief.caption}</p>
        </div>

        {Array.isArray(brief.shot_list) && brief.shot_list.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Shot list</p>
            <ol className="mt-2 space-y-1.5 text-sm">
              {brief.shot_list.map((s: any, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="font-semibold text-primary">{i + 1}.</span>
                  <span className="flex-1">{s.description}</span>
                  <span className="text-xs text-muted-foreground">{s.seconds}s</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <Field className="mt-4" label="Why it works">{brief.why_it_works}</Field>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={brief.filmed ? "default" : "outline"}
            className="rounded-full"
            onClick={() => onMark({ filmed: !brief.filmed })}
          >
            <Check className="mr-1.5 h-4 w-4" /> {brief.filmed ? "Filmed" : "Mark as filmed"}
          </Button>
          <Button
            size="sm"
            variant={brief.saved ? "default" : "ghost"}
            className="rounded-full"
            onClick={() => onMark({ saved: !brief.saved })}
          >
            {brief.saved ? "Saved" : "Save to planner"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}