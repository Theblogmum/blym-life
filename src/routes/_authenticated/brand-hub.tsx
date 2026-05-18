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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Search, Sparkles, Plus, Mail, Copy, Check, Lock, Send, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listBrands, addUserBrand } from "@/lib/brands.functions";
import { listPitches, composePitch, savePitchDraft, updatePitchStatus, deletePitch } from "@/lib/pitches.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_authenticated/brand-hub")({
  component: BrandHubPage,
});

type Brand = {
  id: string;
  name: string;
  website?: string | null;
  category?: string | null;
  description?: string | null;
  contact_email?: string | null;
  notes?: string | null;
};

type Pitch = {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
  status: string;
  sent_at: string | null;
  follow_up_due_at: string | null;
  replied_at: string | null;
  brand?: { name: string } | null;
  user_brand?: { name: string } | null;
};

function BrandHubPage() {
  const fetchBrands = useServerFn(listBrands);
  const fetchPitches = useServerFn(listPitches);
  const fetchUsage = useServerFn(getUsageToday);
  const qc = useQueryClient();

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const brandsQ = useQuery({ queryKey: ["brands"], queryFn: () => fetchBrands({ data: {} }) });
  const pitchesQ = useQuery({ queryKey: ["pitches"], queryFn: () => fetchPitches() });

  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const locked = !premium && !inTrial;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [composer, setComposer] = useState<{ brand?: Brand; userBrand?: Brand } | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    const all = brandsQ.data?.brands ?? [];
    return all.filter((b) => {
      if (category && b.category !== category) return false;
      if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [brandsQ.data, search, category]);

  const counts = useMemo(() => {
    const p = pitchesQ.data?.pitches ?? [];
    return {
      sent: p.filter((x) => x.status === "sent").length,
      followed: p.filter((x) => x.status === "followed_up").length,
      replied: p.filter((x) => x.status === "replied").length,
      drafts: p.filter((x) => x.status === "draft").length,
    };
  }, [pitchesQ.data]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["pitches"] });
    qc.invalidateQueries({ queryKey: ["brands"] });
  };

  return (
    <div>
      <PageHero
        icon={Building2}
        eyebrow="Brand Hub"
        title="Find brands. Pitch them. Track replies."
        description="A directory of UK mum-friendly brands plus your own outreach inbox — drafts, follow-ups, and replies in one place."
        variant="bloom"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={usage.data?.daysLeft ?? null} />
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="discover" className="rounded-xl">Discover</TabsTrigger>
            <TabsTrigger value="outreach" className="rounded-xl">My Outreach</TabsTrigger>
            <TabsTrigger value="status" className="rounded-xl">Inbox status</TabsTrigger>
          </TabsList>

          {/* DISCOVER */}
          <TabsContent value="discover" className="mt-5 space-y-4">
            <Card className="rounded-3xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search brands…"
                    className="rounded-xl bg-secondary/40 pl-9"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 rounded-xl border border-border bg-secondary/40 px-3 text-sm"
                >
                  <option value="">All categories</option>
                  {(brandsQ.data?.categories ?? []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Button onClick={() => setShowAdd(true)} variant="outline" size="sm" className="rounded-xl">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add brand
                </Button>
              </div>
            </Card>

            {locked && (
              <Card className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-4 text-sm">
                <p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Pitching is a Premium tool.</p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </Card>
            )}

            {(brandsQ.data?.userBrands?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Your brands</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {brandsQ.data!.userBrands.map((b: any) => (
                    <BrandCard
                      key={b.id}
                      brand={{ id: b.id, name: b.name, website: b.website, contact_email: b.contact_email, notes: b.notes }}
                      mine
                      onPitch={() => setComposer({ userBrand: b })}
                      disabled={locked}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {filtered.length} brand{filtered.length === 1 ? "" : "s"}
              </h3>
              {brandsQ.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading brands…</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((b: Brand) => (
                    <BrandCard key={b.id} brand={b} onPitch={() => setComposer({ brand: b })} disabled={locked} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* OUTREACH */}
          <TabsContent value="outreach" className="mt-5">
            <OutreachTable pitches={(pitchesQ.data?.pitches ?? []) as Pitch[]} onChanged={refresh} />
          </TabsContent>

          {/* STATUS */}
          <TabsContent value="status" className="mt-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Drafts" value={counts.drafts} variant="surface-butter" />
              <StatCard label="Sent" value={counts.sent} variant="surface-mint" />
              <StatCard label="Followed up" value={counts.followed} variant="surface-peach" />
              <StatCard label="Replied" value={counts.replied} variant="surface-plum" />
            </div>
            <Card className="mt-4 rounded-3xl p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Heads up</p>
              <p className="mt-1">Pitches save as <strong>drafts</strong> here so you can copy/paste into Gmail or your email tool. Auto-send + reply tracking will switch on when Gmail integration is connected (admin setup pending).</p>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {composer && (
        <PitchComposer
          brand={composer.brand}
          userBrand={composer.userBrand}
          onClose={() => setComposer(null)}
          onSaved={() => { refresh(); setComposer(null); }}
          locked={locked}
        />
      )}
      {showAdd && <AddBrandDialog onClose={() => setShowAdd(false)} onAdded={() => { refresh(); setShowAdd(false); }} />}
    </div>
  );
}

function StatCard({ label, value, variant }: { label: string; value: number; variant: string }) {
  return (
    <Card className={`rounded-3xl p-5 ${variant}`}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">{label}</p>
      <p className="mt-2 font-display text-4xl font-black">{value}</p>
    </Card>
  );
}

function BrandCard({
  brand, mine, onPitch, disabled,
}: { brand: Brand; mine?: boolean; onPitch: () => void; disabled?: boolean }) {
  return (
    <Card className="flex flex-col rounded-3xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-black leading-tight">{brand.name}</p>
          {brand.category && (
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">{brand.category}</p>
          )}
        </div>
        {mine && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Mine</span>}
      </div>
      {brand.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{brand.description}</p>}
      {brand.notes && <p className="mt-2 text-xs text-foreground/70">{brand.notes}</p>}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        {brand.website && (
          <a href={brand.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
            <ExternalLink className="h-3 w-3" /> Website
          </a>
        )}
        {brand.contact_email && <span className="truncate">{brand.contact_email}</span>}
      </div>
      <Button
        onClick={onPitch}
        disabled={disabled}
        size="sm"
        className="mt-4 w-full rounded-xl"
      >
        <Sparkles className="mr-1 h-3.5 w-3.5" /> Pitch this brand
      </Button>
    </Card>
  );
}

function PitchComposer({
  brand, userBrand, onClose, onSaved, locked,
}: {
  brand?: Brand; userBrand?: Brand; onClose: () => void; onSaved: () => void; locked: boolean;
}) {
  const target = brand ?? userBrand!;
  const compose = useServerFn(composePitch);
  const save = useServerFn(savePitchDraft);

  const [angle, setAngle] = useState("");
  const [recipient, setRecipient] = useState(target.contact_email ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  const composeM = useMutation({
    mutationFn: () => compose({
      data: {
        brand_id: brand?.id,
        user_brand_id: userBrand?.id,
        brand_name: target.name,
        brand_category: target.category ?? undefined,
        angle,
      },
    }),
    onSuccess: (d) => { setSubject(d.subject); setBody(d.body); },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveM = useMutation({
    mutationFn: (status: "draft" | "sent") => save({
      data: {
        brand_id: brand?.id,
        user_brand_id: userBrand?.id,
        recipient_email: recipient,
        subject, body, status,
      },
    }),
    onSuccess: (_, status) => {
      toast.success(status === "sent" ? "Marked as sent — we'll remind you to follow up in 4 days." : "Draft saved.");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full max-w-xl overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Pitch {target.name}</SheetTitle>
          <SheetDescription>
            Draft a warm, on-brand outreach email. Save as a draft, or mark as sent and we'll remind you to follow up in 4 days.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Angle (optional)</Label>
            <Textarea
              rows={2}
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="e.g. paid Reels collab around weaning, or a gifted-with-fee partnership"
              className="rounded-xl bg-secondary/40"
            />
          </div>
          <Button
            onClick={() => composeM.mutate()}
            disabled={composeM.isPending || locked}
            className="w-full rounded-xl"
          >
            <Sparkles className="mr-1 h-4 w-4" />
            {composeM.isPending ? "Drafting…" : subject ? "Re-draft" : "Draft email with AI"}
          </Button>

          {locked && (
            <p className="rounded-xl surface-plum p-2 text-xs">
              <Lock className="mr-1 inline h-3 w-3" /> Pitching is Premium — your draft will save here once you upgrade.
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Recipient email</Label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="press@brand.com"
              className="rounded-xl bg-secondary/40"
              type="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl bg-secondary/40" />
          </div>
          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} className="rounded-xl bg-secondary/40" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={copy} variant="outline" className="rounded-xl">
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              onClick={() => saveM.mutate("draft")}
              variant="outline"
              disabled={saveM.isPending || !subject || !body}
              className="rounded-xl"
            >
              Save draft
            </Button>
            <Button
              onClick={() => saveM.mutate("sent")}
              disabled={saveM.isPending || !subject || !body || !recipient}
              className="rounded-xl"
            >
              <Send className="mr-1 h-4 w-4" /> Mark as sent
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddBrandDialog({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const add = useServerFn(addUserBrand);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const m = useMutation({
    mutationFn: () => add({ data: { name, website, contact_email: email, notes } }),
    onSuccess: () => { toast.success("Brand added."); onAdded(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full max-w-md sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add a brand</SheetTitle>
          <SheetDescription>Saved to your private list — only you can see it.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5"><Label>Brand name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
          <div className="space-y-1.5"><Label>Website</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
          <div className="space-y-1.5"><Label>Contact email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
          <div className="space-y-1.5"><Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl bg-secondary/40" /></div>
          <Button onClick={() => m.mutate()} disabled={!name.trim() || m.isPending} className="w-full rounded-xl">
            {m.isPending ? "Saving…" : "Save brand"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function OutreachTable({ pitches, onChanged }: { pitches: Pitch[]; onChanged: () => void }) {
  const updateStatus = useServerFn(updatePitchStatus);
  const del = useServerFn(deletePitch);

  const statusM = useMutation({
    mutationFn: (v: { id: string; status: any }) => updateStatus({ data: v }),
    onSuccess: () => { toast.success("Updated."); onChanged(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted."); onChanged(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (pitches.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        tone="bloom"
        title="No pitches yet"
        description="Head to Discover, pick a brand and send your first pitch. Drafts, sends and follow-ups all land here."
        hint="+15 XP per pitch sent"
      />
    );
  }

  return (
    <div className="grid gap-3">
      {pitches.map((p) => {
        const brandName = p.brand?.name ?? p.user_brand?.name ?? p.recipient_email;
        const followDue = p.follow_up_due_at ? new Date(p.follow_up_due_at).getTime() < Date.now() : false;
        return (
          <Card key={p.id} className="rounded-3xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-base font-black">{brandName}</p>
                  <StatusBadge status={p.status} followDue={followDue} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.recipient_email}</p>
                <p className="mt-2 line-clamp-1 text-sm font-semibold">{p.subject}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.body}</p>
                {p.sent_at && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Sent {new Date(p.sent_at).toLocaleDateString("en-GB")}
                    {p.follow_up_due_at && p.status === "sent" && (
                      <> · Follow up by {new Date(p.follow_up_due_at).toLocaleDateString("en-GB")}</>
                    )}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.status === "draft" && (
                  <Button size="sm" variant="outline" className="rounded-xl"
                    onClick={() => statusM.mutate({ id: p.id, status: "sent" })}>
                    Mark sent
                  </Button>
                )}
                {(p.status === "sent" || p.status === "followed_up") && (
                  <>
                    <Button size="sm" variant="outline" className="rounded-xl"
                      onClick={() => statusM.mutate({ id: p.id, status: "replied" })}>
                      Mark replied
                    </Button>
                    {p.status === "sent" && (
                      <Button size="sm" variant="outline" className="rounded-xl"
                        onClick={() => statusM.mutate({ id: p.id, status: "followed_up" })}>
                        Mark followed up
                      </Button>
                    )}
                  </>
                )}
                <Button size="icon" variant="ghost" className="rounded-xl text-muted-foreground hover:text-destructive"
                  onClick={() => delM.mutate(p.id)} aria-label="Delete pitch">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function StatusBadge({ status, followDue }: { status: string; followDue: boolean }) {
  const map: Record<string, string> = {
    draft: "bg-secondary text-foreground/70",
    sent: "surface-mint",
    followed_up: "surface-peach",
    replied: "surface-plum",
    bounced: "bg-destructive/10 text-destructive",
    cancelled: "bg-secondary text-muted-foreground",
  };
  const label = status === "followed_up" ? "Followed up" : status[0].toUpperCase() + status.slice(1);
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? "bg-secondary"}`}>
      {label}{followDue && status === "sent" ? " · follow up due" : ""}
    </span>
  );
}