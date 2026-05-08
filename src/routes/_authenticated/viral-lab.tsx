import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { analyseTrend } from "@/lib/generator.functions";

export const Route = createFileRoute("/_authenticated/viral-lab")({
  component: ViralLab,
});

function ViralLab() {
  const fn = useServerFn(analyseTrend);
  const [input, setInput] = useState("");
  const m = useMutation({
    mutationFn: (text: string) => fn({ data: { input: text } }),
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-secondary p-2 text-primary"><Flame className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl font-black">Viral Content Lab</h1>
          <p className="text-sm text-muted-foreground">Paste a trending video link, caption, or describe it. We'll show you what makes it work — and how to remix it for YOU.</p>
        </div>
      </div>

      <Card className="mt-6 rounded-3xl p-5">
        <Textarea
          placeholder="e.g. 'Mum doing 5am morning routine with toddler interrupting' or paste a TikTok caption…"
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="rounded-2xl"
        />
        <Button
          className="mt-4 rounded-full"
          disabled={!input.trim() || m.isPending}
          onClick={() => m.mutate(input)}
        >
          <Sparkles className="mr-2 h-4 w-4" /> {m.isPending ? "Analysing…" : "Break it down"}
        </Button>
      </Card>

      {m.data && (
        <div className="mt-6 space-y-4">
          <Section title="Hook breakdown">{m.data.hook_breakdown}</Section>
          <Section title="Structure">{m.data.structure}</Section>
          <Section title="Why it works">{m.data.why_it_works}</Section>
          <Card className="rounded-3xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Remix for you</p>
            <ul className="mt-2 space-y-2 text-sm">
              {m.data.remix_for_you.map((r, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{r}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-3xl p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{children}</p>
    </Card>
  );
}