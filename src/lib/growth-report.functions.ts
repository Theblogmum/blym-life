import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SnapshotInput = z.object({
  platform: z.enum(["instagram", "tiktok", "youtube", "pinterest", "other"]),
  followers: z.number().int().min(0).max(100_000_000),
  notes: z.string().max(500).optional().nullable(),
});

export const saveGrowthSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => SnapshotInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("growth_snapshots").insert({
      user_id: userId,
      platform: data.platform,
      followers: data.followers,
      notes: data.notes || null,
      snapshot_date: today,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listGrowthSnapshots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("growth_snapshots").select("*").eq("user_id", userId)
      .order("snapshot_date", { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    return { snapshots: data ?? [] };
  });