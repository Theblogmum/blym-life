// RevenueCat configuration for iOS In-App Purchases.
// This key is the RevenueCat *public* iOS SDK key (safe to ship in the client).
export const REVENUECAT_IOS_API_KEY =
  import.meta.env.VITE_REVENUECAT_IOS_API_KEY ?? "appl_nQaoQVVOVzKUSAtBBWBXIbCaYBr";

// RevenueCat entitlement identifier that grants access to paid features.
// Create this in RevenueCat dashboard → Entitlements → "pro" (or whatever you call it),
// then attach your iOS subscription products to it.
export const REVENUECAT_PRO_ENTITLEMENT = "pro";

// Mapping from internal plan IDs (used on web with Stripe) to the
// App Store Connect product identifiers you configure in RevenueCat.
// These MUST match the Product IDs you create in App Store Connect.
export const IAP_PRODUCT_IDS: Record<string, string> = {
  creator_monthly: "blym_creator_monthly",
  studio_monthly: "blym_studio_monthly",
  pro_monthly: "blym_pro_monthly",
};