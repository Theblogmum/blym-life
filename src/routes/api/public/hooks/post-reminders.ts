import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'

const SITE_NAME = 'theblogmumstudio'
const SENDER_DOMAIN = 'notify.theblogmumstudio.com'
const FROM_DOMAIN = 'theblogmumstudio.com'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function ensureUnsubToken(supabase: any, email: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('email_unsubscribe_tokens').select('token, used_at').eq('email', email).maybeSingle()
  if (existing?.token && !existing.used_at) return existing.token
  if (existing?.used_at) return null
  const token = generateToken()
  await supabase.from('email_unsubscribe_tokens').upsert({ email, token }, { onConflict: 'email', ignoreDuplicates: true })
  const { data: stored } = await supabase
    .from('email_unsubscribe_tokens').select('token').eq('email', email).maybeSingle()
  return stored?.token ?? null
}

function buildEmail(post: any) {
  const platform = (post.platform ?? 'post').toString()
  const when = new Date(post.scheduled_for).toLocaleString('en-GB', {
    weekday: 'short', hour: '2-digit', minute: '2-digit',
  })
  const hook = (post.hook ?? '').toString()
  const caption = (post.caption ?? '').toString()
  const media = post.media_url ? `<p><a href="${post.media_url}">Open media</a></p>` : ''
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
      <h2 style="margin:0 0 8px">Time to post on ${platform} 📲</h2>
      <p style="color:#666;margin:0 0 16px">Scheduled for ${when}</p>
      ${hook ? `<p style="font-weight:700;font-size:18px">${hook}</p>` : ''}
      ${caption ? `<pre style="white-space:pre-wrap;font-family:inherit;background:#faf7f2;padding:14px;border-radius:12px">${caption}</pre>` : ''}
      ${media}
      <p style="margin-top:24px;color:#888;font-size:13px">Open the app and tap <strong>Mark as posted</strong> when you've published it.</p>
    </div>`
  const text = `Time to post on ${platform}\nScheduled: ${when}\n\n${hook}\n\n${caption}${post.media_url ? `\n\nMedia: ${post.media_url}` : ''}`
  return {
    subject: `Post reminder: ${hook ? hook.slice(0, 60) : platform} 📲`,
    html, text,
  }
}

export const Route = createFileRoute('/api/public/hooks/post-reminders')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expectedKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
        const providedKey = request.headers.get('apikey') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
        if (!expectedKey || providedKey !== expectedKey) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const supabaseUrl = process.env.SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !serviceKey) return Response.json({ error: 'Server config' }, { status: 500 })
        const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

        const now = new Date()
        const windowStart = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
        const windowEnd = new Date(now.getTime() + 5 * 60 * 1000).toISOString()

        const { data: posts, error } = await supabase
          .from('scheduled_posts')
          .select('*')
          .eq('status', 'scheduled')
          .gte('scheduled_for', windowStart)
          .lte('scheduled_for', windowEnd)
          .limit(100)
        if (error) return Response.json({ error: error.message }, { status: 500 })

        const results: any[] = []
        for (const post of posts ?? []) {
          const { data: userResp } = await supabase.auth.admin.getUserById(post.user_id)
          const email = userResp?.user?.email
          if (!email) { results.push({ id: post.id, skipped: 'no_email' }); continue }
          const normalized = email.trim().toLowerCase()
          const { data: suppressed } = await supabase
            .from('suppressed_emails').select('email').eq('email', normalized).maybeSingle()
          if (suppressed) { results.push({ id: post.id, skipped: 'suppressed' }); continue }
          const unsubscribeToken = await ensureUnsubToken(supabase, normalized)
          if (!unsubscribeToken) { results.push({ id: post.id, skipped: 'no_token' }); continue }

          const { subject, html, text } = buildEmail(post)
          const messageId = crypto.randomUUID()
          await supabase.from('email_send_log').insert({
            message_id: messageId, template_name: 'post-reminder',
            recipient_email: email, status: 'pending',
          })
          const { error: enqErr } = await supabase.rpc('enqueue_email', {
            queue_name: 'transactional_emails',
            payload: {
              message_id: messageId, to: email,
              from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
              sender_domain: SENDER_DOMAIN, subject, html, text,
              purpose: 'transactional', label: 'post-reminder',
              idempotency_key: `post-reminder-${post.id}`,
              unsubscribe_token: unsubscribeToken,
              queued_at: new Date().toISOString(),
            },
          })
          if (enqErr) { results.push({ id: post.id, error: enqErr.message }); continue }
          await supabase.from('scheduled_posts')
            .update({ status: 'reminded', reminded_at: new Date().toISOString() })
            .eq('id', post.id)
          results.push({ id: post.id, sent: true })
        }
        return Response.json({ ok: true, processed: results.length, results })
      },
    },
  },
})