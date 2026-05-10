import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    // Pull auth users via admin API
    const authUsers: Array<{
      id: string;
      email: string | null;
      created_at: string;
      last_sign_in_at: string | null;
      provider: string | null;
    }> = [];

    let page = 1;
    const perPage = 200;
    // cap to avoid runaway
    while (page < 20) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw new Error(error.message);
      const users = data?.users ?? [];
      for (const u of users) {
        authUsers.push({
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          provider: (u.app_metadata as any)?.provider ?? null,
        });
      }
      if (users.length < perPage) break;
      page++;
    }

    const ids = authUsers.map((u) => u.id);
    const [{ data: profiles }, { data: subs }, { data: lifetimes }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id,display_name,tier,onboarded,trial_started_at").in("id", ids),
      supabaseAdmin.from("subscriptions").select("user_id,status,price_id,current_period_end,cancel_at_period_end").in("user_id", ids),
      supabaseAdmin.from("lifetime_purchases").select("user_id").in("user_id", ids),
      supabaseAdmin.from("user_roles").select("user_id,role").in("user_id", ids),
    ]);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const subMap = new Map<string, any>();
    (subs ?? []).forEach((s: any) => {
      const existing = subMap.get(s.user_id);
      if (!existing) subMap.set(s.user_id, s);
    });
    const lifetimeSet = new Set((lifetimes ?? []).map((l: any) => l.user_id));
    const rolesMap = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    });

    const rows = authUsers
      .map((u) => {
        const p: any = profileMap.get(u.id);
        const s: any = subMap.get(u.id);
        return {
          id: u.id,
          email: u.email,
          provider: u.provider,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          display_name: p?.display_name ?? null,
          tier: p?.tier ?? "free",
          onboarded: !!p?.onboarded,
          trial_started_at: p?.trial_started_at ?? null,
          subscription_status: s?.status ?? null,
          subscription_end: s?.current_period_end ?? null,
          has_lifetime: lifetimeSet.has(u.id),
          roles: rolesMap.get(u.id) ?? [],
        };
      })
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

    return { users: rows, total: rows.length };
  });