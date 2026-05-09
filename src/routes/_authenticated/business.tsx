import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Wallet, Receipt, Target, Users, Calculator, Check, Trash2, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  getBusinessHub,
  saveTaxRate,
  saveClient,
  deleteClient,
  saveTaxReminder,
  toggleTaxReminder,
  deleteTaxReminder,
  saveBusinessGoal,
} from "@/lib/business-mode.functions";

export const Route = createFileRoute("/_authenticated/business")({
  head: () => ({ meta: [{ title: "Business Mode — The Blog Mum Studio" }] }),
  component: BusinessPage,
});

function BusinessPage() {
  const fetchHub = useServerFn(getBusinessHub);
  const qc = useQueryClient();
  const hub = useQuery({ queryKey: ["business-hub"], queryFn: () => fetchHub() });
  const d = hub.data;

  const incomeGoal = d?.monthlyIncomeGoal?.target_value ?? 0;
  const incomePct = incomeGoal > 0 ? Math.min(100, Math.round(((d?.incomeThisMonth ?? 0) / Number(incomeGoal)) * 100)) : 0;
  const outreachGoal = d?.outreachGoal?.target_value ?? 0;
  const outreachPct = outreachGoal > 0 ? Math.min(100, Math.round(((d?.outreachDoneMonth ?? 0) / Number(outreachGoal)) * 100)) : 0;

  const refresh = () => qc.invalidateQueries({ queryKey: ["business-hub"] });

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-secondary p-2 text-primary"><Briefcase className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl font-black">Business Mode</h1>
          <p className="text-sm text-muted-foreground">Your money, clients, outreach and tax — in one view.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Wallet} label="Income · this month" value={`£${(d?.incomeThisMonth ?? 0).toLocaleString()}`} sub={`£${(d?.incomeThisYear ?? 0).toLocaleString()} YTD`} />
        <Stat icon={Receipt} label="Invoices outstanding" value={`£${(d?.outstanding ?? 0).toLocaleString()}`} sub={`£${(d?.paidThisMonth ?? 0).toLocaleString()} paid this month`} />
        <Stat icon={Target} label="Outreach (month)" value={`${d?.outreachDoneMonth ?? 0}${outreachGoal ? ` / ${outreachGoal}` : ""}`} sub={`${d?.followUps.filter(f=>!f.done).length ?? 0} open follow-ups`} />
        <Stat icon={Calculator} label="Set aside for tax" value={`£${(d?.setAside ?? 0).toLocaleString()}`} sub={`${d?.taxRate ?? 0}% of YTD income`} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <IncomeGoalCard current={d?.incomeThisMonth ?? 0} target={Number(incomeGoal)} pct={incomePct} onSaved={refresh} />
        <OutreachGoalCard done={d?.outreachDoneMonth ?? 0} target={Number(outreachGoal)} pct={outreachPct} onSaved={refresh} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <InvoicesOverview invoices={d?.invoices ?? []} />
        <TaxCard rate={d?.taxRate ?? 0} reminders={d?.taxReminders ?? []} onChanged={refresh} />
      </div>

      <ClientsCard clients={d?.clients ?? []} onChanged={refresh} />
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <Card className="rounded-3xl p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" /><p className="text-[10px] font-bold uppercase tracking-wider">{label}</p></div>
      <p className="mt-1 font-display text-2xl font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-[image:var(--gradient-bloom)]" style={{ width: `${pct}%` }} /></div>;
}

function IncomeGoalCard({ current, target, pct, onSaved }: { current: number; target: number; pct: number; onSaved: () => void }) {
  const [val, setVal] = useState(target ? String(target) : "");
  const save = useServerFn(saveBusinessGoal);
  const m = useMutation({
    mutationFn: () => save({ data: { kind: "income_monthly", target_value: Number(val) || 0 } }),
    onSuccess: () => { toast.success("Income goal saved"); onSaved(); },
  });
  return (
    <Card className="rounded-3xl p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monthly income goal</p>
      <p className="mt-1 font-display text-2xl font-black">£{current.toLocaleString()}{target ? <span className="text-muted-foreground"> / £{target.toLocaleString()}</span> : null}</p>
      {target > 0 && <ProgressBar pct={pct} />}
      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1"><Label className="text-xs">Set goal (£)</Label><Input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="2000" /></div>
        <Button className="rounded-full" onClick={() => m.mutate()} disabled={m.isPending}>Save</Button>
      </div>
      <Link to="/income-tracker" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Open income tracker <ArrowRight className="h-3 w-3" /></Link>
    </Card>
  );
}

function OutreachGoalCard({ done, target, pct, onSaved }: { done: number; target: number; pct: number; onSaved: () => void }) {
  const [val, setVal] = useState(target ? String(target) : "");
  const save = useServerFn(saveBusinessGoal);
  const m = useMutation({
    mutationFn: () => save({ data: { kind: "outreach_monthly", target_value: Number(val) || 0 } }),
    onSuccess: () => { toast.success("Outreach target saved"); onSaved(); },
  });
  return (
    <Card className="rounded-3xl p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monthly outreach target</p>
      <p className="mt-1 font-display text-2xl font-black">{done}{target ? <span className="text-muted-foreground"> / {target}</span> : null}</p>
      {target > 0 && <ProgressBar pct={pct} />}
      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1"><Label className="text-xs">Pitches per month</Label><Input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="20" /></div>
        <Button className="rounded-full" onClick={() => m.mutate()} disabled={m.isPending}>Save</Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Counts completed follow-ups. Add new ones from your Home dashboard.</p>
    </Card>
  );
}

function InvoicesOverview({ invoices }: { invoices: any[] }) {
  return (
    <Card className="rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice overview</p>
        <Link to="/invoices" className="text-xs font-semibold text-primary">All invoices →</Link>
      </div>
      {invoices.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No invoices yet. <Link to="/invoices" className="font-semibold text-primary">Create one</Link>.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {invoices.slice(0, 6).map(i => {
            const total = Array.isArray(i.items) ? i.items.reduce((s: number, it: any) => s + Number(it.qty ?? 1) * Number(it.unit_price ?? it.price ?? 0), 0) : 0;
            return (
              <li key={i.id} className="flex items-center justify-between rounded-2xl bg-secondary/40 px-3 py-2 text-sm">
                <span className="min-w-0 truncate"><span className="font-semibold">{i.brand_name}</span> · <span className="text-muted-foreground">{i.issue_date}</span></span>
                <span className="flex items-center gap-2"><span>£{total.toLocaleString()}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${i.status === "paid" ? "bg-emerald-500/15 text-emerald-600" : i.status === "sent" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground"}`}>{i.status}</span></span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function TaxCard({ rate, reminders, onChanged }: { rate: number; reminders: any[]; onChanged: () => void }) {
  const [r, setR] = useState(String(rate ?? 0));
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [amount, setAmount] = useState("");
  const saveRate = useServerFn(saveTaxRate);
  const saveRem = useServerFn(saveTaxReminder);
  const toggle = useServerFn(toggleTaxReminder);
  const del = useServerFn(deleteTaxReminder);

  const rateMut = useMutation({ mutationFn: () => saveRate({ data: { rate: Number(r) || 0 } }), onSuccess: () => { toast.success("Tax rate saved"); onChanged(); } });
  const addMut = useMutation({
    mutationFn: () => saveRem({ data: { title, due_date: due, amount: Number(amount) || 0 } }),
    onSuccess: () => { toast.success("Reminder added"); setTitle(""); setDue(""); setAmount(""); onChanged(); },
  });

  return (
    <Card className="rounded-3xl p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tax reminders</p>
      <div className="mt-3 flex items-end gap-2">
        <div className="w-32"><Label className="text-xs">Set-aside %</Label><Input type="number" value={r} onChange={e => setR(e.target.value)} placeholder="20" /></div>
        <Button variant="outline" className="rounded-full" onClick={() => rateMut.mutate()} disabled={rateMut.isPending}>Save rate</Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_140px_120px_auto]">
        <Input placeholder="Title (e.g. Self assessment)" value={title} onChange={e => setTitle(e.target.value)} />
        <Input type="date" value={due} onChange={e => setDue(e.target.value)} />
        <Input type="number" placeholder="£ amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <Button className="rounded-full" onClick={() => addMut.mutate()} disabled={!title || !due || addMut.isPending}><Plus className="h-4 w-4" /></Button>
      </div>

      {reminders.length > 0 && (
        <ul className="mt-4 space-y-2">
          {reminders.map(rem => {
            const overdue = !rem.done && new Date(rem.due_date) < new Date();
            return (
              <li key={rem.id} className="flex items-center gap-2 rounded-2xl bg-secondary/40 px-3 py-2 text-sm">
                <button onClick={async () => { await toggle({ data: { id: rem.id, done: !rem.done } }); onChanged(); }} className={`grid h-5 w-5 place-items-center rounded-full border-2 ${rem.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                  {rem.done && <Check className="h-3 w-3" />}
                </button>
                <span className={`min-w-0 flex-1 truncate ${rem.done ? "line-through text-muted-foreground" : ""}`}>
                  <span className="font-semibold">{rem.title}</span> · <span className={overdue ? "text-destructive" : "text-muted-foreground"}>{rem.due_date}</span>{Number(rem.amount) > 0 && <> · £{Number(rem.amount).toLocaleString()}</>}
                </span>
                <button onClick={async () => { await del({ data: { id: rem.id } }); onChanged(); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function ClientsCard({ clients, onChanged }: { clients: any[]; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("lead");
  const [notes, setNotes] = useState("");
  const save = useServerFn(saveClient);
  const del = useServerFn(deleteClient);
  const m = useMutation({
    mutationFn: () => save({ data: { name, contact_name: contact, email, status, notes } }),
    onSuccess: () => { toast.success("Client saved"); setName(""); setContact(""); setEmail(""); setNotes(""); setStatus("lead"); setOpen(false); onChanged(); },
  });

  return (
    <Card className="mt-6 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Clients</p></div>
        <Button size="sm" className="rounded-full" onClick={() => setOpen(o => !o)}>{open ? "Cancel" : <><Plus className="mr-1 h-4 w-4" /> Add client</>}</Button>
      </div>

      {open && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Input placeholder="Brand name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Contact name" value={contact} onChange={e => setContact(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="lead">Lead</option><option value="active">Active</option><option value="past">Past</option>
          </select>
          <Textarea className="sm:col-span-2" placeholder="Notes (rates, contact rhythm, gifting…)" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          <Button className="rounded-full sm:col-span-2" onClick={() => m.mutate()} disabled={!name || m.isPending}>Save client</Button>
        </div>
      )}

      {clients.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No clients yet. Add brands you've worked with or want to pitch.</p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {clients.map(c => (
            <li key={c.id} className="rounded-2xl bg-secondary/40 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{[c.contact_name, c.email].filter(Boolean).join(" · ") || "—"}</p>
                  {c.notes && <p className="mt-1 text-xs text-muted-foreground">{c.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${c.status === "active" ? "bg-emerald-500/15 text-emerald-600" : c.status === "past" ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-600"}`}>{c.status}</span>
                  <button onClick={async () => { await del({ data: { id: c.id } }); onChanged(); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
