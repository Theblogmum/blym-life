import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Folder } from "lucide-react";
import { toast } from "sonner";
import { recycleClip } from "@/lib/generator.functions";

export const Route = createFileRoute("/_authenticated/recycler")({
  component: RecyclerPage,
});

function RecyclerPage() {
  const fn = useServerFn(recycleClip);
  const [desc, setDesc] = useState("");
  const m = useMutation({
    mutationFn: () => fn({ data: { description: desc } }),
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
  const ideas = Array.isArray(m.data?.ideas) ? m.data.ideas : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-secondary p-2 text-primary"><Folder className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl font-black">Clip Recycler</h1>
          <p className="text-sm text-muted-foreground">Describe a clip you've already filmed — get 5 fresh ways to use it.</p>
        </div>
      </div>

      <Card className="mt-6 rounded-3xl p-5">
        <Textarea
          rows={4}
          placeholder="e.g. 10 sec of toddler dropping cereal everywhere, me sighing"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="rounded-2xl"
        />
        <Button className="mt-4 rounded-full" disabled={!desc.trim() || m.isPending} onClick={() => m.mutate()}>
          {m.isPending ? "Thinking…" : "Get 5 ideas"}
        </Button>
      </Card>

      {ideas.length > 0 && (
        <div className="mt-6 space-y-3">
          {ideas.map((i, idx) => (
            <Card key={idx} className="rounded-2xl p-4">
              <p className="font-semibold">{idx + 1}. {i.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">Hook: "{i.hook}"</p>
              <p className="mt-1 text-sm">{i.angle}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}