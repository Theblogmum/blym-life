import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

function getClientIp(): string {
  const req = getRequest();
  const h = req?.headers;
  if (!h) return "unknown";
  const candidates = [
    h.get("cf-connecting-ip"),
    h.get("x-real-ip"),
    (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim(),
  ].filter(Boolean) as string[];
  return candidates[0] ?? "unknown";
}

function hashIp(ip: string): string {
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export const getTrialState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId as string;
    const admin = getAdmin();
    const { data } = await admin
      .from("trial_claims")
      .select("started_at, ends_at")
      .eq("user_id", userId)
      .maybeSingle();
    const now = Date.now();
    const endsAt = data?.ends_at ? new Date(data.ends_at).getTime() : null;
    const active = !!endsAt && endsAt > now;
    return {
      claimed: !!data,
      active,
      startedAt: data?.started_at ?? null,
      endsAt: data?.ends_at ?? null,
      msLeft: active && endsAt ? endsAt - now : 0,
    };
  });

export const startTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId as string;
    const ip = getClientIp();
    const ipHash = hashIp(ip);
    const admin = getAdmin();

    const { data: existingForUser } = await admin
      .from("trial_claims")
      .select("id, ends_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (existingForUser) {
      throw new Error("You've already used your free 48-hour trial.");
    }

    const { data: existingForIp } = await admin
      .from("trial_claims")
      .select("id")
      .eq("ip_hash", ipHash)
      .maybeSingle();
    if (existingForIp) {
      throw new Error(
        "A free trial has already been used from this device/network. Only one trial per person is allowed.",
      );
    }

    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + 48 * 60 * 60 * 1000);
    const { error } = await admin.from("trial_claims").insert({
      user_id: userId,
      ip_hash: ipHash,
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
    });
    if (error) {
      if ((error as any).code === "23505") {
        throw new Error(
          "A free trial has already been used from this device/network.",
        );
      }
      console.error("[db error]", error); throw new Error("Something went wrong. Please try again.");
    }
    return { ok: true, startedAt: startedAt.toISOString(), endsAt: endsAt.toISOString() };
  });