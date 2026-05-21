import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

const BARE_DOMAIN = "blym.life";
const CANONICAL_DOMAIN = "https://www.blym.life";

function getAuthOrigin() {
  if (typeof window === "undefined") return CANONICAL_DOMAIN;
  return window.location.hostname === BARE_DOMAIN ? CANONICAL_DOMAIN : window.location.origin;
}

function safeRedirectPath(path?: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/app";
  return path;
}

export async function signInWithGoogle(
  redirectPath = "/app",
  extraParams?: Record<string, string>,
) {
  const authOrigin = getAuthOrigin();
  const redirectTo = safeRedirectPath(redirectPath);
  const auth = createLovableAuth({ oauthBrokerUrl: `${authOrigin}/~oauth/initiate` });
  const result = await auth.signInWithOAuth("google", {
    redirect_uri: `${authOrigin}${redirectTo}`,
    extraParams,
  });

  if (!result.redirected && !result.error) {
    await supabase.auth.setSession(result.tokens);
  }

  return result;
}
