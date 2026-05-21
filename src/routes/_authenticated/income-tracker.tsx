import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listIncome, saveIncome, deleteIncome } from "@/lib/business.functions";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/income-tracker")({ component: Page });

const today = () => new Date().toISOString().slice(0, 10);
const CATS = ["brand_deal", "ugc", "affiliate", "ad_revenue", "product", "service", "other"];

function Page() {
  const list = useServerFn(listIncome); const save = useServerFn(saveIncome); const del = useServerFn(deleteIncome);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["income"], queryFn: () => list() });
  const [form, setForm] = useState({ entry_date: today(), source: "", brand: "", amount: 0, currency: "GBP", category: "brand_deal", notes: "" });
  const m = useMutation({ mutationFn: () => save({ data: form }), onSuccess: () => { toast.success("Logged"); setForm({ ...form, source: "", brand: "", amount: 0, notes: "" }); qc.invalidateQueries({ queryKey: ["income"] }); }, onError: (e: Error) => toast.error(e.message) });
  const dm = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["income"] }); } });

  const monthly = useMemo(() => {
    const map: Record<string, number> = {};
    (q.data?.entries ?? []).forEach((e) => { const k = e.entry_date.slice(0, 7); map[k] = (map[k] ?? 0) + Number(e.amount); });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a)).slice(0, 6);
  }, [q.data]);
  const totalThisMonth = monthly[0]?.[1] ?? 0;
  const byCat = useMemo(() => {
    const map: Record<string, number> = {};
    (q.data?.entries ?? []).forEach((e) => { map[e.category] = (map[e.category] ?? 0) + Number(e.amount); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [q.data]);

  return (
    <div>
      <PageHero icon={Wallet} eyebrow="Money" title="Income tracker." description="Log every brand deal, UGC payment and affiliate cheque. See the bigger picture monthly." variant="mint" />
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-3xl p-6">
          <h2 className="font-display text-xl font-black">Log income</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Category</Label>
              <select className="h-10 w-full rounded-xl bg-secondary/40 px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}</select>
            </div>
            <div className="space-y-1.5"><Label>Source</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="e.g. Reel for Aldi" /></div>
            <div className="space-y-1.5"><Label>Brand (optional)</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Amount</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
          </div>
          <Button className="mt-4 rounded-full" disabled={m.isPending || !form.source || !form.amount} onClick={() => m.mutate()}><Plus className="mr-1.5 h-4 w-4" />{m.isPending ? "Saving…" : "Add entry"}</Button>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card className="rounded-2xl p-4 bg-[image:var(--gradient-mint)] text-white">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">This month</p>
              <p className="mt-1 font-display text-3xl font-black">{form.currency} {totalThisMonth.toFixed(2)}</p>
            </Card>
            <Card className="rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">By category</p>
              <ul className="mt-2 space-y-1 text-sm">{byCat.map(([c, v]) => <li key={c} className="flex justify-between"><span>{c.replace("_", " ")}</span><strong>{v.toFixed(2)}</strong></li>)}</ul>
            </Card>
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly</p>
            <ul className="mt-2 space-y-1 text-sm">{monthly.map(([m2, v]) => <li key={m2} className="flex justify-between rounded-xl bg-secondary/40 px-3 py-2"><span>{m2}</span><strong>{v.toFixed(2)}</strong></li>)}</ul>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="font-display text-lg font-black">Recent</h3>
          {q.data?.entries.slice(0, 30).map((e) => (
            <Card key={e.id} className="rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{e.source}</p>
                  <p className="text-xs text-muted-foreground">{e.entry_date} · {e.category} {e.brand ? `· ${e.brand}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{e.currency} {Number(e.amount).toFixed(2)}</p>
                  <Button size="icon" variant="ghost" onClick={() => dm.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}