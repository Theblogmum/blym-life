import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { createPortalSession } from "@/utils/payments.functions";
import { toast } from "sonner";
import { isNativeIOS } from "@/lib/platform";
import { Button } from "@/components/ui/button";

export function DunningBanner() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const openPortal = useServerFn(createPortalSession);
  const [loading, setLoading] = useState(false);

  if (!user || !subscription || subscription.status !== "past_due") return null;

  const onIOS = isNativeIOS();

  const handle = async () => {
    if (onIOS) {
      toast.info("Manage your Apple subscription from iOS Settings > Apple ID > Subscriptions.");
      return;
    }
    setLoading(true);
    try {
      const { url } = await openPortal({ data: {} });
      window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't open billing portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p className="flex-1">
        {onIOS
          ? "There's a billing issue with your Apple subscription. Update your payment method in the App Store to keep your Premium access."
          : "We couldn't take your last payment. Update your card to keep your Premium access."}
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handle}
        disabled={loading}
        className="h-7 shrink-0 rounded-full px-3 text-xs"
      >
        {loading ? "Opening…" : onIOS ? "Update in App Store" : "Update payment"} <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );
}
