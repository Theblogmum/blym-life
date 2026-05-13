import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/unsubscribe')({
  head: () => ({
    meta: [
      { title: "Unsubscribe from Blym emails — Manage your preferences" },
      { name: "description", content: "Confirm your unsubscribe request to stop receiving Blym app emails. You'll still get essential account messages." },
      { property: "og:title", content: "Unsubscribe from Blym emails" },
      { property: "og:description", content: "Confirm your unsubscribe request to stop receiving Blym app emails. You'll still get essential account messages." },
      { property: "og:url", content: "https://www.blym.life/unsubscribe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://www.blym.life/unsubscribe" }],
  }),
  component: UnsubscribePage,
  validateSearch: (s: Record<string, unknown>) => ({ token: (s.token as string) ?? '' }),
})

function UnsubscribePage() {
  const { token } = Route.useSearch()
  const [state, setState] = useState<'loading' | 'ready' | 'done' | 'used' | 'invalid' | 'error'>('loading')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) { setState('invalid'); return }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) return setState('invalid')
        if (j?.alreadyUnsubscribed || j?.status === 'used') return setState('used')
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [token])

  const confirm = async () => {
    setBusy(true)
    try {
      const r = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      setState(r.ok ? 'done' : 'error')
    } catch {
      setState('error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Email preferences</h1>
        {state === 'loading' && <p className="mt-3 text-sm text-muted-foreground">Checking your link…</p>}
        {state === 'invalid' && <p className="mt-3 text-sm text-muted-foreground">This unsubscribe link is invalid or expired.</p>}
        {state === 'used' && <p className="mt-3 text-sm text-muted-foreground">You're already unsubscribed. No more app emails will be sent.</p>}
        {state === 'ready' && (
          <>
            <p className="mt-3 text-sm text-muted-foreground">Click below to unsubscribe from app emails. You'll still receive essential account messages.</p>
            <Button className="mt-6 rounded-full" disabled={busy} onClick={confirm}>
              {busy ? 'Unsubscribing…' : 'Confirm unsubscribe'}
            </Button>
          </>
        )}
        {state === 'done' && <p className="mt-3 text-sm text-muted-foreground">You've been unsubscribed. Sorry to see you go 💛</p>}
        {state === 'error' && <p className="mt-3 text-sm text-destructive">Something went wrong. Please try again later.</p>}
      </div>
    </div>
  )
}