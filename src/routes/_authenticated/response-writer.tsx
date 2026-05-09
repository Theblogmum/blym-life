import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MailCheck,
  Sparkles,
  Lock,
  Copy,
  Check,
  ThumbsUp,
  Scale,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { writeBrandResponse } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/response-writer")({
  component: ResponseWriterPage,
});

const TABS = [
  { id: "accept", label: "Accept", icon: ThumbsUp },
  { id: "negotiate", label: "Negotiate", icon: Scale },
  { id: "decline", label: "Decline", icon: XCircle },
  { id: "follow_up", label: "Follow-up", icon: Clock },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ResponseWriterPage() {
  const fn = useServerFn(writeBrandResponse);
  const fetchUsage = useServerFn(getUsageToday);
  const [message, setMessage] = useState("");
  const [rate, setRate] = useState("");
  const [notes, setNotes] = useState("");
  const [tab, setTab] = useState<TabId>("accept");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { message, rate, notes } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
    onSuccess: () => setTab("accept"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = message.trim().length > 20;

  const active = m.data ? m.data[tab] : null;

  return (
    <div>
      <PageHero
        icon={MailCheck}
        eyebrow="Response Writer"
        title="Reply like a pro — without overthinking it."
        description="Paste a brand's email or DM. We'll write four ready-to-send replies: accept, negotiate, decline, follow-up. Plus a quick read on red flags."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              The brand's message
            </p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="message">Paste their email or DM</Label>
              <Textarea
                id="message"
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi [Name], we love your content and would love to gift you our product in exchange for a Reel and 3 Stories…"
                maxLength={4000}
                className="rounded-xl bg-secondary/40"
              />
              <p className="text-xs text-foreground/60">{message.length} / 4000</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="rate">Your rate / context (optional)</Label>
                <Input
                  id="rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. £450 per Reel, £150 per Story"
                  maxLength={200}
                  className="rounded-xl bg-secondary/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Anything else? (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. I've worked with them before / I'm a fan"
                  maxLength={200}
                  className="rounded-xl bg-secondary/40"
                />
              </div>
            </div>
            <div>
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                disabled={!ready || m.isPending || locked}
                onClick={() => m.mutate()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {m.isPending ? "Writing replies…" : "Write all 4 replies"}
              </Button>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. Response Writer is a Premium tool.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <Card className="rounded-3xl p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
              What they're asking
            </p>
            <p className="mt-2 text-sm leading-relaxed">{m.data.summary}</p>
            {m.data.red_flags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                    Red flags
                  </p>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {m.data.red_flags.map((f, i) => (
                    <li key={i} className="rounded-xl bg-amber-100/70 p-2.5 text-sm text-amber-900">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card className="overflow-hidden rounded-3xl p-0">
            <div className="flex flex-wrap gap-1 border-b border-border/40 bg-secondary/40 p-2">
              {TABS.map((t) => {
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                        : "text-foreground/70 hover:bg-background"
                    }`}
                  >
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </button>
                );
              })}
            </div>
            {active && (
              <ReplyView subject={active.subject} body={active.body} />
            )}
          </Card>
        </section>
      )}
    </div>
  );
}

function ReplyView({ subject, body }: { subject: string; body: string }) {
  return (
    <div className="space-y-3 p-5 text-sm">
      <FieldRow label="Subject" value={subject} />
      <FieldRow label="Body" value={body} multiline />
      <button
        onClick={() => {
          navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
          toast.success("Reply copied!");
        }}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
      >
        <Copy className="h-3.5 w-3.5" /> Copy whole reply
      </button>
    </div>
  );
}

function FieldRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">{label}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-foreground/60 hover:bg-primary hover:text-primary-foreground"
          aria-label="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p
        className={`mt-1 rounded-2xl bg-secondary/40 p-3 leading-relaxed ${
          multiline ? "whitespace-pre-wrap" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
