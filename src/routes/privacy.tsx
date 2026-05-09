import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — The Blog Mum Studio" },
      { name: "description", content: "How The Blog Mum Studio collects, uses, and protects your personal data." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://theblogmumstudio.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed text-foreground">
      <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
      <h1 className="mt-4 font-display text-3xl font-black">Privacy Notice</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: 8 May 2026</p>

      <h2 className="mt-8 font-display text-xl font-bold">1. Who we are</h2>
      <p className="mt-2">
        The Blog Mum Studio is operated by Stephanie Trump, a sole trader based in the United Kingdom, trading as "The Blog
        Mum Studio". For privacy matters we are the <strong>data controller</strong> of the personal data described below.
        Contact: <a className="underline" href="mailto:studio@theblogmum.com">studio@theblogmum.com</a>.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">2. What we collect and why</h2>
      <table className="mt-3 w-full border-collapse text-left text-sm">
        <thead><tr className="border-b border-border"><th className="py-2 pr-4">Category</th><th className="py-2 pr-4">Purpose</th><th className="py-2">Legal basis (UK GDPR)</th></tr></thead>
        <tbody className="align-top">
          <tr className="border-b border-border/60"><td className="py-2 pr-4">Account data (name, email, password hash)</td><td className="py-2 pr-4">Create and secure your account</td><td className="py-2">Contract</td></tr>
          <tr className="border-b border-border/60"><td className="py-2 pr-4">Creator profile (niches, kids' ages, location, work status, platforms, goals)</td><td className="py-2 pr-4">Personalise the briefs and content the AI generates for you</td><td className="py-2">Contract</td></tr>
          <tr className="border-b border-border/60"><td className="py-2 pr-4">Content you create (briefs, captions, planner entries, logged posts)</td><td className="py-2 pr-4">Provide the core service and store your work</td><td className="py-2">Contract</td></tr>
          <tr className="border-b border-border/60"><td className="py-2 pr-4">Support messages</td><td className="py-2 pr-4">Reply to your enquiries</td><td className="py-2">Legitimate interests / contract</td></tr>
          <tr className="border-b border-border/60"><td className="py-2 pr-4">Usage and device data (IP, browser, pages viewed, errors)</td><td className="py-2 pr-4">Security, fraud prevention, debugging, improving the product</td><td className="py-2">Legitimate interests</td></tr>
          <tr><td className="py-2 pr-4">Subscription / purchase status</td><td className="py-2 pr-4">Grant access to paid features and reflect entitlements</td><td className="py-2">Contract</td></tr>
        </tbody>
      </table>
      <p className="mt-3">Payment card details are collected and processed by Stripe, not by us — see "Who we share data with" below.</p>

      <h2 className="mt-6 font-display text-xl font-bold">3. Who we share data with</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li><strong>Hosting and database</strong>: Lovable Cloud (powered by Supabase) — stores your account, creator profile, and content.</li>
        <li><strong>AI generation</strong>: Lovable AI Gateway, which routes prompts to providers such as Google and OpenAI to generate briefs and captions. Inputs sent for generation are processed only to return a response.</li>
        <li><strong>Email</strong>: our email service provider, used to deliver transactional and account emails.</li>
        <li><strong>Payment processor</strong>: Stripe Payments Europe, Limited processes payments, subscription billing, and stores card details on our behalf. See Stripe's privacy notice at <a className="underline" href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>.</li>
        <li><strong>Professional advisers and authorities</strong>: where required by law or to protect our rights.</li>
      </ul>

      <h2 className="mt-6 font-display text-xl font-bold">4. International transfers</h2>
      <p className="mt-2">
        Some of the providers above process data outside the UK/EEA (for example in the US). Where this happens we rely on
        appropriate safeguards such as the UK International Data Transfer Addendum, EU Standard Contractual Clauses, or
        adequacy decisions.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">5. How long we keep your data</h2>
      <p className="mt-2">
        We keep account and content data for as long as your account is active. If you delete your account we delete or
        anonymise your personal data within 30 days, except where we need to keep records for legal, tax, or accounting
        reasons (typically up to 6 years for purchase records).
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">6. Your rights</h2>
      <p className="mt-2">Under UK GDPR you have the right to:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>access the personal data we hold about you;</li>
        <li>have inaccurate data corrected;</li>
        <li>have your data erased ("right to be forgotten");</li>
        <li>restrict or object to processing;</li>
        <li>data portability;</li>
        <li>withdraw consent (where we rely on consent);</li>
        <li>complain to the UK's Information Commissioner's Office (<a className="underline" href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>).</li>
      </ul>
      <p className="mt-2">
        To exercise any of these, email <a className="underline" href="mailto:studio@theblogmum.com">studio@theblogmum.com</a>.
        We respond within one month.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">7. Security</h2>
      <p className="mt-2">
        We use encryption in transit (HTTPS), encryption at rest, access controls, and row-level security on our database to
        protect your data. No system is perfectly secure — please tell us promptly if you suspect a problem with your account.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">8. Cookies</h2>
      <p className="mt-2">
        We use a small number of essential cookies and similar technologies to keep you signed in and to remember your
        preferences. We do not currently use third-party advertising cookies. If we add analytics or marketing cookies in
        future we will update this notice and ask for your consent where required.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">9. Changes</h2>
      <p className="mt-2">
        We may update this notice from time to time. The "Last updated" date at the top will reflect the most recent change.
        Material changes will be communicated by email or in-app notice.
      </p>
    </article>
  );
}
