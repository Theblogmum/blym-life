import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Building2,
  Search,
  Plus,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Mail,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { PageHero, UsageChip } from "@/components/page-hero";
import { getTrialStatus } from "@/lib/usage.functions";
import {
  listBrands,
  addUserBrand,
  deleteUserBrand,
  composePitch,
  updatePitchStatus,
  deletePitch,
} from "@/lib/brand-hub.functions";
import {
  getGmailConnection,
  startGmailConnect,
  disconnectGmail,
  sendPitchViaGmail,
} from "@/lib/gmail.functions";
import { cn } from "@/lib/utils";

function buildMailto(to: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const Route = createFileRoute("/_authenticated/brand-hub")({
  component: BrandHubPage,
});

type Brand = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  website?: string | null;
  instagram?: string | null;
  contact_email?: string | null;
  hq_country?: string | null;
};

type UserBrand = {
  id: string;
  name: string;
  category?: string | null;
  website?: string | null;
  instagram?: string | null;
  contact_email?: string | null;
  notes?: string | null;
};

type Pitch = {
  id: string;
  brand_id: string | null;
  user_brand_id: string | null;
  brand_name?: string | null;
  recipient_email: string;
  subject: string;
  body: string;
  follow_up_body?: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
  replied_at: string | null;
  follow_up_due_at: string | null;
  follow_up_sent_at: string | null;
};

function BrandHubPage() {
  const fetchBrands = useServerFn(listBrands);
  const fetchTrial = useServerFn(getTrialStatus);
  const q = useQuery({ queryKey: ["brand-hub"], queryFn: () => fetchBrands() });
  const trial = useQuery({ queryKey: ["trial"], queryFn: () => fetchTrial() });

  const premium = !!trial.data?.premium;
  const inTrial = !!trial.data?.inTrial;
  const daysLeft = trial.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;

  const brands = (q.data?.brands ?? []) as Brand[];
  const myBrands = (q.data?.myBrands ?? []) as UserBrand[];
  const pitches = (q.data?.pitches ?? []) as Pitch[];

  return (
    <div>
      <PageHero
        icon={Building2}
        eyebrow="Brand Hub"
        title="Pitch the right brands. Track every reply."
        description="A directory of UK mum-friendly brands plus your private list — write, send and follow up without double-pitching."
        variant="bloom"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <GmailConnectCard />

        {locked && (
          <Card className="mb-6 flex items-center justify-between gap-4 rounded-3xl border-0 surface-plum p-5">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5" />
              <div>
                <p className="font-bold">Trial ended</p>
                <p className="text-sm text-foreground/70">Upgrade to keep pitching brands and tracking outreach.</p>
              </div>
            </div>
            <Link to="/settings">
              <Button className="rounded-full">Upgrade</Button>
            </Link>
          </Card>
        )}

        <Tabs defaultValue="discover">
          <TabsList className="mb-6 rounded-full bg-secondary p-1">
            <TabsTrigger value="discover" className="rounded-full data-[state=active]:bg-background">
              Discover ({brands.length})
            </TabsTrigger>
            <TabsTrigger value="mine" className="rounded-full data-[state=active]:bg-background">
              My Brands ({myBrands.length})
            </TabsTrigger>
            <TabsTrigger value="outreach" className="rounded-full data-[state=active]:bg-background">
              Outreach ({pitches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <DiscoverTab brands={brands} pitches={pitches} locked={locked} />
          </TabsContent>

          <TabsContent value="mine">
            <MyBrandsTab myBrands={myBrands} pitches={pitches} locked={locked} />
          </TabsContent>

          <TabsContent value="outreach">
            <OutreachTab pitches={pitches} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

/* ---------------- Discover tab ---------------- */

function DiscoverTab({ brands, pitches, locked }: { brands: Brand[]; pitches: Pitch[]; locked: boolean }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const categories = useMemo(() => {
    const set = new Set(brands.map((b) => b.category).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [brands]);
  const pitchedEmails = new Set(pitches.map((p) => p.recipient_email.toLowerCase()));

  const filtered = brands.filter((b) => {
    const matchSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || b.category === category;
    return matchSearch && matchCat;
  });

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands…"
            className="h-11 rounded-2xl bg-secondary/40 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold capitalize",
                category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <BrandCard
            key={b.id}
            brand={b}
            alreadyPitched={!!b.contact_email && pitchedEmails.has(b.contact_email.toLowerCase())}
            locked={locked}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">No brands match.</p>
        )}
      </div>
    </>
  );
}

function BrandCard({
  brand,
  alreadyPitched,
  locked,
}: {
  brand: Brand;
  alreadyPitched: boolean;
  locked: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3 rounded-3xl border-0 p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-black">{brand.name}</p>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {brand.category}
          </p>
        </div>
        {brand.website && (
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-secondary p-2 text-muted-foreground hover:text-primary"
            aria-label="Open website"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      {brand.description && (
        <p className="text-sm text-foreground/70 line-clamp-3">{brand.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {brand.contact_email ? brand.contact_email : "No email yet"}
        </span>
        <ComposeDialog
          brand={{
            id: brand.id,
            name: brand.name,
            contact_email: brand.contact_email ?? "",
          }}
          alreadyPitched={alreadyPitched}
          locked={locked}
        />
      </div>
    </Card>
  );
}

/* ---------------- My Brands tab ---------------- */

function MyBrandsTab({
  myBrands,
  pitches,
  locked,
}: {
  myBrands: UserBrand[];
  pitches: Pitch[];
  locked: boolean;
}) {
  const qc = useQueryClient();
  const addFn = useServerFn(addUserBrand);
  const delFn = useServerFn(deleteUserBrand);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", instagram: "", contact_email: "", category: "", notes: "" });

  const addM = useMutation({
    mutationFn: () => addFn({ data: form }),
    onSuccess: () => {
      toast.success("Brand added");
      setForm({ name: "", website: "", instagram: "", contact_email: "", category: "", notes: "" });
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["brand-hub"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand-hub"] }),
  });

  const pitchedEmails = new Set(pitches.map((p) => p.recipient_email.toLowerCase()));

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Private list — only you see these.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-1 h-4 w-4" /> Add brand
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Add a brand</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Field label="Brand name *" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Aldi UK" />
              <Field label="Category" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="Supermarket" />
              <Field label="Contact email" value={form.contact_email} onChange={(v) => setForm((f) => ({ ...f, contact_email: v }))} placeholder="press@brand.com" />
              <Field label="Website" value={form.website} onChange={(v) => setForm((f) => ({ ...f, website: v }))} placeholder="https://" />
              <Field label="Instagram" value={form.instagram} onChange={(v) => setForm((f) => ({ ...f, instagram: v }))} placeholder="@brand" />
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</Label>
                <Textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="mt-1.5 rounded-2xl bg-secondary/40"
                />
              </div>
              <Button
                disabled={!form.name.trim() || addM.isPending}
                onClick={() => addM.mutate()}
                className="w-full rounded-2xl"
              >
                {addM.isPending ? "Adding…" : "Save brand"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {myBrands.map((b) => (
          <Card key={b.id} className="flex flex-col gap-2 rounded-3xl border-0 p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-black">{b.name}</p>
                {b.category && (
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {b.category}
                  </p>
                )}
              </div>
              <button
                onClick={() => delM.mutate(b.id)}
                className="rounded-full bg-secondary p-2 text-muted-foreground hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {b.notes && <p className="text-sm text-foreground/70 line-clamp-3">{b.notes}</p>}
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{b.contact_email || "No email"}</span>
              <ComposeDialog
                brand={{
                  user_brand_id: b.id,
                  name: b.name,
                  contact_email: b.contact_email ?? "",
                }}
                alreadyPitched={!!b.contact_email && pitchedEmails.has(b.contact_email.toLowerCase())}
                locked={locked}
              />
            </div>
          </Card>
        ))}
        {myBrands.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">No private brands yet — add one above.</p>
        )}
      </div>
    </>
  );
}

/* ---------------- Compose dialog ---------------- */

function ComposeDialog({
  brand,
  alreadyPitched,
  locked,
}: {
  brand: { id?: string; user_brand_id?: string; name: string; contact_email: string };
  alreadyPitched: boolean;
  locked: boolean;
}) {
  const qc = useQueryClient();
  const fn = useServerFn(composePitch);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(brand.contact_email);
  const [angle, setAngle] = useState("");
  const [draft, setDraft] = useState<{ id: string; subject: string; body: string; follow_up_body: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const m = useMutation({
    mutationFn: () =>
      fn({
        data: {
          brand_id: brand.id,
          user_brand_id: brand.user_brand_id,
          brand_name: brand.name,
          recipient_email: email,
          angle,
        },
      }),
    onSuccess: (row: any) => {
      setDraft(row);
      qc.invalidateQueries({ queryKey: ["brand-hub"] });
      toast.success("Pitch drafted!");
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  if (alreadyPitched) {
    return (
      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
        ✓ Pitched
      </span>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setDraft(null);
          setAngle("");
          setEmail(brand.contact_email);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full" disabled={locked}>
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          Pitch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Pitch {brand.name}</DialogTitle>
        </DialogHeader>
        {!draft ? (
          <div className="space-y-3">
            <Field
              label="Recipient email *"
              value={email}
              onChange={setEmail}
              placeholder="press@brand.com"
            />
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Your angle (optional)
              </Label>
              <Textarea
                rows={3}
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="e.g. Family-friendly recipe reels using their product"
                className="mt-1.5 rounded-2xl bg-secondary/40"
              />
            </div>
            <Button
              disabled={!email.trim() || m.isPending}
              onClick={() => m.mutate()}
              className="w-full rounded-2xl"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {m.isPending ? "Writing…" : "Generate pitch + follow-up"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">To</p>
              <p className="text-sm">{email}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Subject</p>
              <p className="text-sm font-semibold">{draft.subject}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Email</p>
              <p className="mt-1 whitespace-pre-line rounded-2xl bg-secondary/40 p-4 text-sm">{draft.body}</p>
            </div>
            {draft.follow_up_body && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  4-day follow-up (saved for later)
                </p>
                <p className="mt-1 whitespace-pre-line rounded-2xl bg-secondary/40 p-4 text-sm">
                  {draft.follow_up_body}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1 rounded-2xl"
                asChild
              >
                <a
                  href={buildMailto(email, draft.subject, draft.body)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => toast.success("Opening your email app — hit Send there!")}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Open in email app
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-2xl"
                onClick={() => {
                  navigator.clipboard.writeText(`To: ${email}\nSubject: ${draft.subject}\n\n${draft.body}`);
                  setCopied(true);
                  toast.success("Copied — paste into Gmail");
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy
              </Button>
              <MarkSentButton
                pitchId={draft.id}
                onDone={() => {
                  setOpen(false);
                  setDraft(null);
                }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Tip: "Open in email app" pre-fills your Gmail/Apple Mail with everything ready — just hit Send. Then mark as sent so we can track follow-ups.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MarkSentButton({ pitchId, onDone }: { pitchId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const fn = useServerFn(updatePitchStatus);
  const m = useMutation({
    mutationFn: () => fn({ data: { id: pitchId, status: "sent" } }),
    onSuccess: () => {
      toast.success("Marked as sent — follow-up due in 4 days");
      qc.invalidateQueries({ queryKey: ["brand-hub"] });
      onDone();
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
  return (
    <Button className="flex-1 rounded-2xl" disabled={m.isPending} onClick={() => m.mutate()}>
      <Send className="mr-2 h-4 w-4" />
      Mark as sent
    </Button>
  );
}

/* ---------------- Outreach tab ---------------- */

function OutreachTab({ pitches }: { pitches: Pitch[] }) {
  const qc = useQueryClient();
  const updateFn = useServerFn(updatePitchStatus);
  const delFn = useServerFn(deletePitch);
  const update = useMutation({
    mutationFn: (v: { id: string; status: any }) => updateFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand-hub"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand-hub"] }),
  });

  if (pitches.length === 0) {
    return (
      <Card className="rounded-3xl border-0 p-10 text-center shadow-[var(--shadow-soft)]">
        <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-bold">No pitches yet</p>
        <p className="text-sm text-muted-foreground">Find a brand in Discover or My Brands to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {pitches.map((p) => {
        const followUpDue =
          p.status === "sent" &&
          p.follow_up_due_at &&
          !p.follow_up_sent_at &&
          new Date(p.follow_up_due_at).getTime() < Date.now();
        return (
          <Card key={p.id} className="flex flex-col gap-3 rounded-3xl border-0 p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center">
            <PitchViewer pitch={p} followUpDue={!!followUpDue} />
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-full">
                <a
                  href={buildMailto(p.recipient_email, p.subject, p.body || "")}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Send className="mr-1 h-3.5 w-3.5" /> Send
                </a>
              </Button>
              {p.status === "draft" && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => update.mutate({ id: p.id, status: "sent" })}>
                  Mark sent
                </Button>
              )}
              {p.status === "sent" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => update.mutate({ id: p.id, status: "replied" })}
                >
                  Mark replied
                </Button>
              )}
              <button
                onClick={() => del.mutate(p.id)}
                className="rounded-full bg-secondary p-2 text-muted-foreground hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function PitchViewer({ pitch, followUpDue }: { pitch: Pitch; followUpDue: boolean }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <StatusBadge status={pitch.status} />
            {followUpDue && (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                Follow-up due
              </span>
            )}
          </div>
          <p className="mt-2 font-semibold hover:underline">{pitch.subject}</p>
          <p className="text-xs text-muted-foreground">
            {pitch.recipient_email} · {new Date(pitch.created_at).toLocaleDateString("en-GB")}
          </p>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{pitch.brand_name || "Pitch"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">To</p>
            <p className="text-sm">{pitch.recipient_email}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Subject</p>
            <p className="text-sm font-semibold">{pitch.subject}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Email</p>
            <p className="mt-1 whitespace-pre-line rounded-2xl bg-secondary/40 p-4 text-sm">{pitch.body}</p>
          </div>
          {pitch.follow_up_body && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                4-day follow-up
              </p>
              <p className="mt-1 whitespace-pre-line rounded-2xl bg-secondary/40 p-4 text-sm">
                {pitch.follow_up_body}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1 rounded-2xl">
              <a
                href={buildMailto(pitch.recipient_email, pitch.subject, pitch.body || "")}
                target="_blank"
                rel="noreferrer"
                onClick={() => toast.success("Opening your email app — hit Send there!")}
              >
                <Send className="mr-2 h-4 w-4" /> Open in email app
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-2xl"
              onClick={() => {
                navigator.clipboard.writeText(
                  `To: ${pitch.recipient_email}\nSubject: ${pitch.subject}\n\n${pitch.body}`,
                );
                setCopied(true);
                toast.success("Copied!");
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Opens in your default mail app (Gmail, Apple Mail, Outlook…) with everything pre-filled.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-secondary text-foreground/70",
    sent: "bg-blue-500/15 text-blue-700",
    replied: "bg-emerald-500/15 text-emerald-700",
    cancelled: "bg-rose-500/15 text-rose-700",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", map[status] ?? map.draft)}>
      {status}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 rounded-2xl bg-secondary/40"
      />
    </div>
  );
}

/* ---------------- Gmail connection ---------------- */

function GmailConnectCard() {
  const qc = useQueryClient();
  const fetchConn = useServerFn(getGmailConnection);
  const startFn = useServerFn(startGmailConnect);
  const disconnectFn = useServerFn(disconnectGmail);
  const conn = useQuery({ queryKey: ["gmail-connection"], queryFn: () => fetchConn() });

  const connect = useMutation({
    mutationFn: () => startFn({ data: undefined as any }),
    onSuccess: (res: any) => {
      const popup = window.open(res.url, "gmail-oauth", "width=520,height=680");
      if (!popup) {
        window.location.href = res.url;
        return;
      }
      const onMsg = (e: MessageEvent) => {
        if (e.data?.type === "gmail-oauth") {
          window.removeEventListener("message", onMsg);
          qc.invalidateQueries({ queryKey: ["gmail-connection"] });
          if (e.data.ok) toast.success("Gmail connected!");
          else toast.error("Gmail connection failed");
        }
      };
      window.addEventListener("message", onMsg);
      // Fallback poll in case popup closes without postMessage
      const poll = setInterval(() => {
        if (popup.closed) {
          clearInterval(poll);
          window.removeEventListener("message", onMsg);
          qc.invalidateQueries({ queryKey: ["gmail-connection"] });
        }
      }, 1000);
    },
    onError: (e: any) => toast.error(e.message || "Could not start Gmail connect"),
  });

  const disconnect = useMutation({
    mutationFn: () => disconnectFn({ data: undefined as any }),
    onSuccess: () => {
      toast.success("Gmail disconnected");
      qc.invalidateQueries({ queryKey: ["gmail-connection"] });
    },
  });

  const connected = !!conn.data?.connected;

  return (
    <Card
      className={cn(
        "mb-6 flex flex-col gap-3 rounded-3xl border-0 p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between",
        connected ? "surface-mint" : "surface-peach",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-background/60 p-2.5">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-base font-black">
            {connected ? "Gmail connected" : "Send pitches direct from your Gmail"}
          </p>
          <p className="text-sm text-foreground/70">
            {connected
              ? `Pitches will send from ${conn.data?.email}. Brands reply straight to you.`
              : "One-click connect lets you hit Send without leaving the app — replies land in your own inbox."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {connected ? (
          <Button
            variant="outline"
            className="rounded-full"
            disabled={disconnect.isPending}
            onClick={() => disconnect.mutate()}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            className="rounded-full"
            disabled={connect.isPending}
            onClick={() => connect.mutate()}
          >
            <Mail className="mr-2 h-4 w-4" />
            {connect.isPending ? "Opening Google…" : "Connect Gmail"}
          </Button>
        )}
      </div>
    </Card>
  );
}

function useGmailConnected() {
  const fetchConn = useServerFn(getGmailConnection);
  const conn = useQuery({ queryKey: ["gmail-connection"], queryFn: () => fetchConn() });
  return !!conn.data?.connected;
}

function SendViaGmailButton({
  pitchId,
  className,
  size = "sm",
  label = "Send",
  onSent,
}: {
  pitchId: string;
  className?: string;
  size?: "sm" | "default";
  label?: string;
  onSent?: () => void;
}) {
  const qc = useQueryClient();
  const fn = useServerFn(sendPitchViaGmail);
  const m = useMutation({
    mutationFn: () => fn({ data: { pitchId } }),
    onSuccess: () => {
      toast.success("Sent! Follow-up due in 4 days.");
      qc.invalidateQueries({ queryKey: ["brand-hub"] });
      onSent?.();
    },
    onError: (e: any) => toast.error(e.message || "Send failed"),
  });
  return (
    <Button
      size={size}
      className={cn("rounded-full", className)}
      disabled={m.isPending}
      onClick={() => m.mutate()}
    >
      <Send className="mr-1 h-3.5 w-3.5" />
      {m.isPending ? "Sending…" : label}
    </Button>
  );
}