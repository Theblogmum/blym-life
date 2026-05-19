import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Wallet, Receipt, Target, Users, Calculator, Check, Trash2, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";
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
  head: () => ({ meta: [{ title: "Business Mode — Blym" }] }),
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
    <div>
      <PageHero
        icon={Briefcase}
        eyebrow="business mode"
        title="Your money, calmly."
        description="income, clients, outreach and tax — in one soft view."
        variant="mint"
      />
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10">
        <div className="stagger grid gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-4">
          <div className="card-pop" style={{ ["--i" as string]: 0 }}><Stat icon={Wallet} label="Income · this month" value={`£${(d?.incomeThisMonth ?? 0).toLocaleString()}`} sub={`£${(d?.incomeThisYear ?? 0).toLocaleString()} YTD`} /></div>
          <div className="card-pop" style={{ ["--i" as string]: 1 }}><Stat icon={Receipt} label="Invoices outstanding" value={`£${(d?.outstanding ?? 0).toLocaleString()}`} sub={`£${(d?.paidThisMonth ?? 0).toLocaleString()} paid this month`} /></div>
          <div className="card-pop" style={{ ["--i" as string]: 2 }}><Stat icon={Target} label="Outreach (month)" value={`${d?.outreachDoneMonth ?? 0}${outreachGoal ? ` / ${outreachGoal}` : ""}`} sub={`${d?.followUps.filter(f=>!f.done).length ?? 0} open follow-ups`} /></div>
          <div className="card-pop" style={{ ["--i" as string]: 3 }}><Stat icon={Calculator} label="Set aside for tax" value={`£${(d?.setAside ?? 0).toLocaleString()}`} sub={`${d?.taxRate ?? 0}% of YTD income`} /></div>
        </div>

        <div className="stagger mt-6 grid gap-4 lg:grid-cols-2">
          <div className="card-pop" style={{ ["--i" as string]: 0 }}>
            <IncomeGoalCard current={d?.incomeThisMonth ?? 0} target={Number(incomeGoal)} pct={incomePct} onSaved={refresh} />
          </div>
          <div className="card-pop" style={{ ["--i" as string]: 1 }}>
            <OutreachGoalCard done={d?.outreachDoneMonth ?? 0} target={Number(outreachGoal)} pct={outreachPct} onSaved={refresh} />
          </div>
        </div>

        <div className="stagger mt-4 grid gap-4 lg:grid-cols-2">
          <div className="card-pop" style={{ ["--i" as string]: 0 }}>
            <InvoicesOverview invoices={d?.invoices ?? []} />
          </div>
          <div className="card-pop" style={{ ["--i" as string]: 1 }}>
            <TaxCard rate={d?.taxRate ?? 0} reminders={d?.taxReminders ?? []} onChanged={refresh} />
          </div>
        </div>

        <ClientsCard clients={d?.clients ?? []} onChanged={refresh} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="soft-card soft-card-hover relative overflow-hidden p-4 sm:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 90% at 0% 0%, color-mix(in oklab, var(--surface-blush) 55%, transparent), transparent 60%), radial-gradient(90% 70% at 100% 100%, color-mix(in oklab, var(--surface-peach) 28%, transparent), transparent 65%)",
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-1.5 text-foreground/55"><Icon className="h-3.5 w-3.5" /><p className="text-[10px] font-bold uppercase tracking-[0.18em]">{label}</p></div>
        <p className="mt-1.5 font-display text-[22px] font-bold leading-none tracking-[-0.015em] tabular-nums">{value}</p>
        <p className="mt-1 text-[11.5px] text-muted-foreground/90">{sub}</p>
      </div>
    </div>
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
    <div className="premium-card p-5 sm:p-6">
      <span className="editorial-label"><Wallet className="h-3 w-3" /> Monthly income goal</span>
      <p className="mt-3 font-display text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums">£{current.toLocaleString()}{target ? <span className="text-muted-foreground/80"> / £{target.toLocaleString()}</span> : null}</p>
      {target > 0 && <ProgressBar pct={pct} />}
      <div className="mt-5 flex items-end gap-2">
        <div className="flex-1"><Label className="text-xs text-muted-foreground/80">Set goal (£)</Label><Input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="2000" className="soft-input mt-1" /></div>
        <Button className="rounded-full bg-primary/85 hover:bg-primary/90" onClick={() => m.mutate()} disabled={m.isPending}>Save</Button>
      </div>
      <Link to="/income-tracker" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:gap-1.5">Open income tracker <ArrowRight className="h-3 w-3" /></Link>
    </div>
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
    <div className="premium-card p-5 sm:p-6">
      <span className="editorial-label"><Target className="h-3 w-3" /> Monthly outreach target</span>
      <p className="mt-3 font-display text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums">{done}{target ? <span className="text-muted-foreground/80"> / {target}</span> : null}</p>
      {target > 0 && <ProgressBar pct={pct} />}
      <div className="mt-5 flex items-end gap-2">
        <div className="flex-1"><Label className="text-xs text-muted-foreground/80">Pitches per month</Label><Input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="20" className="soft-input mt-1" /></div>
        <Button className="rounded-full bg-primary/85 hover:bg-primary/90" onClick={() => m.mutate()} disabled={m.isPending}>Save</Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground/80">Counts completed follow-ups. Add new ones from your Home dashboard.</p>
    </div>
  );
}

function InvoicesOverview({ invoices }: { invoices: any[] }) {
  return (
    <div className="premium-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="editorial-label"><Receipt className="h-3 w-3" /> Invoice overview</span>
        <Link to="/invoices" className="text-xs font-semibold text-primary transition hover:opacity-80">All invoices →</Link>
      </div>
      {invoices.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground/85">your paid era starts here. <Link to="/invoices" className="font-semibold text-primary">send your first invoice →</Link></p>
      ) : (
        <ul className="mt-4 space-y-2">
          {invoices.slice(0, 6).map(i => {
            const total = Array.isArray(i.items) ? i.items.reduce((s: number, it: any) => s + Number(it.qty ?? 1) * Number(it.unit_price ?? it.price ?? 0), 0) : 0;
            return (
              <li key={i.id} className="flex items-center justify-between rounded-2xl border border-border/40 bg-secondary/35 px-3 py-2 text-sm transition hover:border-border/70 hover:bg-secondary/55">
                <span className="min-w-0 truncate"><span className="font-semibold">{i.brand_name}</span> · <span className="text-muted-foreground">{i.issue_date}</span></span>
                <span className="flex items-center gap-2"><span>£{total.toLocaleString()}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${i.status === "paid" ? "bg-emerald-500/15 text-emerald-600" : i.status === "sent" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground"}`}>{i.status}</span></span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
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
    <div className="premium-card p-5 sm:p-6">
      <span className="editorial-label"><Calculator className="h-3 w-3" /> Tax reminders</span>
      <div className="mt-4 flex items-end gap-2">
        <div className="w-32"><Label className="text-xs text-muted-foreground/80">Set-aside %</Label><Input type="number" value={r} onChange={e => setR(e.target.value)} placeholder="20" className="soft-input mt-1" /></div>
        <Button
          variant="outline"
          className="relative rounded-full border-primary/40 bg-[image:radial-gradient(120%_140%_at_0%_0%,color-mix(in_oklab,var(--surface-blush)_70%,transparent),transparent_60%),radial-gradient(120%_140%_at_100%_100%,color-mix(in_oklab,var(--surface-peach)_55%,transparent),transparent_65%)] text-foreground shadow-[0_6px_24px_-10px_color-mix(in_oklab,var(--primary)_45%,transparent)] hover:border-primary/55"
          onClick={() => rateMut.mutate()}
          disabled={rateMut.isPending}
        >Save rate</Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_140px_120px_auto]">
        <Input placeholder="Title (e.g. Self assessment)" value={title} onChange={e => setTitle(e.target.value)} className="soft-input" />
        <Input type="date" value={due} onChange={e => setDue(e.target.value)} className="soft-input" />
        <Input type="number" placeholder="£ amount" value={amount} onChange={e => setAmount(e.target.value)} className="soft-input" />
        <Button className="rounded-full bg-primary/85 hover:bg-primary/90" onClick={() => addMut.mutate()} disabled={!title || !due || addMut.isPending}><Plus className="h-4 w-4" /></Button>
      </div>

      {reminders.length > 0 && (
        <ul className="mt-4 space-y-2">
          {reminders.map(rem => {
            const overdue = !rem.done && new Date(rem.due_date) < new Date();
            return (
              <li key={rem.id} className="flex items-center gap-2 rounded-2xl border border-border/40 bg-secondary/35 px-3 py-2 text-sm transition hover:border-border/70 hover:bg-secondary/55">
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
    </div>
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
    <div className="premium-card mt-6 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="editorial-label"><Users className="h-3 w-3" /> Clients</span>
        <Button size="sm" className="rounded-full bg-primary/85 hover:bg-primary/90" onClick={() => setOpen(o => !o)}>{open ? "Cancel" : <><Plus className="mr-1 h-4 w-4" /> Add client</>}</Button>
      </div>

      {open && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Input placeholder="Brand name" value={name} onChange={e => setName(e.target.value)} className="soft-input" />
          <Input placeholder="Contact name" value={contact} onChange={e => setContact(e.target.value)} className="soft-input" />
          <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="soft-input" />
          <select className="soft-input h-10 px-3 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="lead">Lead</option><option value="active">Active</option><option value="past">Past</option>
          </select>
          <Textarea className="soft-input sm:col-span-2" placeholder="Notes (rates, contact rhythm, gifting…)" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          <Button className="rounded-full bg-primary/85 hover:bg-primary/90 sm:col-span-2" onClick={() => m.mutate()} disabled={!name || m.isPending}>Save client</Button>
        </div>
      )}

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground/85">No clients yet. Add brands you've worked with or want to pitch.</p>
      ) : (
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {clients.map(c => (
            <li key={c.id} className="rounded-2xl border border-border/40 bg-secondary/35 p-3 text-sm transition hover:border-border/70 hover:bg-secondary/55">
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
    </div>
  );
}
