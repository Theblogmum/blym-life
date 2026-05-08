import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — The Blog Mum Studio" },
      { name: "description", content: "30-day money-back guarantee on all paid plans." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://theblogmumstudio.lovable.app/refund" }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed text-foreground">
      <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
      <h1 className="mt-4 font-display text-3xl font-black">Refund Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: 8 May 2026</p>

      <h2 className="mt-8 font-display text-xl font-bold">30-day money-back guarantee</h2>
      <p className="mt-2">
        We want you to feel confident trying The Blog Mum Studio. If you're not happy with your purchase, you can request a
        full refund within <strong>30 days</strong> of the order date — no questions asked. This applies to monthly,
        yearly, and lifetime purchases.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">How to request a refund</h2>
      <p className="mt-2">
        Refunds are processed by our payment provider, Paddle, which acts as Merchant of Record for our orders. To request a
        refund:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          Visit <a className="underline" href="https://paddle.net" target="_blank" rel="noopener noreferrer">paddle.net</a> and
          look up your order using the email address you used at checkout, or
        </li>
        <li>
          Email us at <a className="underline" href="mailto:theblogmum@gmail.com">theblogmum@gmail.com</a> with your order
          reference and we'll handle it for you.
        </li>
      </ul>

      <h2 className="mt-6 font-display text-xl font-bold">After 30 days</h2>
      <p className="mt-2">
        After the 30-day window, paid subscriptions can still be cancelled at any time from the customer portal. You'll keep
        access until the end of the period you've already paid for, and you won't be billed again. We don't offer pro-rated
        refunds for partial periods after the 30-day window, except where required by law.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">Questions</h2>
      <p className="mt-2">
        Email <a className="underline" href="mailto:theblogmum@gmail.com">theblogmum@gmail.com</a> and we'll get back to you.
      </p>
    </article>
  );
}
