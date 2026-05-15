import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, LogOut, Sparkles, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getMe } from "@/lib/profile.functions";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/use-subscription";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";
import { createPortalSession } from "@/utils/payments.functions";
import { useState } from "react";
import { PinterestConnectCard } from "@/components/pinterest-connect-card";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fetchMe = useServerFn(getMe);
  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const tier = me.data?.profile?.tier ?? "free";
  const { subscription, hasLifetime, isActive } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = useStripeCheckout();
  const openPortal = useServerFn(createPortalSession);
  const [portalLoading, setPortalLoading] = useState(false);

  const buy = (priceId: string) => {
    if (!user) return;
    openCheckout({
      priceId,
      successUrl: `${window.location.origin}/settings?checkout=success`,
      cancelUrl: `${window.location.origin}/settings`,
    });
  };

  const handlePortal = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const { url } = await openPortal({ data: { returnUrl: `${window.location.origin}/settings` } });
      window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-secondary p-2 text-primary"><SettingsIcon className="h-5 w-5" /></div>
        <h1 className="font-display text-3xl font-black">Settings</h1>
      </div>

      <Card className="mt-6 rounded-3xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
        <p className="mt-1 font-medium">{user?.email}</p>
        <p className="mt-1 text-sm text-muted-foreground">Plan: <span className="font-semibold capitalize text-foreground">{tier}</span></p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ to: "/onboarding" })}>Update creator profile</Button>
          <Button variant="ghost" className="rounded-full" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </Card>

      {isActive && subscription && !hasLifetime && (
        <Card className="mt-5 rounded-3xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subscription</p>
          <p className="mt-1 font-medium capitalize">{subscription.status}{subscription.cancel_at_period_end ? " · cancels at period end" : ""}</p>
          {subscription.current_period_end && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription.cancel_at_period_end ? "Access until" : "Renews"}: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
          <Button variant="outline" className="mt-4 rounded-full" onClick={handlePortal} disabled={portalLoading}>
            <ExternalLink className="mr-2 h-4 w-4" /> {portalLoading ? "Opening…" : "Manage billing"}
          </Button>
        </Card>
      )}

      {hasLifetime && (
        <Card className="mt-5 rounded-3xl p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Lifetime member</p>
          <p className="mt-1 font-medium">You have permanent Premium access. Thank you 💛</p>
        </Card>
      )}

      <div className="mt-5">
        <PinterestConnectCard />
      </div>

      {!isActive && (
        <Card className="mt-5 rounded-3xl border-0 bg-[image:var(--gradient-warm)] p-[2px]">
          <div className="rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card p-5">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Upgrade your plan</p>
            </div>
            <p className="mt-2 font-display text-2xl font-black">Pick the plan that fits where you are.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="font-display text-lg font-bold">Creator · £9.99/mo</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Unlimited ideas, captions, scripts + smart calendar.</p>
                <Button className="mt-3 w-full whitespace-normal break-words text-center px-3 rounded-full" disabled={checkoutLoading} onClick={() => buy("creator_monthly")}>Go Creator</Button>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="font-display text-lg font-bold">Pro · £24.99/mo</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Viral growth engine, batching, insights + repurposing.</p>
                <Button className="mt-3 w-full whitespace-normal break-words text-center px-3 rounded-full" disabled={checkoutLoading} onClick={() => buy("pro_monthly")}>Go Pro</Button>
              </div>
              <div className="rounded-2xl border border-primary/40 bg-secondary/40 p-4">
                <p className="font-display text-lg font-bold">Ultimate · £44.99/mo</p>
                <p className="mt-0.5 text-xs text-muted-foreground">AI growth coach, 30-day plans, brand pitch, media kit, invoices.</p>
                <Button className="mt-3 w-full whitespace-normal break-words text-center px-3 rounded-full" disabled={checkoutLoading} onClick={() => buy("ultimate_monthly")}>Go Ultimate</Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="ghost" className="whitespace-normal break-words text-center px-4 rounded-full" disabled={checkoutLoading} onClick={() => buy("lifetime_oneoff")}>£299 lifetime</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}