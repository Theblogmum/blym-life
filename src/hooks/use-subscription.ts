import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "@/hooks/use-auth";

export type SubscriptionRow = {
  id: string;
  status: string;
  product_id: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [hasLifetime, setHasLifetime] = useState(false);
  const [loading, setLoading] = useState(true);

  const env = getPaddleEnvironment();

  const refetch = async () => {
    if (!user) {
      setSubscription(null);
      setHasLifetime(false);
      setLoading(false);
      return;
    }
    const [{ data: sub }, { data: lifetime }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("id,status,product_id,price_id,current_period_end,cancel_at_period_end")
        .eq("user_id", user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("lifetime_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("environment", env)
        .limit(1)
        .maybeSingle(),
    ]);
    setSubscription((sub as SubscriptionRow | null) ?? null);
    setHasLifetime(!!lifetime);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
    if (!user) return;
    const channel = supabase
      .channel(`subs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => refetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lifetime_purchases", filter: `user_id=eq.${user.id}` },
        () => refetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const now = Date.now();
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end).getTime() : null;
  const isActive =
    hasLifetime ||
    (!!subscription &&
      ((["active", "trialing", "past_due"].includes(subscription.status) &&
        (!periodEnd || periodEnd > now)) ||
        (subscription.status === "canceled" && !!periodEnd && periodEnd > now)));

  return { subscription, hasLifetime, isActive, loading, refetch };
}