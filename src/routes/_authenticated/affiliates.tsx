import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Plus, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { listAffiliates, saveAffiliate, deleteAffiliate } from "@/lib/business.functions";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/affiliates")({ component: Page });

const blank = () => ({ brand: "", product: "", url: "", code: "", commission_rate: "", category: "", notes: "" });

function Page() {
  const list = useServerFn(listAffiliates); const save = useServerFn(saveAffiliate); const del = useServerFn(deleteAffiliate);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["affiliates"], queryFn: () => list() });
  const [form, setForm] = useState(blank());
  const m = useMutation({ mutationFn: () => save({ data: form }), onSuccess: () => { toast.success("Saved"); setForm(blank()); qc.invalidateQueries({ queryKey: ["affiliates"] }); }, onError: (e: Error) => toast.error(e.message) });
  const dm = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["affiliates"] }); } });
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };
  return (
    <div>
      <PageHero icon={Link2} eyebrow="Money" title="Affiliate links, organised." description="One home for every brand link, code, commission and category. Stop digging through DMs." variant="bloom" />
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-10 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-3xl p-6">
          <h2 className="font-display text-xl font-black">Add link</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Product</Label><Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="https://" /></div>
            <div className="space-y-1.5"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Commission %</Label><Input value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="e.g. 12%" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="e.g. baby, beauty, home" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
          </div>
          <Button className="mt-4 rounded-full" disabled={m.isPending || !form.brand || !form.product || !form.url} onClick={() => m.mutate()}><Plus className="mr-1.5 h-4 w-4" />{m.isPending ? "Saving…" : "Save link"}</Button>
        </Card>
        <div className="space-y-3">
          <h3 className="font-display text-lg font-black">Your links</h3>
          {q.data?.links.map((l) => (
            <Card key={l.id} className="rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold">{l.brand} · {l.product}</p>
                  <p className="truncate text-xs text-muted-foreground">{l.url}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] font-bold uppercase">
                    {l.code && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">CODE: {l.code}</span>}
                    {l.commission_rate && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900">{l.commission_rate}</span>}
                    {l.category && <span className="rounded-full bg-secondary px-2 py-0.5">{l.category}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" onClick={() => copy(l.url)}><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => dm.mutate(l.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {q.data && q.data.links.length === 0 && <p className="text-sm text-muted-foreground">No links yet.</p>}
        </div>
      </section>
    </div>
  );
}