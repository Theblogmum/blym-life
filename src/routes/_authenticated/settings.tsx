import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, LogOut, Sparkles, ExternalLink, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getMe } from "@/lib/profile.functions";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/use-subscription";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";
import { useIAP } from "@/hooks/use-iap";
import { createPortalSession } from "@/utils/payments.functions";
import { deleteMyAccount } from "@/lib/account.functions";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fetchMe = useServerFn(getMe);
  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const tier = me.data?.profile?.tier ?? "free";
  const { subscription, isActive } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = useStripeCheckout();
  const iap = useIAP();
  const openPortal = useServerFn(createPortalSession);
  const [portalLoading, setPortalLoading] = useState(false);
  const deleteAccountFn = useServerFn(deleteMyAccount);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccountFn();
      toast.success("Your account has been deleted.");
      await signOut();
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't delete account");
      setDeleting(false);
    }
  };

  const buy = (priceId: string) => {
    if (!user) return;
    if (iap.isIOS) {
      iap.purchase(priceId);
      return;
    }
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
    <div>
      <PageHero
        icon={SettingsIcon}
        eyebrow="Settings"
        title="Your account, your way."
        description="Manage your plan, profile and integrations. Tiny changes, big difference."
        variant="butter"
      />
      <section className="mx-auto max-w-2xl px-5 py-8 space-y-5">
      <Card className="rounded-[1.6rem] border-0 p-6 shadow-[var(--shadow-soft)]">
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

      {isActive && subscription && (
        <Card className="rounded-[1.6rem] border-0 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subscription</p>
          <p className="mt-1 font-medium capitalize">{subscription.status}{subscription.cancel_at_period_end ? " · cancels at period end" : ""}</p>
          {subscription.current_period_end && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subscription.cancel_at_period_end ? "Access until" : "Renews"}: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
          {iap.isIOS ? (
            <a
              href="https://apps.apple.com/account/subscriptions"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              <ExternalLink className="h-4 w-4" /> Manage in App Store
            </a>
          ) : (
            <Button variant="outline" className="mt-4 rounded-full" onClick={handlePortal} disabled={portalLoading}>
              <ExternalLink className="mr-2 h-4 w-4" /> {portalLoading ? "Opening…" : "Manage billing"}
            </Button>
          )}
        </Card>
      )}

      {!isActive && (
        <Card className="rounded-[1.6rem] border-0 bg-[image:var(--gradient-warm)] p-[2px] shadow-[var(--shadow-elegant)]">
          <div className="rounded-[1.5rem] bg-card p-6">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Upgrade your plan</p>
            </div>
            <p className="mt-2 font-display text-[22px] font-bold tracking-[-0.015em]">Pick the plan that fits where you are.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="font-display text-lg font-bold">Creator · £6.99/mo</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Unlimited ideas, captions, scripts + smart calendar.</p>
                <Button className="mt-3 w-full whitespace-normal break-words text-center px-3 rounded-full" disabled={checkoutLoading} onClick={() => buy("creator_monthly")}>Go Creator</Button>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="font-display text-lg font-bold">Studio · £14.99/mo</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Everything in Creator with extra studio firepower.</p>
                <Button className="mt-3 w-full whitespace-normal break-words text-center px-3 rounded-full" disabled={checkoutLoading} onClick={() => buy("studio_monthly")}>Go Studio</Button>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="font-display text-lg font-bold">Pro · £24.99/mo</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Viral growth engine, batching, insights + repurposing.</p>
                <Button className="mt-3 w-full whitespace-normal break-words text-center px-3 rounded-full" disabled={checkoutLoading} onClick={() => buy("pro_monthly")}>Go Pro</Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {iap.isIOS && (
                <Button variant="ghost" className="whitespace-normal break-words text-center px-4 rounded-full" disabled={iap.loading} onClick={() => iap.restore()}>
                  Restore purchases
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card className="rounded-[1.6rem] border border-destructive/30 p-6 shadow-[var(--shadow-soft)]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-destructive">Danger zone</p>
        <p className="mt-1 font-medium">Delete your account</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently remove your account and all associated data. This can't be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="mt-4 rounded-full border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your account, profile, XP, rewards, and all your saved content. This action cannot be undone. If you have an active paid subscription, please cancel it from "Manage billing" first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Keep my account</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting…" : "Yes, delete forever"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
      </section>
    </div>
  );
}