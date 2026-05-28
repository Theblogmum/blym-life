import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
// IMPORTANT: We import @revenuecat/purchases-capacitor LAZILY (inside functions)
// rather than at module scope. The package ships extensionless ESM imports
// that Node's strict ESM resolver in our SSR/Worker runtime can't resolve,
// which crashed SSR on first render. Dynamic imports keep it out of the
// server bundle entirely — it only loads in the browser, and only really
// runs inside the iOS Capacitor shell.
type PurchasesOfferings = import("@revenuecat/purchases-capacitor").PurchasesOfferings;
type PurchasesPackage = import("@revenuecat/purchases-capacitor").PurchasesPackage;
type PurchasesStoreProduct = import("@revenuecat/purchases-capacitor").PurchasesStoreProduct;
type CustomerInfo = import("@revenuecat/purchases-capacitor").CustomerInfo;
import { isNativeIOS } from "@/lib/platform";
import { useAuth } from "@/hooks/use-auth";
import {
  REVENUECAT_IOS_API_KEY,
  REVENUECAT_PRO_ENTITLEMENT,
  IAP_PRODUCT_IDS,
} from "@/lib/iap-config";

let configured = false;
let configuredUserId: string | null = null;

async function loadPurchases() {
  const mod = await import("@revenuecat/purchases-capacitor");
  return { Purchases: mod.Purchases, LOG_LEVEL: mod.LOG_LEVEL };
}

async function ensureConfigured(appUserId: string | null) {
  if (!isNativeIOS()) return;
  const { Purchases, LOG_LEVEL } = await loadPurchases();
  if (!configured) {
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
    await Purchases.configure({
      apiKey: REVENUECAT_IOS_API_KEY,
      appUserID: appUserId ?? undefined,
    });
    configured = true;
    configuredUserId = appUserId;
  } else if (appUserId && appUserId !== configuredUserId) {
    await Purchases.logIn({ appUserID: appUserId });
    configuredUserId = appUserId;
  }
}

function packageForProductId(
  offerings: PurchasesOfferings | null,
  productId: string
): PurchasesPackage | null {
  return (
    offerings?.current?.availablePackages.find(
      (p) => p.product.identifier === productId
    ) ?? null
  );
}

export function useIAP() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [hasEntitlement, setHasEntitlement] = useState(false);

  const platformIsIOS = isNativeIOS();

  const refreshCustomerInfo = useCallback(async () => {
    if (!platformIsIOS) return;
    try {
      const { Purchases } = await loadPurchases();
      const { customerInfo } = await Purchases.getCustomerInfo();
      setHasEntitlement(
        !!customerInfo.entitlements.active[REVENUECAT_PRO_ENTITLEMENT]
      );
    } catch (e) {
      console.warn("[iap] getCustomerInfo failed", e);
    }
  }, [platformIsIOS]);

  useEffect(() => {
    if (!platformIsIOS) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await ensureConfigured(user?.id ?? null);
        const { Purchases } = await loadPurchases();
        const offs = await Purchases.getOfferings();
        if (cancelled) return;
        setOfferings(offs);
        await refreshCustomerInfo();
      } catch (e) {
        console.warn("[iap] init failed", e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, platformIsIOS, refreshCustomerInfo]);

  const findPackage = useCallback(
    (internalPriceId: string): PurchasesPackage | null => {
      const productId = IAP_PRODUCT_IDS[internalPriceId];
      if (!productId) return null;
      return packageForProductId(offerings, productId);
    },
    [offerings]
  );

  const purchase = useCallback(
    async (internalPriceId: string): Promise<CustomerInfo | null> => {
      if (!platformIsIOS) return null;
      const productId = IAP_PRODUCT_IDS[internalPriceId] ?? internalPriceId;
      let currentOfferings = offerings;
      // Make sure offerings are loaded (race condition: button tapped before init finished)
      try {
        await ensureConfigured(user?.id ?? null);
        if (!currentOfferings?.current) {
          const { Purchases } = await loadPurchases();
          const offs = await Purchases.getOfferings();
          currentOfferings = offs;
          setOfferings(offs);
        }
      } catch (e) {
        console.warn("[iap] late-load offerings failed", e);
      }

      const pkg = packageForProductId(currentOfferings, productId);
      let directProduct: PurchasesStoreProduct | null = null;

      if (!pkg) {
        try {
          const { Purchases } = await loadPurchases();
          const { products } = await Purchases.getProducts({
            productIdentifiers: [productId],
          });
          directProduct = products.find((p) => p.identifier === productId) ?? products[0] ?? null;
        } catch (e) {
          console.warn("[iap] direct product lookup failed", e);
        }
      }

      if (!pkg && !directProduct) {
        console.warn(
          "[iap] no package or direct store product for",
          internalPriceId,
          "expected product id:",
          productId,
          "current offering packages:",
          currentOfferings?.current?.availablePackages?.map((p) => p.product.identifier)
        );
        toast.error(
          `This plan isn't available in the App Store yet (${productId}).`
        );
        return null;
      }
      setLoading(true);
      try {
        const { Purchases } = await loadPurchases();
        const result = pkg
          ? await Purchases.purchasePackage({ aPackage: pkg })
          : await Purchases.purchaseStoreProduct({ product: directProduct! });
        const info = result.customerInfo;
        setHasEntitlement(!!info.entitlements.active[REVENUECAT_PRO_ENTITLEMENT]);
        toast.success("Purchase complete 💛");
        return info;
      } catch (e: any) {
        if (e?.userCancelled || e?.code === "1") {
          // user cancelled — silent
        } else {
          toast.error(e?.message ?? "Purchase failed");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [platformIsIOS, user?.id, offerings]
  );

  const restore = useCallback(async () => {
    if (!platformIsIOS) return;
    setLoading(true);
    try {
      const { Purchases } = await loadPurchases();
      const { customerInfo } = await Purchases.restorePurchases();
      const active = !!customerInfo.entitlements.active[REVENUECAT_PRO_ENTITLEMENT];
      setHasEntitlement(active);
      toast.success(active ? "Purchases restored 💛" : "No previous purchases found");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't restore purchases");
    } finally {
      setLoading(false);
    }
  }, [platformIsIOS]);

  return {
    isIOS: platformIsIOS,
    ready,
    loading,
    offerings,
    hasEntitlement,
    purchase,
    restore,
    refreshCustomerInfo,
    getPriceString: (internalPriceId: string) => {
      const pkg = findPackage(internalPriceId);
      return pkg?.product.priceString ?? null;
    },
  };
}