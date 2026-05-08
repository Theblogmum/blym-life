import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { listPosts, logPost } from "@/lib/insights.functions";

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
      setOpen(false);
      setForm({ description: "", platform: "TikTok", views: 0, likes: 0, comments: 0, hook: "" });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const posts = q.data?.posts ?? [];
  const top = [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];
  const avg = posts.length ? Math.round(posts.reduce((s, p) => s + (p.views ?? 0), 0) / posts.length) : 0;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-secondary p-2 text-primary"><TrendingUp className="h-5 w-5" /></div>
          <div>
            <h1 className="font-display text-3xl font-black">Growth Insights</h1>
            <p className="text-sm text-muted-foreground">Log what you post. We'll spot what works for YOU.</p>
          </div>
        </div>
        <Button onClick={() => setOpen((o) => !o)} className="rounded-full"><Plus className="mr-1 h-4 w-4" />Log post</Button>
      </div>

      {open && (
        <Card className="mt-5 rounded-3xl p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Hook used</Label>
              <Input value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} /></div>
            <div><Label>Platform</Label>
              <Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} /></div>
            <div><Label>Views</Label>
              <Input type="number" value={form.views} onChange={(e) => setForm({ ...form, views: +e.target.value })} /></div>
            <div><Label>Likes</Label>
              <Input type="number" value={form.likes} onChange={(e) => setForm({ ...form, likes: +e.target.value })} /></div>
            <div><Label>Comments</Label>
              <Input type="number" value={form.comments} onChange={(e) => setForm({ ...form, comments: +e.target.value })} /></div>
          </div>
          <Button className="mt-4 rounded-full" disabled={!form.description.trim() || m.isPending} onClick={() => m.mutate()}>
            {m.isPending ? "Saving…" : "Save post"}
          </Button>
        </Card>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Posts logged" value={posts.length} />
        <Stat label="Avg views" value={avg.toLocaleString()} />
        <Stat label="Top post" value={top ? `${(top.views ?? 0).toLocaleString()} views` : "—"} />
      </div>

      <div className="mt-6 space-y-3">
        {posts.map((p) => (
          <Card key={p.id} className="rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{p.description}</p>
              <span className="text-xs text-muted-foreground">{p.platform}</span>
            </div>
            {p.hook && <p className="mt-1 text-xs text-muted-foreground">"{p.hook}"</p>}
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>{(p.views ?? 0).toLocaleString()} views</span>
              <span>{p.likes ?? 0} likes</span>
              <span>{p.comments ?? 0} comments</span>
            </div>
          </Card>
        ))}
        {!posts.length && (
          <p className="text-center text-sm text-muted-foreground">No posts logged yet.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-display font-black">{value}</p>
    </Card>
  );
}