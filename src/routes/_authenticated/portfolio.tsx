import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { listPortfolio, savePortfolio, deletePortfolio } from "@/lib/business.functions";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/portfolio")({ component: Page });

const blank = () => ({ title: "", brand: "", platform: "", link: "", image_url: "", description: "", posted_on: "", views: "", likes: "", saves: "" });

function Page() {
  const list = useServerFn(listPortfolio); const save = useServerFn(savePortfolio); const del = useServerFn(deletePortfolio);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["portfolio"], queryFn: () => list() });
  const [form, setForm] = useState(blank());
  const m = useMutation({
    mutationFn: () => save({ data: { title: form.title, brand: form.brand || undefined, platform: form.platform || undefined, link: form.link || undefined, image_url: form.image_url || undefined, description: form.description || undefined, posted_on: form.posted_on || undefined, metrics: { views: form.views, likes: form.likes, saves: form.saves } } }),
    onSuccess: () => { toast.success("Saved"); setForm(blank()); qc.invalidateQueries({ queryKey: ["portfolio"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const dm = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["portfolio"] }); } });
  return (
    <div>
      <PageHero icon={Briefcase} eyebrow="Show off" title="Your portfolio." description="Save the work you're proud of with metrics, ready to drop into a media kit or pitch." variant="sunrise" />
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-6 lg:grid-cols-[1fr_360px]">
        <Card glow className="rounded-3xl p-6">
          <h2 className="font-display text-xl font-black">Add piece</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Platform</Label><Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="Instagram / TikTok / YouTube" /></div>
            <div className="space-y-1.5"><Label>Posted</Label><Input type="date" value={form.posted_on} onChange={(e) => setForm({ ...form, posted_on: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Link</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="https://" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="https://" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Views</Label><Input value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Likes</Label><Input value={form.likes} onChange={(e) => setForm({ ...form, likes: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Saves</Label><Input value={form.saves} onChange={(e) => setForm({ ...form, saves: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
          </div>
          <Button className="mt-4 rounded-full" disabled={m.isPending || !form.title} onClick={() => m.mutate()}><Plus className="mr-1.5 h-4 w-4" />{m.isPending ? "Saving…" : "Add to portfolio"}</Button>
        </Card>
        <div className="space-y-3">
          <h3 className="font-display text-lg font-black">Your work</h3>
          {q.data?.items.map((it) => {
            const metrics = (it.metrics ?? {}) as Record<string, string>;
            return (
              <Card key={it.id} className="overflow-hidden rounded-2xl">
                {it.image_url && <img src={it.image_url} alt={it.title} className="h-32 w-full object-cover" loading="lazy" />}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold">{it.title}</p>
                      <p className="text-xs text-muted-foreground">{[it.brand, it.platform, it.posted_on].filter(Boolean).join(" · ")}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {it.link && <a href={it.link} target="_blank" rel="noreferrer"><Button size="icon" variant="ghost"><ExternalLink className="h-4 w-4" /></Button></a>}
                      <Button size="icon" variant="ghost" onClick={() => dm.mutate(it.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {(metrics.views || metrics.likes || metrics.saves) && (
                    <div className="mt-2 flex gap-1.5 text-[10px] font-bold uppercase">
                      {metrics.views && <span className="rounded-full bg-secondary px-2 py-0.5">{metrics.views} views</span>}
                      {metrics.likes && <span className="rounded-full bg-secondary px-2 py-0.5">{metrics.likes} likes</span>}
                      {metrics.saves && <span className="rounded-full bg-secondary px-2 py-0.5">{metrics.saves} saves</span>}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          {q.data && q.data.items.length === 0 && <p className="text-sm text-muted-foreground">Nothing saved yet.</p>}
        </div>
      </section>
    </div>
  );
}