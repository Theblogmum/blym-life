import * as React from 'react'
import { render as renderAsync } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'theblogmumstudio'
const SENDER_DOMAIN = 'notify.theblogmumstudio.com'
const FROM_DOMAIN = 'theblogmumstudio.com'
const TEMPLATE_NAME = 'trial-ending'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function ensureUnsubscribeToken(supabase: any, email: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', email)
    .maybeSingle()
  if (existing?.token && !existing.used_at) return existing.token
  if (existing?.used_at) return null
  const token = generateToken()
  await supabase.from('email_unsubscribe_tokens').upsert(
    { email, token },
    { onConflict: 'email', ignoreDuplicates: true },
  )
  const { data: stored } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', email)
    .maybeSingle()
  return stored?.token ?? null
}

async function sendReminder(
  supabase: any,
  recipient: string,
  templateData: { name?: string; hoursLeft: number },
  idempotencyKey: string,
) {
  // Suppression check
  const normalized = recipient.trim().toLowerCase()
  const { data: suppressed } = await supabase
    .from('suppressed_emails')
    .select('email')
    .eq('email', normalized)
    .maybeSingle()
  if (suppressed) return { skipped: 'suppressed' as const }

  const unsubscribeToken = await ensureUnsubscribeToken(supabase, normalized)
  if (!unsubscribeToken) return { skipped: 'no_token' as const }

  const template = TEMPLATES[TEMPLATE_NAME]
  if (!template) return { skipped: 'no_template' as const }

  const element = React.createElement(template.component, templateData)
  const html = await renderAsync(element)
  const text = await renderAsync(element, { plainText: true })
  const subject =
    typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  const messageId = crypto.randomUUID()
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: TEMPLATE_NAME,
    recipient_email: recipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: recipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: TEMPLATE_NAME,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })
  if (enqueueError) {
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: TEMPLATE_NAME,
      recipient_email: recipient,
      status: 'failed',
      error_message: enqueueError.message,
    })
    return { skipped: 'enqueue_failed' as const }
  }
  return { sent: true as const }
}

export const Route = createFileRoute('/api/public/hooks/trial-reminders')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Authenticate via Supabase anon/publishable key in `apikey` header.
        // pg_cron is configured to send this; external callers cannot guess it.
        const expectedKey =
          process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
        const providedKey =
          request.headers.get('apikey') ||
          request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
        if (!expectedKey || providedKey !== expectedKey) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const supabaseUrl = process.env.SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: 'Server config' }, { status: 500 })
        }
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false },
        })

        const now = Date.now()
        // Look at any active trial ending in the next ~25 hours.
        const windowStart = new Date(now).toISOString()
        const windowEnd = new Date(now + 25 * 60 * 60 * 1000).toISOString()

        const { data: trials, error } = await supabase
          .from('trial_claims')
          .select('id, user_id, started_at, ends_at, reminder_24h_sent_at, reminder_1h_sent_at')
          .gte('ends_at', windowStart)
          .lte('ends_at', windowEnd)

        if (error) {
          console.error('[trial-reminders] query error', error)
          return Response.json({ error: 'Internal error' }, { status: 500 })
        }

        const results: Array<Record<string, any>> = []

        for (const trial of trials ?? []) {
          const endsMs = new Date(trial.ends_at).getTime()
          const msLeft = endsMs - now
          const hoursLeft = msLeft / (60 * 60 * 1000)

          // Decide which reminder fits.
          // 24h reminder: 22 ≤ hoursLeft ≤ 25 and not yet sent
          // 1h reminder:  0  <  hoursLeft ≤ 1.5 and not yet sent
          let kind: '24h' | '1h' | null = null
          if (hoursLeft > 22 && hoursLeft <= 25 && !trial.reminder_24h_sent_at) kind = '24h'
          else if (hoursLeft > 0 && hoursLeft <= 1.5 && !trial.reminder_1h_sent_at) kind = '1h'
          if (!kind) continue

          const { data: userResp, error: userErr } =
            await supabase.auth.admin.getUserById(trial.user_id)
          if (userErr || !userResp?.user?.email) {
            results.push({ trial: trial.id, skipped: 'no_email' })
            continue
          }
          const email = userResp.user.email
          const displayName =
            (userResp.user.user_metadata as any)?.display_name ||
            email.split('@')[0]

          const idempotencyKey = `trial-${kind}-${trial.id}`
          const send = await sendReminder(
            supabase,
            email,
            { name: displayName, hoursLeft: kind === '1h' ? 1 : 24 },
            idempotencyKey,
          )

          if ('sent' in send) {
            const col = kind === '24h' ? 'reminder_24h_sent_at' : 'reminder_1h_sent_at'
            await supabase
              .from('trial_claims')
              .update({ [col]: new Date().toISOString() })
              .eq('id', trial.id)
            results.push({ trial: trial.id, kind, sent: true })
          } else {
            results.push({ trial: trial.id, kind, ...send })
          }
        }

        return Response.json({ ok: true, processed: results.length, results })
      },
    },
  },
})