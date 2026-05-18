import { supabase } from '@/integrations/supabase/client'

interface SendTransactionalEmailParams {
  templateName: string
  recipientEmail: string
  idempotencyKey?: string
  templateData?: Record<string, any>
}

/**
 * Fire-and-forget transactional email send. Never throws into the UI —
 * failures are logged and swallowed so signup/auth flows are not blocked.
 */
export async function sendTransactionalEmail(params: SendTransactionalEmailParams) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/lovable/email/transactional/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        templateName: params.templateName,
        recipientEmail: params.recipientEmail,
        idempotencyKey: params.idempotencyKey,
        templateData: params.templateData,
      }),
    })
    if (!res.ok) {
      console.warn('[email] send failed', params.templateName, res.status)
      return { ok: false }
    }
    return { ok: true }
  } catch (err) {
    console.warn('[email] send error', params.templateName, err)
    return { ok: false }
  }
}