import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getBusinessHub = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);

    const [profileR, incomeMonthR, incomeYearR, invoicesR, followUpsR, clientsR, taxR, goalsR] = await Promise.all([
      supabase.from("creator_profile").select("tax_rate, follower_goal").eq("user_id", userId).maybeSingle(),
      supabase.from("income_entries").select("amount").eq("user_id", userId).gte("entry_date", monthStart),
      supabase.from("income_entries").select("amount").eq("user_id", userId).gte("entry_date", yearStart),
      supabase.from("invoices").select("id, brand_name, status, items, currency, due_date, issue_date").eq("user_id", userId).order("issue_date", { ascending: false }).limit(50),
      supabase.from("follow_ups").select("id, brand, title, due_date, done").eq("user_id", userId).order("due_date"),
      supabase.from("clients").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
      supabase.from("tax_reminders").select("*").eq("user_id", userId).order("due_date"),
      supabase.from("creator_goals").select("*").eq("user_id", userId),
    ]);

    const sum = (rows: any[] | null) => (rows ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const incomeThisMonth = sum(incomeMonthR.data);
    const incomeThisYear = sum(incomeYearR.data);
    const taxRate = Number(profileR.data?.tax_rate ?? 0);
    const setAside = Math.round((incomeThisYear * taxRate) / 100);

    const itemsTotal = (items: any) => Array.isArray(items)
      ? items.reduce((s, it) => s + Number(it.qty ?? 1) * Number(it.unit_price ?? it.price ?? 0), 0)
      : 0;
    const invoices = invoicesR.data ?? [];
    const outstanding = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + itemsTotal(i.items), 0);
    const paidThisMonth = invoices
      .filter(i => i.status === "paid" && i.issue_date >= monthStart)
      .reduce((s, i) => s + itemsTotal(i.items), 0);

    const followUps = followUpsR.data ?? [];
    const outreachDoneMonth = followUps.filter(f => f.done).length;

    const goals = goalsR.data ?? [];
    const monthlyIncomeGoal = goals.find(g => g.kind === "income_monthly");
    const outreachGoal = goals.find(g => g.kind === "outreach_monthly");

    return {
      taxRate,
      incomeThisMonth,
      incomeThisYear,
      setAside,
      invoices: invoices.slice(0, 8),
      outstanding,
      paidThisMonth,
      followUps,
      outreachDoneMonth,
      clients: clientsR.data ?? [],
      taxReminders: taxR.data ?? [],
      monthlyIncomeGoal,
      outreachGoal,
    };
  });

export const saveTaxRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { rate: number }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("creator_profile").upsert({ user_id: userId, tax_rate: data.rate, updated_at: new Date().toISOString() });
    if (error) { console.error(error); throw new Error("Couldn't save tax rate"); }
    return { ok: true };
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; name: string; contact_name?: string; email?: string; status?: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = { ...data, user_id: userId };
    const q = data.id ? supabase.from("clients").update(row).eq("id", data.id).eq("user_id", userId) : supabase.from("clients").insert(row);
    const { error } = await q;
    if (error) { console.error(error); throw new Error("Couldn't save client"); }
    return { ok: true };
  });

export const deleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("clients").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error("Couldn't delete client");
    return { ok: true };
  });

export const saveTaxReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; title: string; due_date: string; amount?: number; notes?: string; done?: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const row = { ...data, amount: data.amount ?? 0, user_id: userId };
    const q = data.id ? supabase.from("tax_reminders").update(row).eq("id", data.id).eq("user_id", userId) : supabase.from("tax_reminders").insert(row);
    const { error } = await q;
    if (error) { console.error(error); throw new Error("Couldn't save reminder"); }
    return { ok: true };
  });

export const toggleTaxReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; done: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("tax_reminders").update({ done: data.done }).eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error("Couldn't update reminder");
    return { ok: true };
  });

export const deleteTaxReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("tax_reminders").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error("Couldn't delete reminder");
    return { ok: true };
  });

export const saveBusinessGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: "income_monthly" | "outreach_monthly"; target_value: number; unit?: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const existing = await supabase.from("creator_goals").select("id").eq("user_id", userId).eq("kind", data.kind).maybeSingle();
    const title = data.kind === "income_monthly" ? "Monthly income goal" : "Monthly outreach target";
    const unit = data.unit ?? (data.kind === "income_monthly" ? "GBP" : "outreach");
    if (existing.data?.id) {
      const { error } = await supabase.from("creator_goals").update({ target_value: data.target_value, unit, title, updated_at: new Date().toISOString() }).eq("id", existing.data.id);
      if (error) throw new Error("Couldn't save goal");
    } else {
      const { error } = await supabase.from("creator_goals").insert({ user_id: userId, kind: data.kind, target_value: data.target_value, unit, title });
      if (error) throw new Error("Couldn't save goal");
    }
    return { ok: true };
  });
