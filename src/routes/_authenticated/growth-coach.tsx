import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Trash2, Lock, Target, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { listCoachMessages, sendCoachMessage, clearCoachHistory } from "@/lib/coach.functions";
import { PageHero } from "@/components/page-hero";
import { PersonaBubble } from "@/components/ai-persona";
import { GrowthSnapshotForm } from "@/components/growth-snapshot-form";
import { AudienceFitPanel } from "@/components/audience-fit-panel";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "What should I post today?",
  "Why did my last 3 reels flop?",
  "Give me a content plan for this week",
  "What hook style works best for my niche?",
];

export const Route = createFileRoute("/_authenticated/growth-coach")({
  component: GrowthCoachPage,
});

function GrowthCoachPage() {
  const fetchHistory = useServerFn(listCoachMessages);
  const sendFn = useServerFn(sendCoachMessage);
  const clearFn = useServerFn(clearCoachHistory);
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const history = useQuery({
    queryKey: ["coach-messages"],
    queryFn: () => fetchHistory(),
  });

  const send = useMutation({
    mutationFn: (content: string) => sendFn({ data: { content } }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["coach-messages"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to send"),
  });

  const clear = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coach-messages"] });
      toast.success("Chat cleared");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history.data?.messages.length, send.isPending]);

  const messages = history.data?.messages ?? [];
  const locked = send.error?.message?.includes("unlocked on Pro");

  const handleSend = () => {
    const text = draft.trim();
    if (!text || send.isPending) return;
    // Optimistic: push user message into cache so it shows instantly
    qc.setQueryData(["coach-messages"], (old: { messages: Array<{ id: string; role: string; content: string; created_at: string }> } | undefined) => ({
      messages: [
        ...(old?.messages ?? []),
        { id: `tmp-${Date.now()}`, role: "user", content: text, created_at: new Date().toISOString() },
      ],
    }));
    send.mutate(text);
  };

  return (
    <div>
      <PageHero
        icon={Sparkles}
        eyebrow="Growth Coach"
        title="Chat with Bloom — your AI strategist"
        description="She knows your niche, your last 14 days of posts, your goals — and gives concrete advice, not generic fluff."
        variant="plum"
      />

      <section className="mx-auto max-w-3xl px-5 py-8">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          {/* Messages */}
          <div ref={scrollRef} className="max-h-[60vh] min-h-[40vh] space-y-5 overflow-y-auto bg-card p-6">
            {messages.length === 0 && !send.isPending && (
              <div className="space-y-5">
                <PersonaBubble tone="plum">
                  Hey lovely 🌸 I'm Bloom — I've pulled in your niche, recent posts, and goals. Ask me anything: what to post, why something flopped, or for a plan for the week. I'll give you real answers based on YOUR data.
                </PersonaBubble>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setDraft(s); }}
                        className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-foreground/30 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}

            {send.isPending && (
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full surface-plum text-base">🌸</div>
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "120ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border/40 bg-secondary/30 p-4">
            {locked ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-peach p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Bloom Growth Coach is a Pro feature.
                </p>
                <Link to="/settings">
                  <Button size="sm" className="rounded-full">Go Pro</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <Textarea
                  rows={2}
                  placeholder="Ask Bloom anything…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="resize-none rounded-2xl border-border bg-background text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={!draft.trim() || send.isPending}
                  size="lg"
                  className="h-11 shrink-0 rounded-2xl px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
            {messages.length > 0 && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => clear.mutate()}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" /> Clear chat
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Quick links */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <QuickLink to="/schedule" icon={Target} label="Schedule a post" />
          <QuickLink to="/generator" icon={Sparkles} label="Idea Generator" />
          <QuickLink to="/insights" icon={MessageCircle} label="Log a post" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <GrowthSnapshotForm />
          <AudienceFitPanel />
        </div>
      </section>
    </div>
  );
}

function MessageBubble({ role, content }: { role: string; content: string }) {
  if (role === "assistant") {
    return (
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full surface-plum text-base">🌸</div>
        <div className="flex-1 rounded-2xl bg-secondary/50 px-4 py-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className={cn("max-w-[85%] rounded-2xl bg-primary/10 px-4 py-2.5 text-sm leading-relaxed text-foreground whitespace-pre-wrap")}>
        {content}
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: typeof Target; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium transition hover:border-foreground/30 hover:shadow-[var(--shadow-soft)]"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </Link>
  );
}