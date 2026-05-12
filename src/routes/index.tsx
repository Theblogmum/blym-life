import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Check, Clock, Wand2, Camera,
  Heart, Star, ArrowRight, Quote,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { useSubscription } from "@/hooks/use-subscription";
import featBrief from "@/assets/feature-brief.jpg";
import featBrand from "@/assets/feature-brand.jpg";
import featGrow from "@/assets/feature-grow.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blym — Tell me what to film today" },
      { name: "description", content: "The daily content brief for mum creators. One ready-to-shoot idea every morning: hook, caption, shot list and best time to post. Free to start." },
      { name: "author", content: "Blym" },
      { name: "keywords", content: "mum content creators, daily content brief, TikTok ideas for mums, Instagram Reels ideas, UGC for mums, content planner" },
      { name: "robots", content: "index, follow" },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Blym" },
      { property: "og:url", content: "https://blym.life/" },
      { property: "og:title", content: "Blym — Tell me what to film today" },
      { property: "og:description", content: "Personalised daily filming briefs for mum creators on TikTok and Instagram. Free to start." },
      { property: "og:image", content: "https://blym.life/og-landing.jpg" },
      { property: "og:image:secure_url", content: "https://blym.life/og-landing.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:site_name", content: "Blym" },
      { property: "og:image:alt", content: "Blym — Tell me what to film today" },
      { property: "og:locale", content: "en_GB" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Blym — Tell me what to film today" },
      { name: "twitter:description", content: "Personalised daily filming briefs for mum creators on TikTok and Instagram. Free to start." },
      { name: "twitter:image", content: "https://blym.life/og-landing.jpg" },
      { name: "twitter:image:alt", content: "Blym — Tell me what to film today" },
    ],
    links: [
      { rel: "canonical", href: "https://blym.life/" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // Note: signed-in users still see the homepage. They can click "Open studio" to enter the app.
  void loading;
  void navigate;

  const ctaPrimary = user ? { to: "/app" as const, label: "Create my content" } : { to: "/signup" as const, label: "Create my content — free" };
  const ctaSecondary = user ? null : { to: "/login" as const, label: "I have an account" };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-base font-semibold tracking-tight text-foreground">
          <span className="sr-only">Blym</span>
          <span aria-hidden>Blym</span>
        </Link>
        {/* Tight, balanced nav */}
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {[
            { href: "#features", label: "Features" },
            { href: "#how", label: "How it works" },
            { href: "#features", label: "Examples" },
            { href: "#pricing", label: "Pricing" },
            { href: "#testimonials", label: "Reviews" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/app">
              <Button
                size="lg"
                className="rounded-full bg-secondary px-5 text-[13px] font-semibold text-foreground shadow-[var(--shadow-soft)] hover:bg-secondary/80"
              >
                Open studio <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="rounded-full text-[13px] text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="lg"
                  className="rounded-full bg-anchor px-5 text-[13px] font-semibold text-anchor-foreground shadow-[var(--shadow-soft)] hover:bg-anchor/90"
                >
                  Start free <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-background">
        {/* Soft, faded backdrop — single subtle wash, no decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: "var(--gradient-aurora)" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-24 pb-20 sm:px-8 sm:pt-32 sm:pb-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-40 lg:pb-32">
          {/* LEFT — single focal point: headline + subtext + CTA */}
          <div className="text-left">
            <h1 className="font-display text-[40px] font-normal leading-[1.05] tracking-[-0.025em] text-foreground text-balance sm:text-[56px] lg:text-[64px]">
              Know what to post before your <span className="italic text-primary">coffee</span> gets cold.
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-[1.6] text-muted-foreground text-pretty sm:text-[19px]">
              Hooks, captions, content plans, analysis tools and viral ideas — without the mental load.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link to={ctaPrimary.to}>
                <Button size="lg" className="rounded-full bg-anchor px-7 py-6 text-base text-anchor-foreground hover:bg-anchor/90">
                  Start creating <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.to}>
                  <Button size="lg" variant="ghost" className="rounded-full px-5 py-6 text-base text-muted-foreground hover:text-foreground">
                    {ctaSecondary.label}
                  </Button>
                </Link>
              )}
            </div>
            <p className="mt-4 text-[12px] text-muted-foreground">
              Free forever plan · No card required
            </p>
            {/* Inline stats — directly under CTA so they feel part of the promise */}
            <dl className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-3">
              {[
                { value: "10,000+", label: "ideas generated" },
                { value: "4.9★", label: "creator rating" },
                { value: "2 mins", label: "to ready-to-post" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <dt className="font-display text-xl text-foreground sm:text-2xl">{s.value}</dt>
                  <dd className="text-[12px] text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* RIGHT — ONE polished mockup. Background fades softly. */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* Soft fade glow behind the single mockup */}
            <div
              aria-hidden
              className="absolute -inset-10 rounded-[3rem] opacity-40 blur-3xl"
              style={{ background: "var(--gradient-warm)" }}
            />
            <div className="relative overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-elegant)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 bg-secondary/40 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              </div>
              <div className="p-7 sm:p-9">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Today's brief · Tuesday</p>
                <h3 className="mt-3 font-display text-2xl leading-snug text-foreground sm:text-[28px]">
                  The 30-second mum-hack you'll wish you'd known sooner.
                </h3>
                <div className="mt-7 rounded-2xl bg-secondary/40 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Hook</p>
                  <p className="mt-2 text-[15px] leading-snug text-foreground">
                    "POV: it's 6:47am and this hack just saved my morning."
                  </p>
                </div>
                <div className="mt-3 rounded-2xl bg-secondary/40 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Caption</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">
                    Save this for your future tired self 🫶 Three minutes that change the whole morning.
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Best posted 7:42pm
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> Ready to film
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT HELPS ============ */}
      <section className="relative bg-background py-24 sm:py-32">
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">What you can do in Blym</p>
            <h2 className="mt-4 font-display text-[32px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[48px]">
              Real tools for the bits that actually slow you down.
            </h2>
          </div>

          <div className="mt-16 space-y-24 sm:space-y-32">
            {/* Row 1 — image right */}
            <FeatureRow
              copy={
                <>
                  <p className="eyebrow">Generate</p>
                  <h3 className="mt-3 font-display text-[28px] leading-[1.1] tracking-[-0.015em] sm:text-[36px]">
                    Generate hooks that <span className="italic text-primary">sound human</span>.
                  </h3>
                  <p className="mt-4 max-w-md text-[16px] leading-[1.65] text-muted-foreground">
                    No more "Are you tired of…" openers. Just hooks that sound like you on a good day.
                  </p>
                  <Link to="/generator" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-anchor">
                    Try the generator <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              }
              image={featBrief}
              imageSide="right"
              tint="var(--surface-peach)"
            />

            {/* Row 2 — image left, slightly offset for asymmetry */}
            <FeatureRow
              copy={
                <>
                  <p className="eyebrow">Plan</p>
                  <h3 className="mt-3 font-display text-[28px] leading-[1.1] tracking-[-0.015em] sm:text-[36px]">
                    Plan a week of content in <span className="italic text-primary">5 minutes</span>.
                  </h3>
                  <p className="mt-4 max-w-md text-[16px] leading-[1.65] text-muted-foreground">
                    Drag, drop, done. A full content week — laid out around your real life, not a 22-year-old's calendar.
                  </p>
                  <Link to="/planner" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-anchor">
                    Open the planner <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              }
              image={featBrand}
              imageSide="left"
              tint="var(--surface-mint)"
              offset
            />

            {/* Row 3 — image right */}
            <FeatureRow
              copy={
                <>
                  <p className="eyebrow">Create</p>
                  <h3 className="mt-3 font-display text-[28px] leading-[1.1] tracking-[-0.015em] sm:text-[36px]">
                    Never stare at a <span className="italic text-primary">blank caption box</span> again.
                  </h3>
                  <p className="mt-4 max-w-md text-[16px] leading-[1.65] text-muted-foreground">
                    Tell Blym what you filmed — get four ready-to-post captions in your voice, with the right hooks and CTAs.
                  </p>
                  <Link to="/templates" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-anchor">
                    Open the studio <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              }
              image={featGrow}
              imageSide="right"
              tint="var(--surface-blush)"
            />
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF + TESTIMONIALS ============ */}
      <section id="testimonials" className="relative overflow-hidden bg-[image:var(--gradient-stone)] py-14 sm:py-16">
        <div aria-hidden className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[image:var(--gradient-bloom)] opacity-25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[image:var(--gradient-mint)] opacity-25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="text-center">
            <p className="eyebrow">Loved by mum creators</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[52px]">
              Real mums. Real posts. Less burnout.
            </h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { name: "Hannah", handle: "@hannah.mums", body: "I went from staring at a blank caption box to filming 5 reels in one nap. Genuinely the calmest content tool I've used." },
              { name: "Priya", handle: "@priyacreates", body: "The hooks are scary good. Two went viral in my first week. It's like having a content coach in my pocket." },
              { name: "Steph", handle: "@stephmumlife", body: "Finally a tool built for mum schedules — not 22-year-old creators with 12 free hours a day." },
            ].map((t, i) => (
              <figure
                key={t.handle}
                className="relative p-2"
                style={{ animation: `fade-in 0.5s ease-out ${i * 0.12}s both` }}
              >
                <Quote className="absolute right-2 top-0 h-5 w-5 text-primary/30" />
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-primary" />)}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">"{t.body}"</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-bloom)] font-display text-sm text-foreground">{t.name[0]}</span>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-muted-foreground">{t.handle}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="relative overflow-hidden bg-[image:var(--gradient-sunrise)] py-20">
        {/* Wavy top divider */}
        <svg
          aria-hidden
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="absolute -top-px left-0 h-10 w-full text-background"
        >
          <path d="M0,40 C200,10 400,60 600,30 C800,0 1000,50 1200,20 L1200,0 L0,0 Z" fill="currentColor" />
        </svg>
        <div aria-hidden className="absolute right-[-4rem] top-20 h-72 w-72 rounded-full bg-[image:var(--gradient-bloom)] opacity-25 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="eyebrow">How it works</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[56px]">
            From overwhelmed to filmed in three calm steps.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {[
              { icon: Heart, t: "Tell us your vibe", b: "2-minute setup: niche, kids' ages, what you want to be known for.", tint: "var(--surface-blush)" },
              { icon: Wand2, t: "Get today's brief", b: "Each morning we hand you ONE concrete idea built for your real life.", tint: "var(--surface-peach)" },
              { icon: Camera, t: "Film it & post", b: "Hook, caption, shot list, best post time — all done. You just press record.", tint: "var(--surface-mint)" },
            ].map((s, i) => (
              <div
                key={s.t}
                className="relative text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl text-foreground" style={{ background: s.tint }}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-2xl text-muted-foreground/60">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-medium tracking-tight">{s.t}</h3>
                <p className="mt-2 text-[14px] leading-[1.65] text-muted-foreground text-pretty">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial "more inside" — minimal pill row, no template-y card grid */}
      <section id="features" className="relative bg-background px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">And there's more inside</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-[36px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[56px]">
            A whole creator studio — quietly powerful.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.65] text-muted-foreground text-pretty">
            Viral Lab, Recycler, Insights, Revenue Hub, Wins — the calm tools that make a real creator business.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {[
              "Viral Lab", "Weekly Planner", "Recycler", "Template Studio",
              "Content Ideas", "Insights", "Revenue Hub", "Creator Wins",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full bg-secondary/60 px-4 py-1.5 text-[13px] font-medium text-foreground/80"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[image:var(--gradient-stone)] py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="eyebrow">Pricing</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[56px]">
            Free to start. Upgrade when you're ready.
          </h2>
          <PricingPlans />
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
        <p className="eyebrow text-center">FAQ</p>
        <h2 className="mx-auto mt-4 text-center font-display text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[52px]">
          Things mums ask us
        </h2>
        <div className="mt-10 space-y-3">
          {[
            { q: "Do I need to be on camera?", a: "Nope. Most briefs work as voiceover, hands-only or text-on-screen." },
            { q: "What platforms is it for?", a: "TikTok and Instagram Reels. Briefs are designed for short-form vertical video." },
            { q: "How long does setup take?", a: "About 2 minutes. Tell us your niche, kids' ages and goal and you're in." },
            { q: "Can I cancel anytime?", a: "Yes — one click in Settings. No awkward emails." },
          ].map((f) => (
            <details key={f.q} className="group rounded-2xl px-2 py-5 border-b border-border/50 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium leading-snug text-foreground">
                {f.q}
                <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[14px] leading-[1.65] text-muted-foreground text-pretty">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-anchor p-12 text-center text-white shadow-[var(--shadow-elegant)] sm:p-20">
          <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[image:var(--gradient-warm)] opacity-25 blur-3xl" aria-hidden />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[image:var(--gradient-bloom)] opacity-20 blur-3xl" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              <Clock className="h-3.5 w-3.5" /> Tomorrow morning
            </span>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-[36px] font-normal leading-[1.02] tracking-[-0.025em] text-balance sm:text-[64px]">
              Your brief is already being written.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-[17px] leading-[1.6] text-white/75 text-pretty">
              Stop scrolling for ideas. Start filming the right one — calm, clear, on-brand.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Link to={ctaPrimary.to}>
                <Button size="lg" className="w-full rounded-full bg-white px-8 py-6 text-base text-foreground shadow-[var(--shadow-soft)] hover:bg-white/90 sm:w-auto">
                  {ctaPrimary.label} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.to}>
                  <Button size="lg" variant="ghost" className="w-full rounded-full px-6 py-6 text-base text-white hover:bg-white/10 sm:w-auto">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <div className="rounded-[2rem] bg-primary/70 p-8 text-center text-white shadow-[var(--shadow-soft)] sm:p-10">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">Get in touch</span>
          <h2 className="mt-4 font-display text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-white text-balance sm:text-[36px]">Say hi — we read every message.</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-[1.6] text-white/85 text-pretty">
            Questions, partnerships, or just want to share a win? Email the studio and we'll reply personally.
          </p>
          <a
            href="mailto:info@blym.life"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white/90"
          >
            info@blym.life
          </a>
        </div>
      </section>

      <footer className="py-10 text-center text-xs text-muted-foreground">
        <p>Made with care for mum creators · @blym.life</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <span aria-hidden>·</span>
          <Link to="/refund" className="hover:text-foreground">Refund Policy</Link>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <span aria-hidden>·</span>
          <a href="#contact" className="hover:text-foreground">Contact</a>
        </p>
        <p className="mt-2">© {new Date().getFullYear()} Stephanie Trump trading as Blym</p>
      </footer>
    </div>
  );
}

function PricingPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, loading } = useStripeCheckout();
  const { isActive, hasLifetime } = useSubscription();

  const buy = async (priceId: string) => {
    if (!user) {
      navigate({ to: "/signup" });
      return;
    }
    await openCheckout({
      priceId,
      successUrl: `${window.location.origin}/app?checkout=success`,
      cancelUrl: window.location.href,
    });
  };

  return (
    <>
      {isActive && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          <Check className="h-4 w-4 text-primary" />
          {hasLifetime ? "You're a Lifetime member 💛" : "You're on a paid plan 💛"}
        </div>
      )}
      <div className="mt-8 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <PriceCard
          name="Free"
          price="£0"
          tagline="Free forever — no card needed."
          features={[
            "20 content ideas + scripts / month",
            "10 caption + hook generations / month",
            "Basic weekly content planner",
            "Unlimited saves & favourites",
            "Light trend inspiration feed",
          ]}
          cta={
            isActive
              ? { label: "Included", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: user ? "Open studio" : "Start free", onClick: () => navigate({ to: user ? "/app" : "/signup" }) }
          }
        />
        <PriceCard
          name="Creator"
          price="£9.99"
          priceSuffix="/mo"
          tagline="The sweet spot for serious creators."
          features={[
            "Unlimited content ideas + scripts",
            "Unlimited captions, hooks & CTAs",
            "Full TikTok / Reel script studio",
            "Weekly + monthly content calendar",
            "Smart saves: folders + tags",
            "Trend breakdowns + niche mode",
          ]}
          cta={
            isActive
              ? { label: hasLifetime ? "Included in Lifetime" : "Included", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: loading ? "Opening…" : user ? "Go Creator" : "Go Creator", onClick: () => buy("creator_monthly"), disabled: loading }
          }
        />
        <PriceCard
          highlighted
          name="Pro"
          price="£24.99"
          priceSuffix="/mo"
          tagline="For creators serious about growth."
          features={[
            "Everything in Creator",
            "Full Viral Growth Strategy generator",
            "Advanced AI: viral rewrites + SEO captions",
            "Viral breakdown library + performance scoring",
            "1-click 7-day content batching",
            "Niche domination + repurposing engine",
            "Weekly AI growth reset",
          ]}
          cta={
            isActive
              ? { label: hasLifetime ? "Included in Lifetime" : "Included", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: loading ? "Opening…" : user ? "Upgrade to Pro" : "Start with Pro", onClick: () => buy("pro_monthly"), disabled: loading }
          }
        />
        <PriceCard
          name="Ultimate"
          price="£44.99"
          priceSuffix="/mo"
          tagline="Your always-on AI growth coach."
          features={[
            "Everything in Pro",
            "Personal AI growth coach (chat + critique)",
            "30-day done-with-you content plans",
            "Growth simulation + viral content studio",
            "Audience psychology + monetisation guidance",
            "Brand pitch generator + media kit + invoices",
            "Multi-platform engine + monthly strategy report",
            "Elite viral templates library",
            "Priority AI: faster + deeper outputs",
          ]}
          cta={
            isActive
              ? { label: hasLifetime ? "Included in Lifetime" : "Included", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: loading ? "Opening…" : user ? "Go Ultimate" : "Start with Ultimate", onClick: () => buy("ultimate_monthly"), disabled: loading }
          }
        />
        <PriceCard
          name="Lifetime"
          price="£299"
          tagline="One payment. Forever yours."
          features={["Everything in Ultimate", "Pay once, never again", "All future features included"]}
          cta={
            hasLifetime
              ? { label: "You own this 💛", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: loading ? "Opening…" : user ? "Get lifetime" : "Sign up to buy", onClick: () => buy("lifetime_oneoff"), disabled: loading }
          }
        />
      </div>
    </>
  );
}

function PriceCard({
  name, price, priceSuffix, tagline, features, cta, highlighted,
}: {
  name: string; price: string; priceSuffix?: string; tagline: string;
  features: string[]; cta: { label: string; onClick: () => void; disabled?: boolean }; highlighted?: boolean;
}) {
  return (
    <div className={highlighted
      ? "relative h-full rounded-[1.75rem] bg-[image:var(--gradient-warm)] p-[1.5px] shadow-[var(--shadow-glow)]"
      : "card-elegant h-full p-5 text-left flex flex-col"}>
      <div className={highlighted ? "h-full rounded-[calc(1.75rem-1.5px)] bg-card p-4 sm:p-5 text-left flex flex-col" : "flex flex-1 flex-col"}>
        {highlighted && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-background">Most loved</span>
        )}
        <p className="eyebrow">{name}</p>
        <p className="mt-2 font-display text-2xl font-normal tracking-tight sm:text-3xl">
          {price}<span className="ml-0.5 text-xs font-normal text-muted-foreground">{priceSuffix}</span>
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{tagline}</p>
        <ul className="mt-3 flex-1 space-y-1.5 text-[12px] leading-[1.4]">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-1.5">
              <span className="mt-0.5 grid h-3 w-3 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Check className="h-2 w-2" /></span>
              <span className="min-w-0 break-words text-foreground/80">{f}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={cta.onClick}
          disabled={cta.disabled}
          size="sm"
          className={`mt-4 w-full rounded-full px-3 text-[12px] font-semibold whitespace-nowrap ${highlighted ? "bg-anchor text-anchor-foreground hover:bg-anchor/90" : ""}`}
          variant={highlighted ? "default" : "outline"}
        >
          {cta.label}
        </Button>
      </div>
    </div>
  );
}

function FeatureRow({
  copy, image, imageSide, tint, offset,
}: {
  copy: ReactNode;
  image: string;
  imageSide: "left" | "right";
  tint: string;
  offset?: boolean;
}) {
  const imageFirst = imageSide === "left";
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={imageFirst ? "lg:order-1" : "lg:order-2"}>
        <div
          className={`relative overflow-hidden rounded-[2rem] shadow-[var(--shadow-elegant)] ${offset ? "lg:translate-y-6" : ""}`}
          style={{ background: tint }}
        >
          <img
            src={image}
            alt=""
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>{copy}</div>
    </div>
  );
}
