import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createCheckoutSession } from "@/utils/payments.functions";
import { toast } from "sonner";
import { isNativeIOS } from "@/lib/platform";

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const create = useServerFn(createCheckoutSession);

  const openCheckout = async (options: {
    priceId: string;
    successUrl?: string;
    cancelUrl?: string;
  }) => {
    // App Store policy: never initiate Stripe/web checkout from inside the
    // native iOS app. All iOS purchases must go through Apple IAP (RevenueCat).
    if (isNativeIOS()) {
      toast.error("Purchases on iOS go through the App Store.");
      return;
    }
    setLoading(true);
    try {
      const { url } = await create({
        data: {
          priceId: options.priceId,
          successUrl: options.successUrl ?? `${window.location.origin}/app?checkout=success`,
          cancelUrl: options.cancelUrl ?? window.location.href,
        },
      });
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't start checkout");
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}