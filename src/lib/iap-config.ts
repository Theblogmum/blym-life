// RevenueCat configuration for iOS In-App Purchases.
// Replace the placeholder below with your RevenueCat *public* iOS SDK key.
// You can find it in RevenueCat dashboard → Project Settings → API keys → "Public SDK key" for the iOS app.
// This key is safe to ship in the client bundle (it's designed to be public).
export const REVENUECAT_IOS_API_KEY =
  import.meta.env.VITE_REVENUECAT_IOS_API_KEY ?? "test_zHRZCLrxOdSEKFUTYgWjSiZfaie";

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