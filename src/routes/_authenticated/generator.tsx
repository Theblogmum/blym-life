import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { generateContent } from "@/lib/generator.functions";
import { cn } from "@/lib/utils";

const KINDS = [
  { v: "hook", l: "Hooks" },
  { v: "caption", l: "Captions" },
  { v: "script", l: "Scripts" },
  { v: "hashtags", l: "Hashtags" },
  { v: "shot list", l: "Shot list" },
] as const;

export const Route = createFileRoute("/_authenticated/generator")({
  component: GeneratorPage,
});

function GeneratorPage() {
  const fn = useServerFn(generateContent);
  const [kind, setKind] = useState<string>("hook");
  const [topic, setTopic] = useState("");

  const m = useMutation({
    mutationFn: () => fn({ data: { kind, topic } }),
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
  const options = Array.isArray(m.data?.options) ? m.data.options : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-secondary p-2 text-primary">
          <Camera className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black">Content Generator</h1>
          <p className="text-sm text-muted-foreground">
            Hooks, captions, scripts — written for your vibe.
          </p>
        </div>
      </div>

      <Card className="mt-6 rounded-3xl p-5">
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.v}
              onClick={() => setKind(k.v)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-colors",
                kind === k.v
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground/70",
              )}
            >
              {k.l}
            </button>
          ))}
        </div>
        <Input
          className="mt-4 rounded-full"
          placeholder="What's it about? e.g. surviving witching hour"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Button
          className="mt-4 rounded-full"
          disabled={!topic.trim() || m.isPending}
          onClick={() => m.mutate()}
        >
          {m.isPending ? "Writing…" : "Generate 5 options"}
        </Button>
      </Card>

      {options.length > 0 && (
        <div className="mt-6 space-y-3">
          {options.map((o, i) => (
            <ResultRow key={i} text={o} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="flex items-start justify-between gap-3 rounded-2xl p-4">
      <p className="flex-1 whitespace-pre-line text-sm">{text}</p>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="rounded-full bg-secondary p-2 text-primary"
        aria-label="Copy"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </Card>
  );
}
