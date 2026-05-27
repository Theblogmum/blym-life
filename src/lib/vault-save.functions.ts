import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforceFreeVaultCapacity } from "@/lib/generator-helpers.server";
import { z } from "zod";

const SaveSchema = z.object({
  kind: z.string().min(1).max(64),
  title: z.string().max(200).optional().nullable(),
  body: z.string().min(1).max(8000),
  meta: z.record(z.string(), z.any()).optional().nullable(),
});

export const saveToVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SaveSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    if ((data.kind || "").toLowerCase() === "daily_idea") {
      throw new Error("Use the daily idea flow to save daily ideas.");
    }
    await enforceFreeVaultCapacity(supabase, userId);
    const { error } = await supabase.from("saved_content").insert({
      user_id: userId,
      kind: data.kind,
      title: data.title ?? null,
      body: data.body,
      meta: (data.meta ?? null) as any,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });