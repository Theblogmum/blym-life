import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'

const SITE_NAME = 'theblogmumstudio'
const SENDER_DOMAIN = 'notify.theblogmumstudio.com'
const FROM_DOMAIN = 'theblogmumstudio.com'
const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions'

function genToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function ensureUnsubToken(supabase: any, email: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('email_unsubscribe_tokens').select('token, used_at').eq('email', email).maybeSingle()
  if (existing?.token && !existing.used_at) return existing.token
  if (existing?.used_at) return null
  const token = genToken()
  await supabase.from('email_unsubscribe_tokens').upsert({ email, token }, { onConflict: 'email', ignoreDuplicates: true })
  const { data: stored } = await supabase
    .from('email_unsubscribe_tokens').select('token').eq('email', email).maybeSingle()
  return stored?.token ?? null
}

async function aiCall(prompt: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY
  if (!apiKey) return ''
  try {
    const res = await fetch(GATEWAY, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are Bloom, a UK mum-creator strategist. Be concrete and tight.' },
          { role: 'user', content: prompt },
        ],
      }),
    })
    const j: any = await res.json()
    return j?.choices?.[0]?.message?.content ?? ''
  } catch { return '' }
}

export const Route = createFileRoute('/api/public/hooks/weekly-report')({
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

        // Find Pro+ users only (tier in 'pro','ultimate')
        const { data: profiles } = await supabase
          .from('profiles').select('id, tier, display_name').in('tier', ['pro', 'ultimate']).limit(500)

        const today = new Date()
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const weekStartDate = weekStart.toISOString().slice(0, 10)
        const results: any[] = []

        for (const p of profiles ?? []) {
          // Skip if already emailed this week
          const { data: existing } = await supabase
            .from('growth_reports').select('id').eq('user_id', p.id).eq('week_start', weekStartDate).maybeSingle()
          if (existing) { results.push({ user: p.id, skipped: 'already' }); continue }

          const [postsRes, snapsRes] = await Promise.all([
            supabase.from('posts_logged').select('platform, hook, views, likes, saves, posted_at')
              .eq('user_id', p.id).gte('posted_at', weekStartDate).limit(50),
            supabase.from('growth_snapshots').select('platform, followers, snapshot_date')
              .eq('user_id', p.id).order('snapshot_date', { ascending: false }).limit(20),
          ])
          const posts = postsRes.data ?? []
          const snaps = snapsRes.data ?? []
          if (posts.length === 0 && snaps.length === 0) {
            results.push({ user: p.id, skipped: 'no_data' }); continue
          }

          const best = [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0]
          const followerDelta: Record<string, number> = {}
          for (const s of snaps) {
            if (followerDelta[s.platform] === undefined) followerDelta[s.platform] = s.followers
          }

          const summary = `Posts this week: ${posts.length}. Best: "${(best?.hook ?? '').slice(0, 80)}" (${best?.views ?? 0} views).`
          const prompt = `Creator ${p.display_name ?? 'mum'}'s last 7 days:
Posts: ${posts.map(x => `${x.platform}: "${(x.hook ?? '').slice(0, 60)}" — ${x.views ?? 0} views`).join('; ') || 'none'}
Followers snapshot: ${Object.entries(followerDelta).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none'}

Write a 1-screen weekly report in HTML (just the inner content, no <html> tag). Include:
1. <h3>This week in numbers</h3> — 2-3 bullets with the data above
2. <h3>What's working</h3> — 1 short paragraph spotting a pattern
3. <h3>3 hooks for next week</h3> — numbered list of 3 specific ready-to-film hooks for her niche
Keep it warm, British, under 250 words. No emojis spam.`

          const verdictHtml = await aiCall(prompt) || `<p>${summary}</p>`

          await supabase.from('growth_reports').insert({
            user_id: p.id, week_start: weekStartDate,
            summary, ai_verdict: verdictHtml,
            best_post: best?.hook ?? null,
          })

          // Email it
          const { data: userResp } = await supabase.auth.admin.getUserById(p.id)
          const email = userResp?.user?.email
          if (!email) { results.push({ user: p.id, skipped: 'no_email' }); continue }
          const normalized = email.trim().toLowerCase()
          const { data: suppressed } = await supabase
            .from('suppressed_emails').select('email').eq('email', normalized).maybeSingle()
          if (suppressed) { results.push({ user: p.id, skipped: 'suppressed' }); continue }
          const unsubscribeToken = await ensureUnsubToken(supabase, normalized)
          if (!unsubscribeToken) { results.push({ user: p.id, skipped: 'no_token' }); continue }

          const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;padding:24px">
            <h2 style="margin:0 0 4px">Your week in review 🌸</h2>
            <p style="color:#666;margin:0 0 16px">Week of ${weekStartDate}</p>
            ${verdictHtml}
            <p style="margin-top:24px;color:#888;font-size:13px">Open the app to log this week's followers and chat with Bloom.</p>
          </div>`
          const messageId = crypto.randomUUID()
          await supabase.from('email_send_log').insert({
            message_id: messageId, template_name: 'weekly-report', recipient_email: email, status: 'pending',
          })
          const { error: enqErr } = await supabase.rpc('enqueue_email', {
            queue_name: 'transactional_emails',
            payload: {
              message_id: messageId, to: email,
              from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
              sender_domain: SENDER_DOMAIN,
              subject: `Your week in review 🌸`,
              html, text: summary,
              purpose: 'transactional', label: 'weekly-report',
              idempotency_key: `weekly-report-${p.id}-${weekStartDate}`,
              unsubscribe_token: unsubscribeToken,
              queued_at: new Date().toISOString(),
            },
          })
          if (!enqErr) {
            await supabase.from('growth_reports').update({ emailed_at: new Date().toISOString() })
              .eq('user_id', p.id).eq('week_start', weekStartDate)
          }
          results.push({ user: p.id, sent: !enqErr })
        }
        return Response.json({ ok: true, processed: results.length, results })
      },
    },
  },
})