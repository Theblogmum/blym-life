import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Check, Trash2, Lock, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  listScheduledPosts, createScheduledPost, markPosted, deleteScheduledPost,
} from "@/lib/schedule.functions";
import { PageHero } from "@/components/page-hero";

const PLATFORMS = ["instagram", "tiktok", "youtube", "pinterest", "other"] as const;

export const Route = createFileRoute("/_authenticated/schedule")({
  component: SchedulePage,
});

function SchedulePage() {
  const fetchList = useServerFn(listScheduledPosts);
  const createFn = useServerFn(createScheduledPost);
  const markFn = useServerFn(markPosted);
  const delFn = useServerFn(deleteScheduledPost);
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ["scheduled-posts"], queryFn: () => fetchList() });

  const [platform, setPlatform] = useState<typeof PLATFORMS[number]>("instagram");
  const [hook, setHook] = useState("");
  const [caption, setCaption] = useState("");
  const [when, setWhen] = useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  });

  const create = useMutation({
    mutationFn: () => createFn({ data: {
      platform, hook: hook || null, caption: caption || null,
      scheduled_for: new Date(when).toISOString(),
    } }),
    onSuccess: () => {
      setHook(""); setCaption("");
      qc.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast.success("Scheduled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mark = useMutation({
    mutationFn: (id: string) => markFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["scheduled-posts"] }); toast.success("Logged ✓"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-posts"] }),
  });

  const locked = create.error?.message?.includes("Pro");
  const posts = list.data?.posts ?? [];
  const dueNow = list.data?.dueNowCount ?? 0;

  return (
    <div>
      <PageHero
        icon={Calendar}
        eyebrow="Schedule"
        title="Plan posts. Get reminded. Mark done."
        description="In-app scheduler. We can't auto-post to IG/TikTok (their APIs don't allow it for personal accounts) but we'll keep your week organised and one tap to log when it's live."
        variant="sky"
      />
      <section className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        {dueNow > 0 && (
          <Card className="rounded-2xl border-0 surface-peach p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" />
              {dueNow} post{dueNow > 1 ? "s" : ""} due now — time to publish ✨
            </p>
          </Card>
        )}

        {/* Composer */}
        <Card className="rounded-3xl border-0 p-5 shadow-[var(--shadow-soft)]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            New scheduled post
          </p>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => (
                <button key={p}
                  onClick={() => setPlatform(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                    platform === p ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70 hover:bg-secondary/70"
                  }`}>{p}</button>
              ))}
            </div>
            <Input placeholder="Hook (optional)" value={hook} onChange={e => setHook(e.target.value)} className="rounded-xl" />
            <Textarea rows={3} placeholder="Caption" value={caption} onChange={e => setCaption(e.target.value)} className="rounded-xl" />
            <Input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} className="rounded-xl" />
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-peach p-3 text-sm">
                <p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Scheduler is a Pro feature.</p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Go Pro</Button></Link>
              </div>
            )}
            <Button onClick={() => create.mutate()} disabled={create.isPending} className="w-full rounded-2xl sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> {create.isPending ? "Scheduling…" : "Schedule post"}
            </Button>
          </div>
        </Card>

        {/* List */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Upcoming</p>
          {posts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nothing scheduled yet. Add one above ✨
            </p>
          )}
          {posts.map(p => (
            <Card key={p.id} className="flex items-start gap-3 rounded-2xl border-0 p-4 shadow-[var(--shadow-soft)]">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                  <span className="rounded-full bg-secondary px-2 py-0.5 capitalize">{p.platform}</span>
                  <span className="text-muted-foreground">
                    {new Date(p.scheduled_for).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {p.status === "posted" && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">posted ✓</span>}
                </div>
                {p.hook && <p className="mt-1 text-sm font-semibold">{p.hook}</p>}
                {p.caption && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.caption}</p>}
              </div>
              {p.status !== "posted" && (
                <Button size="sm" variant="ghost" onClick={() => mark.mutate(p.id)} className="rounded-full">
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => del.mutate(p.id)} className="rounded-full text-muted-foreground">
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}