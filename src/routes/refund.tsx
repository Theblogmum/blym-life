import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Blym" },
      { name: "description", content: "7-day money-back guarantee on all paid plans." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://blym.life/refund" }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed text-foreground">
      <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
      <h1 className="mt-4 font-display text-3xl font-black">Refund Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: 8 May 2026</p>

      <h2 className="mt-8 font-display text-xl font-bold">7-day money-back guarantee</h2>
      <p className="mt-2">
        We want you to feel confident trying Blym. If you're not happy with your purchase, you can request a
        full refund within <strong>7 days</strong> of the order date — no questions asked. This applies to monthly,
        yearly, and lifetime purchases.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">How to request a refund</h2>
      <p className="mt-2">
        Email us at <a className="underline" href="mailto:studio@theblogmum.com">studio@theblogmum.com</a> with the email
        address you used at checkout and your order reference. We'll process the refund through our payment processor
        (Stripe) within a few business days.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">After 7 days</h2>
      <p className="mt-2">
        After the 7-day window, paid subscriptions can still be cancelled at any time from the customer portal. You'll keep
        access until the end of the period you've already paid for, and you won't be billed again. We don't offer pro-rated
        refunds for partial periods after the 7-day window, except where required by law.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">Questions</h2>
      <p className="mt-2">
        Email <a className="underline" href="mailto:studio@theblogmum.com">studio@theblogmum.com</a> and we'll get back to you.
      </p>
    </article>
  );
}
