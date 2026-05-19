import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Plus, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { listInvoices, saveInvoice, deleteInvoice, type InvoiceItem } from "@/lib/business.functions";
import { PageHero } from "@/components/page-hero";
import { EmptyState } from "@/components/empty-state";
import { xpPop } from "@/lib/xp-pop";

export const Route = createFileRoute("/_authenticated/invoices")({ component: Page });

type Form = {
  id?: string; number: string; brand_name: string; brand_email: string; brand_address: string;
  from_name: string; from_email: string; from_address: string;
  issue_date: string; due_date: string; currency: string; tax_rate: number; notes: string;
  items: InvoiceItem[]; status: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Form => ({ number: `INV-${Date.now().toString().slice(-6)}`, brand_name: "", brand_email: "", brand_address: "", from_name: "", from_email: "", from_address: "", issue_date: today(), due_date: "", currency: "GBP", tax_rate: 0, notes: "", items: [{ description: "", quantity: 1, unit_price: 0 }], status: "draft" });

function Page() {
  const list = useServerFn(listInvoices);
  const save = useServerFn(saveInvoice);
  const del = useServerFn(deleteInvoice);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["invoices"], queryFn: () => list() });
  const [form, setForm] = useState<Form>(blank());
  const [editing, setEditing] = useState(false);

  const m = useMutation({ mutationFn: () => save({ data: form }), onSuccess: () => { toast.success("Saved"); if (!editing) xpPop(10, "invoice ready"); setForm(blank()); setEditing(false); qc.invalidateQueries({ queryKey: ["invoices"] }); }, onError: (e: Error) => toast.error(e.message) });
  const dm = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["invoices"] }); } });

  const subtotal = form.items.reduce((a, i) => a + i.quantity * i.unit_price, 0);
  const tax = subtotal * (Number(form.tax_rate) / 100);
  const total = subtotal + tax;
  const setItem = (i: number, patch: Partial<InvoiceItem>) => setForm({ ...form, items: form.items.map((it, idx) => idx === i ? { ...it, ...patch } : it) });

  return (
    <div>
      <PageHero icon={Receipt} eyebrow="Get paid" title="Invoices, sent in minutes." description="Build branded invoices, save them, print to PDF and chase what you're owed." variant="warm" />
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-10 lg:grid-cols-[1fr_360px] print:grid-cols-1">
        <Card className="rounded-3xl p-6 print:shadow-none print:border-0">
          <div className="flex items-center justify-between gap-2 print:hidden">
            <h2 className="font-display text-2xl font-black">{editing ? "Edit invoice" : "New invoice"}</h2>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.print()}><Printer className="mr-1.5 h-4 w-4" />Print/PDF</Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Number</Label><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Status</Label><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="draft / sent / paid" /></div>
            <div className="space-y-1.5"><Label>Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>From (your name)</Label><Input value={form.from_name} onChange={(e) => setForm({ ...form, from_name: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>From email</Label><Input value={form.from_email} onChange={(e) => setForm({ ...form, from_email: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>From address</Label><Textarea rows={2} value={form.from_address} onChange={(e) => setForm({ ...form, from_address: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Brand</Label><Input value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Brand email</Label><Input value={form.brand_email} onChange={(e) => setForm({ ...form, brand_email: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Brand address</Label><Textarea rows={2} value={form.brand_address} onChange={(e) => setForm({ ...form, brand_address: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
          </div>
          <div className="mt-6">
            <Label>Items</Label>
            <div className="mt-2 space-y-2">
              {form.items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <Input className="col-span-7 rounded-xl bg-secondary/40" placeholder="Description" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} />
                  <Input className="col-span-2 rounded-xl bg-secondary/40" type="number" min="0" value={it.quantity} onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} />
                  <Input className="col-span-2 rounded-xl bg-secondary/40" type="number" min="0" step="0.01" value={it.unit_price} onChange={(e) => setItem(i, { unit_price: Number(e.target.value) })} />
                  <Button variant="ghost" size="icon" className="col-span-1" onClick={() => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={() => setForm({ ...form, items: [...form.items, { description: "", quantity: 1, unit_price: 0 }] })}><Plus className="mr-1.5 h-4 w-4" />Add line</Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="rounded-xl bg-secondary/40" /></div>
            <div className="space-y-1.5"><Label>Tax rate %</Label><Input type="number" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} className="rounded-xl bg-secondary/40" /></div>
          </div>
          <div className="mt-4 space-y-1.5"><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl bg-secondary/40" placeholder="e.g. Bank details, payment terms" /></div>
          <div className="mt-4 rounded-2xl bg-secondary/40 p-4 text-right text-sm">
            <p>Subtotal: <strong>{form.currency} {subtotal.toFixed(2)}</strong></p>
            <p>Tax: <strong>{form.currency} {tax.toFixed(2)}</strong></p>
            <p className="mt-1 text-lg font-black">Total: {form.currency} {total.toFixed(2)}</p>
          </div>
          <div className="mt-4 flex gap-2 print:hidden">
            <Button className="rounded-full" disabled={m.isPending || !form.brand_name} onClick={() => m.mutate()}>{m.isPending ? "Saving…" : (editing ? "Update" : "Save invoice")}</Button>
            {editing && <Button variant="outline" className="rounded-full" onClick={() => { setForm(blank()); setEditing(false); }}>Cancel</Button>}
          </div>
        </Card>

        <div className="space-y-3 print:hidden">
          <h3 className="font-display text-lg font-black">Saved invoices</h3>
          {q.data?.invoices.map((inv) => (
            <Card key={inv.id} className="rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{inv.number} · {inv.brand_name}</p>
                  <p className="text-xs text-muted-foreground">{inv.issue_date} · {inv.status}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { setForm({ ...blank(), ...inv, items: (inv.items as unknown as InvoiceItem[]) ?? [], brand_email: inv.brand_email ?? "", brand_address: inv.brand_address ?? "", from_name: inv.from_name ?? "", from_email: inv.from_email ?? "", from_address: inv.from_address ?? "", due_date: inv.due_date ?? "", notes: inv.notes ?? "", tax_rate: Number(inv.tax_rate ?? 0) }); setEditing(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button>
                  <Button size="icon" variant="ghost" onClick={() => dm.mutate(inv.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
          {q.data && q.data.invoices.length === 0 && (
            <EmptyState
              icon={Receipt}
              tone="warm"
              title="your paid era starts here ✨"
              description="fill the form on the left, hit save, and your first invoice is ready to email or print. tiny step, real money."
              hint="+10 XP per invoice"
            />
          )}
        </div>
      </section>
    </div>
  );
}