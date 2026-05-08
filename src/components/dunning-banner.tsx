import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { createPortalSession } from "@/utils/payments.functions";
import { getPaddleEnvironment } from "@/lib/paddle";
import { toast } from "sonner";

export function DunningBanner() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const openPortal = useServerFn(createPortalSession);
  const [loading, setLoading] = useState(false);

  if (!user || !subscription || subscription.status !== "past_due") return null;

  const handle = async () => {
    setLoading(true);
    try {
      const { url } = await openPortal({ data: { userId: user.id, environment: getPaddleEnvironment() } });
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
        We couldn't take your last payment. Update your card to keep your Premium access.
      </p>
      <button
        onClick={handle}
        disabled={loading}
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-900 px-3 py-1 text-xs font-medium text-amber-50 hover:bg-amber-800 disabled:opacity-60"
      >
        {loading ? "Opening…" : "Update payment"} <ExternalLink className="h-3 w-3" />
      </button>
    </div>
  );
}
