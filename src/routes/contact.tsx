import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Blym — Support & Partnerships" },
      { name: "description", content: "Contact Blym for support, partnerships, billing questions, or creator feedback." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Contact Blym" },
      { property: "og:description", content: "Get in touch with Blym for support, partnerships, billing questions, or creator feedback." },
      { property: "og:url", content: "https://www.blym.life/contact" },
    ],
    links: [{ rel: "canonical", href: "https://www.blym.life/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-6 sm:py-14">
      <section className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            Contact Blym
          </div>

          <h1 className="mt-5 font-display text-3xl font-normal leading-tight text-foreground sm:text-5xl">
            Say hi — we read every message.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            For support, partnerships, billing, refunds, creator feedback, or anything else, email the Blym studio directly.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <a
              href="mailto:info@blym.life?subject=Hello%20Blym"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
            >
              <Mail className="h-4 w-4" />
              Email info@blym.life
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText("info@blym.life")}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <Copy className="h-4 w-4" />
              Copy email
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-border/70 bg-background/65 p-5 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">Best email</p>
            <p className="mt-1">info@blym.life</p>
            <p className="mt-4">If your device blocks email apps from opening, use the copy button and paste the address into your email app.</p>
          </div>
        </div>
      </section>
    </main>
  );
}