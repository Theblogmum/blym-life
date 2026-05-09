// Server-only Gmail helpers. Never import in client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ");

export function getGoogleClientCreds() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Gmail not configured yet — admin needs to add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.",
    );
  }
  return { clientId, clientSecret };
}

export function getRedirectUri(origin: string) {
  // Always pin callback path; origin comes from request to support custom domains
  return `${origin}/api/public/google/callback`;
}

export function buildGoogleAuthUrl(opts: {
  origin: string;
  state: string;
}) {
  const { clientId } = getGoogleClientCreds();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(opts.origin),
    response_type: "code",
    scope: GMAIL_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: opts.state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type TokenExchangeResult = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
};

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenExchangeResult> {
  const { clientId, clientSecret } = getGoogleClientCreds();
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed [${res.status}]: ${text}`);
  }
  return (await res.json()) as TokenExchangeResult;
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const { clientId, clientSecret } = getGoogleClientCreds();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed [${res.status}]: ${text}`);
  }
  return (await res.json()) as { access_token: string; expires_in: number };
}

export async function fetchGoogleUserEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { email?: string };
    return data.email ?? null;
  } catch {
    return null;
  }
}

export async function getValidAccessTokenForUser(userId: string): Promise<{ accessToken: string; email: string | null }> {
  const { data: row, error } = await supabaseAdmin
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Gmail not connected. Click Connect Gmail in Brand Hub.");

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  const skewMs = 60 * 1000;
  if (row.access_token && expiresAt - skewMs > Date.now()) {
    return { accessToken: row.access_token, email: row.email };
  }

  const refreshed = await refreshAccessToken(row.refresh_token);
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await supabaseAdmin
    .from("google_tokens")
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  return { accessToken: refreshed.access_token, email: row.email };
}

function base64UrlEncode(input: string): string {
  // Use Buffer (Node compat) -> base64 -> url-safe
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function escapeHeader(value: string): string {
  // Strip CR/LF to prevent header injection
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function buildRawEmail(opts: {
  fromEmail: string;
  fromName?: string;
  to: string;
  subject: string;
  body: string;
}): string {
  const fromHeader = opts.fromName
    ? `${escapeHeader(opts.fromName)} <${escapeHeader(opts.fromEmail)}>`
    : escapeHeader(opts.fromEmail);
  const lines = [
    `From: ${fromHeader}`,
    `To: ${escapeHeader(opts.to)}`,
    `Subject: ${escapeHeader(opts.subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    opts.body,
  ];
  return base64UrlEncode(lines.join("\r\n"));
}

export async function sendGmailMessage(opts: {
  accessToken: string;
  raw: string;
}): Promise<{ id: string; threadId: string }> {
  const res = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: opts.raw }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail send failed [${res.status}]: ${text}`);
  }
  const data = (await res.json()) as { id: string; threadId: string };
  return { id: data.id, threadId: data.threadId };
}