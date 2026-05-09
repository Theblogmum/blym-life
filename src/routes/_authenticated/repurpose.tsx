import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Repeat2,
  Sparkles,
  Lock,
  Copy,
  Check,
  Music2,
  Image as ImageIcon,
  Layers,
  CircleDot,
  Youtube,
  FileText,
  Mail,
  Hash,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";
import { repurposeContent } from "@/lib/generator.functions";
import { getUsageToday } from "@/lib/usage.functions";
import { PageHero, UsageChip } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/repurpose")({
  component: RepurposePage,
});

type LucideIcon = typeof Repeat2;

function RepurposePage() {
  const fn = useServerFn(repurposeContent);
  const fetchUsage = useServerFn(getUsageToday);
  const [input, setInput] = useState("");

  const usage = useQuery({ queryKey: ["usage", "today"], queryFn: () => fetchUsage() });
  const m = useMutation({
    mutationFn: () => fn({ data: { input } }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });
  const premium = !!usage.data?.premium;
  const inTrial = !!usage.data?.inTrial;
  const daysLeft = usage.data?.daysLeft ?? null;
  const locked = !premium && !inTrial;
  const ready = input.trim().length > 10;

  return (
    <div>
      <PageHero
        icon={Repeat2}
        eyebrow="Repurpose 1→10"
        title="One idea. Ten pieces of content."
        description="Paste your idea, script or video transcript. We'll reshape it into TikTok, Reel, Pinterest, Carousel, Story, Short, blog, email, thread and Facebook — all platform-native."
        variant="sunrise"
      >
        <UsageChip premium={premium} inTrial={inTrial} daysLeft={daysLeft} />
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-[var(--shadow-glow)]">
          <div className="border-b border-border/40 surface-mint px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">
              Your source content
            </p>
          </div>
          <div className="grid gap-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="input">Idea, script or transcript</Label>
              <Textarea
                id="input"
                rows={8}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your video script, idea outline, or full transcript here…"
                maxLength={6000}
                className="rounded-xl bg-secondary/40"
              />
              <p className="text-xs text-foreground/60">{input.length} / 6000</p>
            </div>
            <div>
              <Button
                size="lg"
                className="h-12 w-full rounded-2xl text-base font-bold shadow-[var(--shadow-glow)] sm:w-auto"
                disabled={!ready || m.isPending || locked}
                onClick={() => m.mutate()}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {m.isPending ? "Repurposing into 10…" : "Turn into 10 pieces"}
              </Button>
            </div>
            {locked && (
              <div className="flex items-center justify-between gap-3 rounded-2xl surface-plum p-3 text-sm">
                <p className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Trial ended. Repurposer is a Premium tool.
                </p>
                <Link to="/settings"><Button size="sm" className="rounded-full">Upgrade</Button></Link>
              </div>
            )}
          </div>
        </Card>
      </section>

      {m.data && (
        <section className="mx-auto max-w-5xl space-y-4 px-5 pb-12">
          <PlatformCard
            icon={Music2}
            title="TikTok"
            subtitle="Hook-first, native, fast"
            copyText={[
              `Hook: ${m.data.tiktok.hook}`,
              ``,
              m.data.tiktok.script,
              ``,
              m.data.tiktok.caption,
              m.data.tiktok.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" "),
            ].join("\n")}
          >
            <Field label="Hook">{m.data.tiktok.hook}</Field>
            <Field label="Script">{m.data.tiktok.script}</Field>
            <Field label="Caption">{m.data.tiktok.caption}</Field>
            <div>
              <P>Hashtags</P>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {m.data.tiktok.hashtags.map((h, i) => (
                  <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                    #{h.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            </div>
          </PlatformCard>

          <PlatformCard
            icon={CircleDot}
            title="Instagram Reel"
            subtitle="Same hook, IG vibe"
            copyText={[
              `Hook: ${m.data.reel.hook}`,
              ``,
              m.data.reel.script,
              ``,
              `Caption: ${m.data.reel.caption}`,
              `Audio: ${m.data.reel.audio_suggestion}`,
            ].join("\n")}
          >
            <Field label="Hook">{m.data.reel.hook}</Field>
            <Field label="Script">{m.data.reel.script}</Field>
            <Field label="Caption">{m.data.reel.caption}</Field>
            <Field label="Audio suggestion">{m.data.reel.audio_suggestion}</Field>
          </PlatformCard>

          <PlatformCard
            icon={ImageIcon}
            title="Pinterest"
            subtitle="SEO + keyword led"
            copyText={[
              `Pin title: ${m.data.pinterest.pin_title}`,
              ``,
              m.data.pinterest.pin_description,
              ``,
              `Keywords: ${m.data.pinterest.keywords.join(", ")}`,
            ].join("\n")}
          >
            <Field label="Pin title">{m.data.pinterest.pin_title}</Field>
            <Field label="Pin description">{m.data.pinterest.pin_description}</Field>
            <div>
              <P>Keywords</P>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {m.data.pinterest.keywords.map((k, i) => (
                  <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </PlatformCard>

          <PlatformCard
            icon={Layers}
            title="Carousel"
            subtitle="Slide-by-slide story"
            copyText={[
              `Cover: ${m.data.carousel.cover}`,
              ...m.data.carousel.slides.map((s, i) => `Slide ${i + 2}: ${s}`),
              ``,
              `Caption: ${m.data.carousel.caption}`,
            ].join("\n")}
          >
            <Field label="Cover slide">{m.data.carousel.cover}</Field>
            <div>
              <P>Slides</P>
              <ol className="mt-2 space-y-1.5 text-sm">
                {m.data.carousel.slides.map((s, i) => (
                  <li key={i} className="flex gap-2 rounded-xl bg-secondary/40 p-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 2}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Field label="Caption">{m.data.carousel.caption}</Field>
          </PlatformCard>

          <PlatformCard
            icon={CircleDot}
            title="Story sequence"
            subtitle="Casual + interactive"
            copyText={[
              ...m.data.story.frames.map((f, i) => `Frame ${i + 1}: ${f}`),
              ``,
              `Poll/Question: ${m.data.story.poll_or_question}`,
            ].join("\n")}
          >
            <div>
              <P>Frames</P>
              <ol className="mt-2 space-y-1.5 text-sm">
                {m.data.story.frames.map((f, i) => (
                  <li key={i} className="flex gap-2 rounded-xl bg-secondary/40 p-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Field label="Poll / question sticker">{m.data.story.poll_or_question}</Field>
          </PlatformCard>

          <PlatformCard
            icon={Youtube}
            title="YouTube Short"
            subtitle="Title + hook + script"
            copyText={[
              `Title: ${m.data.youtube_short.title}`,
              `Hook: ${m.data.youtube_short.hook}`,
              ``,
              m.data.youtube_short.script,
            ].join("\n")}
          >
            <Field label="Title">{m.data.youtube_short.title}</Field>
            <Field label="Hook">{m.data.youtube_short.hook}</Field>
            <Field label="Script">{m.data.youtube_short.script}</Field>
          </PlatformCard>

          <PlatformCard
            icon={FileText}
            title="Blog snippet"
            subtitle="SEO-friendly written version"
            copyText={[
              m.data.blog_snippet.title,
              ``,
              m.data.blog_snippet.intro,
              ``,
              m.data.blog_snippet.body,
            ].join("\n")}
          >
            <Field label="Title">{m.data.blog_snippet.title}</Field>
            <Field label="Intro">{m.data.blog_snippet.intro}</Field>
            <Field label="Body">{m.data.blog_snippet.body}</Field>
          </PlatformCard>

          <PlatformCard
            icon={Mail}
            title="Newsletter email"
            subtitle="Warm + scannable"
            copyText={[`Subject: ${m.data.email.subject}`, ``, m.data.email.body].join("\n")}
          >
            <Field label="Subject">{m.data.email.subject}</Field>
            <Field label="Body">{m.data.email.body}</Field>
          </PlatformCard>

          <PlatformCard
            icon={Hash}
            title="X / Threads thread"
            subtitle="Tweet-by-tweet flow"
            copyText={m.data.twitter_thread.tweets
              .map((t, i) => `${i + 1}/ ${t}`)
              .join("\n\n")}
          >
            <ol className="space-y-1.5 text-sm">
              {m.data.twitter_thread.tweets.map((t, i) => (
                <li key={i} className="flex gap-2 rounded-xl bg-secondary/40 p-2.5">
                  <span className="shrink-0 font-bold text-primary">{i + 1}/</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </PlatformCard>

          <PlatformCard
            icon={Facebook}
            title="Facebook post"
            subtitle="Longer-form, conversational"
            copyText={m.data.facebook_post.post}
          >
            <Field label="Post">{m.data.facebook_post.post}</Field>
          </PlatformCard>
        </section>
      )}
    </div>
  );
}

function PlatformCard({
  icon: Icon,
  title,
  subtitle,
  copyText,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  copyText: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-lg font-black leading-tight">{title}</h3>
            <p className="text-xs text-foreground/60">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(copyText);
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 1500);
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:bg-primary hover:text-primary-foreground"
          aria-label="Copy"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-3 space-y-3 text-sm">{children}</div>
    </Card>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">{children}</p>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <P>{label}</P>
      <p className="mt-1 whitespace-pre-wrap leading-relaxed">{children}</p>
    </div>
  );
}