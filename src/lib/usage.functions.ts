import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getTrialInfo } from "@/lib/generator-helpers.server";

export const getUsageToday = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return getTrialInfo(context.supabase, context.userId);
  });

export const getTrialStatus = getUsageToday;