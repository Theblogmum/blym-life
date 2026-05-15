import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Target, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { scoreAudienceFit } from "@/lib/coach.functions";
import { cn } from "@/lib/utils";

export function AudienceFitPanel({ initialText = "" }: { initialText?: string }) {
  const fn = useServerFn(scoreAudienceFit);
  const [text, setText] = useState(initialText);
  const m = useMutation({
    mutationFn: () => fn({ data: { text } }),
    onError: (e: Error) => toast.error(e.message),
  });
  const score = m.data?.score ?? null;
  const colour = score === null ? "" :
    score >= 75 ? "text-emerald-600" :
    score >= 50 ? "text-amber-600" : "text-rose-600";

  return (
    <Card className="rounded-3xl border-0 surface-sky p-5">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Audience fit · Pro
        </p>
      </div>
      <p className="mt-1 text-sm text-foreground/70">
        Paste a hook or caption — I'll score how well it matches your audience and suggest a tighter version.
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a hook or caption…"
        className="mt-3 min-h-[80px] rounded-xl bg-background"
      />
      <Button
        size="sm"
        className="mt-3 rounded-full"
        disabled={!text.trim() || m.isPending}
        onClick={() => m.mutate()}
      >
        <Sparkles className={cn("mr-2 h-3.5 w-3.5", m.isPending && "animate-spin")} />
        {m.isPending ? "Scoring…" : "Score it"}
      </Button>
      {m.data && (
        <div className="mt-4 space-y-2 rounded-2xl bg-background p-4 text-sm">
          <p className={cn("font-display text-3xl font-black", colour)}>{m.data.score}<span className="text-base text-muted-foreground">/100</span></p>
          {m.data.weakest && <p><span className="font-semibold">Weakest line:</span> {m.data.weakest}</p>}
          {m.data.rewrite && (
            <div className="rounded-xl bg-secondary/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Try this</p>
              <p className="mt-1">{m.data.rewrite}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}