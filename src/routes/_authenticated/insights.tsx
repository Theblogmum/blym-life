import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Plus } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { toast } from "sonner";
import { listPosts, logPost } from "@/lib/insights.functions";
import { EmptyState } from "@/components/empty-state";
import { xpPop } from "@/lib/xp-pop";

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const list = useServerFn(listPosts);
  const log = useServerFn(logPost);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["posts"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", platform: "TikTok", views: 0, likes: 0, comments: 0, hook: "" });

  const m = useMutation({
    mutationFn: () => log({ data: form }),
    onSuccess: () => {
      toast.success("Logged");
      xpPop(8, "post logged");
      setOpen(false);
      setForm({ description: "", platform: "TikTok", views: 0, likes: 0, comments: 0, hook: "" });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const posts = (q.data?.posts ?? []) as any[];
  const top = [...posts].sort((a: any, b: any) => (b.views ?? 0) - (a.views ?? 0))[0];
  const avg = posts.length ? Math.round(posts.reduce((s: number, p: any) => s + (p.views ?? 0), 0) / posts.length) : 0;

  return (
    <div>
      <PageHero
        icon={TrendingUp}
        eyebrow="growth insights"
        title="What's actually working for you."
        description="log what you post — we'll spot the patterns. small wins compound."
        variant="mint"
      />
      <div className="mx-auto max-w-3xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setOpen((o) => !o)} className="group rounded-full transition hover:-translate-y-[1px] hover:shadow-[var(--shadow-soft)]">
            <Plus className="mr-1 h-4 w-4 transition-transform group-hover:rotate-90" />Log post
          </Button>
        </div>

        {open && (
        <div className="soft-card mb-6 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Description</Label>
              <Textarea className="mt-1.5 rounded-xl border-border/50" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Hook used</Label>
              <Input className="mt-1.5 rounded-xl border-border/50" value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} /></div>
            <div><Label>Platform</Label>
              <Input className="mt-1.5 rounded-xl border-border/50" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} /></div>
            <div><Label>Views</Label>
              <Input className="mt-1.5 rounded-xl border-border/50" type="number" value={form.views} onChange={(e) => setForm({ ...form, views: +e.target.value })} /></div>
            <div><Label>Likes</Label>
              <Input className="mt-1.5 rounded-xl border-border/50" type="number" value={form.likes} onChange={(e) => setForm({ ...form, likes: +e.target.value })} /></div>
            <div><Label>Comments</Label>
              <Input className="mt-1.5 rounded-xl border-border/50" type="number" value={form.comments} onChange={(e) => setForm({ ...form, comments: +e.target.value })} /></div>
          </div>
          <Button className="mt-5 rounded-full transition hover:-translate-y-[1px]" disabled={!form.description.trim() || m.isPending} onClick={() => m.mutate()}>
            {m.isPending ? "Saving…" : "Save post"}
          </Button>
        </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-3.5">
          <Stat label="Posts logged" value={posts.length} tint="var(--surface-mint)" />
          <Stat label="Avg views" value={avg.toLocaleString()} tint="var(--surface-sky)" />
          <Stat label="Top post" value={top ? `${(top.views ?? 0).toLocaleString()}` : "—"} suffix={top ? "views" : undefined} tint="var(--surface-blush)" />
        </div>

        <div className="mt-8 space-y-2.5">
          {posts.map((p: any) => (
            <div key={p.id} className="group rounded-2xl border border-border/40 bg-card p-4 sm:p-5 shadow-[var(--shadow-xs)] transition-all duration-500 ease-out hover:-translate-y-[2px] hover:border-border/60 hover:shadow-[var(--shadow-elegant)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-semibold leading-snug text-foreground/90">{p.description}</p>
                <span className="chip-soft shrink-0">{p.platform}</span>
              </div>
              {p.hook && <p className="mt-1.5 text-[12px] italic text-muted-foreground/90">"{p.hook}"</p>}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] font-medium text-foreground/55 tabular-nums">
                <span>{(p.views ?? 0).toLocaleString()} views</span>
                <span>{p.likes ?? 0} likes</span>
                <span>{p.comments ?? 0} comments</span>
              </div>
            </div>
          ))}
          {!posts.length && (
          <EmptyState
            icon={TrendingUp}
            tone="mint"
            title="your first win goes here ✨"
            description="log one post — views, likes, the hook you used. after three we start spotting patterns made just for you."
            action={
              <Button onClick={() => setOpen(true)} className="rounded-full transition hover:-translate-y-[1px]">
                <Plus className="mr-1 h-4 w-4" /> Log your first post
              </Button>
            }
            hint="+8 XP per post · combos for posting daily"
          />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix, tint }: { label: string; value: string | number; suffix?: string; tint: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border/30 p-4 sm:p-5 transition-all duration-500 hover:-translate-y-[2px] hover:shadow-[var(--shadow-elegant)]"
      style={{ background: `color-mix(in oklab, ${tint} 60%, var(--background))` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/55">{label}</p>
      <p className="mt-2 font-display text-[26px] font-bold leading-none tracking-[-0.018em] tabular-nums">
        {value}
        {suffix && <span className="ml-1.5 text-[12px] font-semibold tracking-normal text-foreground/55">{suffix}</span>}
      </p>
    </div>
  );
}