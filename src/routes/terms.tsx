import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Blym by The Blog Mum" },
      { name: "description", content: "Terms and conditions for using Blym by The Blog Mum." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://theblogmumstudio.com/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 text-sm leading-relaxed text-foreground">
      <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to home</Link>
      <h1 className="mt-4 font-display text-3xl font-black">Terms & Conditions</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: 8 May 2026</p>

      <h2 className="mt-8 font-display text-xl font-bold">1. Who you are contracting with</h2>
      <p className="mt-2">
        Blym by The Blog Mum ("we", "us", "our") is operated by Stephanie Trump, a sole trader based in Guernsey, Channel Islands.
        You can contact us at <a className="underline" href="mailto:studio@theblogmum.com">studio@theblogmum.com</a>.
        By creating an account or using the service you agree to these Terms.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">2. The service</h2>
      <p className="mt-2">
        Blym by The Blog Mum is an AI-assisted content planning tool for social media creators. It generates daily filming
        briefs, hooks, captions, and growth insights based on inputs you provide. The service is delivered via the web at
        theblogmumstudio.com.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">3. Your account</h2>
      <p className="mt-2">
        You must be at least 18 years old (or the age of majority where you live) to use the service. You are responsible
        for keeping your login credentials confidential and for all activity under your account. You agree to provide
        accurate information and keep it up to date.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">4. Acceptable use</h2>
      <p className="mt-2">
        You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict,
        or inhibit anyone else's use of the service. The following uses are strictly prohibited. You must not:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>break any applicable law, regulation, or third-party right (including intellectual property, privacy, publicity, and consumer-protection laws);</li>
        <li>use the service to create, distribute, or promote content that is unlawful, fraudulent, deceptive, defamatory, obscene, sexually explicit, sexual content involving minors, hateful, harassing, threatening, or that incites violence or self-harm;</li>
        <li>generate or distribute spam, bulk unsolicited messages, misleading endorsements, fake reviews, astroturfing, or content designed to manipulate platform algorithms in violation of those platforms' terms;</li>
        <li>impersonate any person or entity, misrepresent your affiliation, or create deepfakes or synthetic media of real people without their explicit consent;</li>
        <li>use the service to give regulated professional advice (medical, legal, financial, tax, or similar) without the appropriate qualifications and disclosures;</li>
        <li>upload or input personal data of third parties without a lawful basis, or any data you do not have the right to share;</li>
        <li>use outputs in connection with high-risk activities (including political campaigning, election interference, weapons, surveillance of individuals, or critical infrastructure) without our prior written consent;</li>
        <li>interfere with the security, integrity, or performance of the service — including introducing malware, probing, scanning, scraping, automated extraction, denial-of-service activity, or attempts to bypass authentication, rate limits, or quotas;</li>
        <li>reverse engineer, decompile, or attempt to derive the source code, models, prompts, or training data underlying the service, except to the extent this restriction is prohibited by law;</li>
        <li>resell, sublicense, redistribute, or share access to the service or its outputs in a way that circumvents the technical limits, seat counts, or pricing of your plan;</li>
        <li>use the service to build or train a competing product, or to benchmark it for the purpose of building a competing product.</li>
      </ul>
      <p className="mt-2">
        You are solely responsible for the prompts and inputs you submit, for reviewing outputs before publishing or relying
        on them, and for ensuring your use complies with the terms of any third-party platform you publish to (for example
        Instagram, TikTok, YouTube, or Pinterest). We may, at our discretion and without liability, investigate suspected
        breaches, refuse or remove content, throttle usage, and suspend or terminate accounts that violate this section
        (see Section 9). Repeated or serious infringement — including repeated copyright complaints — will result in
        permanent termination. To report abuse, infringement, or a takedown request, email{" "}
        <a className="underline" href="mailto:studio@theblogmum.com">studio@theblogmum.com</a>.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">5. AI-generated content</h2>
      <p className="mt-2">
        Briefs, hooks, captions, and other outputs are generated by AI based on your prompts and profile. You are responsible
        for reviewing outputs before publishing, for ensuring you have the rights to any inputs you provide, and for how you
        use the outputs. Outputs may be inaccurate, generic, or unsuitable for your specific situation — they are not legal,
        medical, financial, or professional advice. We may filter, refuse, or remove content that breaches these Terms.
        If you believe an output infringes your rights, contact us at the email above and we will review it.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">6. Intellectual property</h2>
      <p className="mt-2">
        We own the service, our software, branding, and documentation. You are granted a limited, non-exclusive,
        non-transferable right to use the service within your chosen plan. You retain rights to the content you create using
        the service; you grant us a limited licence to host and process your inputs solely so we can provide the service.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">7. Plans, payments, and refunds</h2>
      <p className="mt-2">
        We offer a free tier and paid plans (monthly subscription, yearly subscription, and a one-off lifetime purchase).
        Payments are processed securely by Stripe; we do not store your card details. Where applicable, prices are shown
        inclusive of VAT or sales tax. For our refund policy see <Link to="/refund" className="underline">our Refund Policy</Link>.
        You can cancel paid subscriptions at any time from the customer portal.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">8. Service level</h2>
      <p className="mt-2">
        We work hard to keep the service running but we do not guarantee that it will be uninterrupted, error-free, or
        always available. We disclaim all implied warranties of merchantability and fitness for a particular purpose to the
        fullest extent permitted by law.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">9. Suspension and termination</h2>
      <p className="mt-2">
        We may suspend or terminate your access if you materially breach these Terms, fail to pay, present a security or
        fraud risk, or repeatedly violate our policies. You may stop using the service at any time and cancel paid plans via
        the customer portal.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">10. Liability</h2>
      <p className="mt-2">
        To the fullest extent permitted by law, our aggregate liability arising out of or in connection with the service is
        limited to the fees you paid us in the 12 months preceding the event giving rise to the claim. We are not liable for
        indirect or consequential losses, including loss of profits, revenue, data, or goodwill. Nothing in these Terms
        excludes liability that cannot be excluded under English law (including for fraud, death, or personal injury caused
        by negligence).
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">11. Changes</h2>
      <p className="mt-2">
        We may update these Terms from time to time. Material changes will be communicated via email or in-app notice. Your
        continued use after the change takes effect constitutes acceptance.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">12. Governing law</h2>
      <p className="mt-2">
        These Terms are governed by the laws of England and Wales. The courts of England and Wales have exclusive
        jurisdiction over any dispute, except where mandatory consumer protection law in your country applies.
      </p>

      <h2 className="mt-6 font-display text-xl font-bold">13. Contact</h2>
      <p className="mt-2">
        Questions? Email <a className="underline" href="mailto:studio@theblogmum.com">studio@theblogmum.com</a>.
      </p>
    </article>
  );
}
