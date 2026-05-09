import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildGoogleAuthUrl,
  buildRawEmail,
  getValidAccessTokenForUser,
  sendGmailMessage,
} from "@/lib/gmail.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getGmailConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("google_tokens")
      .select("email, scope, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    return { connected: !!data, email: data?.email ?? null };
  });

export const startGmailConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const req = getRequest();
    const url = new URL(req.url);
    const origin = `${url.protocol}//${url.host}`;
    const state = `${context.userId}.${crypto.randomUUID()}`;
    const authUrl = buildGoogleAuthUrl({ origin, state });
    return { url: authUrl };
  });

export const disconnectGmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("google_tokens")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendPitchViaGmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pitchId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: pitch, error: pitchErr } = await supabase
      .from("brand_pitches")
      .select("*")
      .eq("id", data.pitchId)
      .eq("user_id", userId)
      .maybeSingle();
    if (pitchErr) throw new Error(pitchErr.message);
    if (!pitch) throw new Error("Pitch not found");
    if (pitch.status === "sent" || pitch.status === "replied") {
      throw new Error("This pitch was already sent.");
    }

    const { accessToken, email: fromEmail } = await getValidAccessTokenForUser(userId);
    if (!fromEmail) {
      throw new Error("Could not determine your Gmail address — please reconnect Gmail.");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    const raw = buildRawEmail({
      fromEmail,
      fromName: profile?.display_name ?? undefined,
      to: pitch.recipient_email,
      subject: pitch.subject,
      body: pitch.body,
    });

    const { id: messageId, threadId } = await sendGmailMessage({ accessToken, raw });

    const sentAt = new Date().toISOString();
    const followUpDueAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
    const { error: updErr } = await supabaseAdmin
      .from("brand_pitches")
      .update({
        status: "sent",
        sent_at: sentAt,
        follow_up_due_at: followUpDueAt,
        gmail_message_id: messageId,
        gmail_thread_id: threadId,
      })
      .eq("id", data.pitchId)
      .eq("user_id", userId);
    if (updErr) throw new Error(updErr.message);

    return { ok: true, messageId, threadId };
  });