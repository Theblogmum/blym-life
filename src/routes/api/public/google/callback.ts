import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
  getRedirectUri,
} from "@/lib/gmail.server";

function htmlPage(opts: { ok: boolean; message: string; email?: string | null }) {
  const color = opts.ok ? "#0f7a3a" : "#b91c1c";
  const heading = opts.ok ? "Gmail connected" : "Connection failed";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${heading}</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;background:#fff5f7;margin:0;padding:0;display:flex;align-items:center;justify-content:center;min-height:100vh;color:#1a1a1a}
.card{background:#fff;border-radius:24px;padding:40px;max-width:420px;text-align:center;box-shadow:0 10px 40px -10px rgba(244,114,182,.25)}
h1{margin:0 0 12px;color:${color};font-size:24px}
p{margin:0 0 8px;color:#555;font-size:15px;line-height:1.5}
a{display:inline-block;margin-top:24px;background:#ec4899;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600}
</style></head>
<body><div class="card">
<h1>${heading}</h1>
<p>${opts.message}</p>
${opts.email ? `<p><strong>${opts.email}</strong></p>` : ""}
<a href="/brand-hub">Back to Brand Hub</a>
</div>
<script>
try{window.opener&&window.opener.postMessage({type:"gmail-oauth",ok:${opts.ok}},"*");}catch(e){}
setTimeout(function(){try{window.close();}catch(e){}},1500);
</script>
</body></html>`;
}

function htmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export const Route = createFileRoute("/api/public/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");

        if (errorParam) {
          return htmlResponse(htmlPage({ ok: false, message: `Google said: ${errorParam}` }), 400);
        }
        if (!code || !state) {
          return htmlResponse(htmlPage({ ok: false, message: "Missing code or state." }), 400);
        }
        const userId = state.split(".")[0];
        if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
          return htmlResponse(htmlPage({ ok: false, message: "Invalid state parameter." }), 400);
        }

        try {
          const origin = `${url.protocol}//${url.host}`;
          const tokens = await exchangeCodeForTokens(code, getRedirectUri(origin));
          if (!tokens.refresh_token) {
            return htmlResponse(
              htmlPage({
                ok: false,
                message:
                  "Google didn't return a refresh token. Disconnect this app at myaccount.google.com/permissions and try again.",
              }),
              400,
            );
          }
          const email = await fetchGoogleUserEmail(tokens.access_token);
          const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

          const { error } = await supabaseAdmin
            .from("google_tokens")
            .upsert(
              {
                user_id: userId,
                refresh_token: tokens.refresh_token,
                access_token: tokens.access_token,
                expires_at: expiresAt,
                scope: tokens.scope,
                email,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" },
            );
          if (error) {
            return htmlResponse(
              htmlPage({ ok: false, message: `Could not save connection: ${error.message}` }),
              500,
            );
          }
          return htmlResponse(
            htmlPage({
              ok: true,
              message: "You can now send pitches directly from Brand Hub.",
              email,
            }),
          );
        } catch (err: any) {
          return htmlResponse(
            htmlPage({ ok: false, message: err?.message || "Unknown error" }),
            500,
          );
        }
      },
    },
  },
});