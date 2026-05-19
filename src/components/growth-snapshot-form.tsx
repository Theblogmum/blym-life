import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { saveGrowthSnapshot, listGrowthSnapshots } from "@/lib/growth-report.functions";

const PLATFORMS = ["instagram", "tiktok", "youtube"] as const;

export function GrowthSnapshotForm() {
  const save = useServerFn(saveGrowthSnapshot);
  const fetchList = useServerFn(listGrowthSnapshots);
  const qc = useQueryClient();
  const [platform, setPlatform] = useState<typeof PLATFORMS[number]>("instagram");
  const [followers, setFollowers] = useState("");

  const list = useQuery({ queryKey: ["growth-snapshots"], queryFn: () => fetchList() });
  const m = useMutation({
    mutationFn: () => save({ data: { platform, followers: parseInt(followers, 10) || 0, notes: null } }),
    onSuccess: () => {
      toast.success("Saved 🌱");
      setFollowers("");
      qc.invalidateQueries({ queryKey: ["growth-snapshots"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const latest = list.data?.snapshots?.[0];

  return (
    <Card className="rounded-3xl border-0 surface-mint p-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Weekly follower snapshot</p>
      </div>
      <p className="mt-1 text-sm text-foreground/70">
        30 seconds. Drop your follower count so Bloom can spot real growth and email you a Monday report.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {PLATFORMS.map((p) => (
          <button key={p} onClick={() => setPlatform(p)}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
              platform === p ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}>{p}</button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input type="number" placeholder="e.g. 4250" value={followers}
          onChange={(e) => setFollowers(e.target.value)} className="rounded-xl" />
        <Button onClick={() => m.mutate()} disabled={!followers || m.isPending} className="rounded-full">
          {m.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
      {latest && (
        <p className="mt-2 text-xs text-muted-foreground">
          Last entry: <span className="capitalize font-medium text-foreground/80">{latest.platform}</span> · {latest.followers.toLocaleString()} followers · {latest.snapshot_date}
        </p>
      )}
    </Card>
  );
}