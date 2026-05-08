import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { generatePitch } from "@/lib/generator.functions";

export const Route = createFileRoute("/_authenticated/ugc-hub")({
  component: UgcHub,
});

function UgcHub() {
  const fn = useServerFn(generatePitch);
  const [brand, setBrand] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [followers, setFollowers] = useState<number | "">("");

  const m = useMutation({
    mutationFn: () => fn({ data: { brand, deliverables, followers: followers === "" ? undefined : Number(followers) } }),
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-secondary p-2 text-primary"><Wallet className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl font-black">UGC Creator Hub</h1>
          <p className="text-sm text-muted-foreground">Pitch brands. Get paid your worth.</p>
        </div>
      </div>

      <Card className="mt-6 rounded-3xl p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Brand name</Label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Aldi UK" /></div>
          <div className="sm:col-span-2"><Label>Deliverables</Label>
            <Textarea rows={2} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="e.g. 1 reel + 3 stories" /></div>
          <div><Label>Your followers</Label>
            <Input type="number" value={followers} onChange={(e) => setFollowers(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 5000" /></div>
        </div>
        <Button className="mt-4 rounded-full" disabled={!brand.trim() || !deliverables.trim() || m.isPending} onClick={() => m.mutate()}>
          {m.isPending ? "Writing pitch…" : "Generate pitch + price"}
        </Button>
      </Card>

      {m.data && <PitchResult data={m.data} />}
    </div>
  );
}

function PitchResult({ data }: { data: { subject: string; body: string; suggested_price_gbp: number } }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="mt-6 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested price</p>
        <p className="font-display text-3xl font-black text-primary">£{data.suggested_price_gbp}</p>
      </div>
      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subject</p>
        <p className="mt-1 font-medium">{data.subject}</p>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email body</p>
          <button onClick={() => { navigator.clipboard.writeText(`${data.subject}\n\n${data.body}`); setCopied(true); setTimeout(() => setCopied(false), 1200); }} className="flex items-center gap-1 text-xs text-primary">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-2 whitespace-pre-line rounded-2xl bg-secondary/60 p-3 text-sm">{data.body}</p>
      </div>
    </Card>
  );
}