import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Check, Clock, Wand2, Building2, Camera, Flame,
  TrendingUp, CalendarDays, Heart, Star, ArrowRight, FileEdit, Send, Target,
  Lightbulb, BarChart3, DollarSign, Trophy, Quote, Users, Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { useSubscription } from "@/hooks/use-subscription";
import featBrief from "@/assets/feature-brief.jpg";
import featBrand from "@/assets/feature-brand.jpg";
import featGrow from "@/assets/feature-grow.jpg";
import logoImg from "@/assets/logo-blogmum.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Blog Mum Studio — Tell me what to film today" },
      { name: "description", content: "The daily content brief for mum creators. One ready-to-shoot idea every morning: hook, caption, shot list and best time to post. Free to start." },
      { name: "author", content: "The Blog Mum Studio" },
      { name: "keywords", content: "mum content creators, daily content brief, TikTok ideas for mums, Instagram Reels ideas, UGC for mums, content planner" },
      { name: "robots", content: "index, follow" },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "The Blog Mum Studio" },
      { property: "og:url", content: "https://theblogmumstudio.com/" },
      { property: "og:title", content: "The Blog Mum Studio — Tell me what to film today" },
      { property: "og:description", content: "Personalised daily filming briefs for mum creators on TikTok and Instagram. Free to start." },
      { property: "og:image", content: "https://theblogmumstudio.com/og-landing.jpg" },
      { property: "og:image:secure_url", content: "https://theblogmumstudio.com/og-landing.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { property: "og:image:alt", content: "The Blog Mum Studio — Tell me what to film today" },
      { property: "og:locale", content: "en_GB" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Blog Mum Studio — Tell me what to film today" },
      { name: "twitter:description", content: "Personalised daily filming briefs for mum creators on TikTok and Instagram. Free to start." },
      { name: "twitter:image", content: "https://theblogmumstudio.com/og-landing.jpg" },
      { name: "twitter:image:alt", content: "The Blog Mum Studio — Tell me what to film today" },
    ],
    links: [
      { rel: "canonical", href: "https://theblogmumstudio.com/" },
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
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="The Blog Mum" className="h-9 w-auto sm:h-10" width={120} height={40} />
          <span className="sr-only">The Blog Mum Studio</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          <a href="#how" className="rounded-full px-3 py-1.5 transition hover:bg-secondary hover:text-foreground">How it works</a>
          <a href="#features" className="rounded-full px-3 py-1.5 transition hover:bg-secondary hover:text-foreground">Features</a>
          <a href="#pricing" className="rounded-full px-3 py-1.5 transition hover:bg-secondary hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/app"><Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">Open studio</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm" className="rounded-full">Sign in</Button></Link>
              <Link to="/signup"><Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">Start free</Button></Link>
            </>
          )}
        </div>
      </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-aurora">
        <div className="absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-[image:var(--gradient-bloom)] opacity-50 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-[image:var(--gradient-sunrise)] opacity-60 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:grid-cols-[0.9fr_1.15fr]">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70 shadow-[var(--shadow-xs)] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> The Creator OS for mums
            </span>
            <h1 className="mt-5 font-display text-[44px] font-normal leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-[72px]">
              The AI content studio helping{" "}
              <span className="italic text-primary">mums grow online</span>{" "}
              without burnout
              <Heart className="ml-2 inline h-8 w-8 fill-primary text-primary align-middle sm:h-10 sm:w-10" />
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground lg:mx-0">
              Generate scroll-stopping hooks, reel scripts and captions in seconds — built for mums who film between school runs.
            </p>
            {/* High-contrast focal CTA block */}
            <div className="mt-8 rounded-3xl bg-[image:var(--gradient-ink)] p-5 text-background shadow-[var(--shadow-elegant)] sm:p-6">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
                <Link to={ctaPrimary.to}>
                  <Button size="lg" className="w-full rounded-full bg-primary px-8 text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-primary/90 sm:w-auto">
                    {ctaPrimary.label} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {ctaSecondary && (
                  <Link to={ctaSecondary.to}>
                    <Button size="lg" variant="ghost" className="w-full rounded-full text-background hover:bg-background/10 sm:w-auto">
                      {ctaSecondary.label}
                    </Button>
                  </Link>
                )}
              </div>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-medium text-background/75 lg:justify-start">
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Free forever plan</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No card required</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Cancel any time</span>
              </p>
            </div>
            {/* Quick trust signals */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-muted-foreground lg:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 backdrop-blur"><Users className="h-3.5 w-3.5 text-primary" /> Built for busy mums &amp; creators</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 backdrop-blur"><Sparkles className="h-3.5 w-3.5 text-primary" /> 10,000+ ideas generated</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 backdrop-blur"><Zap className="h-3.5 w-3.5 text-primary" /> Made to simplify content creation</span>
            </div>
          </div>

          {/* AI generation mockup — shows the product working */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:scale-[1.06] lg:origin-right">
            <div className="absolute -inset-8 rounded-[2.5rem] bg-[image:var(--gradient-warm)] opacity-20 blur-3xl" aria-hidden />
            <div className="card-elegant relative overflow-hidden p-5 sm:p-7">
              {/* Prompt row */}
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground/70">
                  <Wand2 className="h-4 w-4" />
                </span>
                <p className="text-sm text-muted-foreground">
                  "Reel hook for tired mum-hack"
                  <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-primary align-middle animate-pulse" aria-hidden />
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3 w-3" /> Viral idea generated
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">in 3.2s</span>
              </div>

              {/* Generated hooks */}
              <div className="mt-4 space-y-2.5">
                {[
                  { tag: "Hook", text: "POV: it's 6:47am and this hack just saved my morning." },
                  { tag: "Hook", text: "Why is no one talking about this mum-hack?!" },
                  { tag: "Hook", text: "Tell me you're a mum without telling me…" },
                ].map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-secondary/40 p-3"
                    style={{ animation: `fade-in 0.4s ease-out ${i * 0.15}s both` }}
                  >
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary/80">{h.tag}</p>
                      <p className="mt-0.5 text-sm leading-snug text-foreground">{h.text}</p>
                    </div>
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-success" />
                  </div>
                ))}
              </div>

              {/* Caption preview */}
              <div className="mt-3 rounded-2xl border border-border/60 bg-[var(--surface-peach)]/50 p-3">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Caption · ready to post</p>
                  <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold text-foreground/70">Reel · 18s</span>
                </div>
                <p className="mt-1.5 text-sm leading-snug text-foreground/85">
                  The 30-second mum-hack I wish I'd known a year ago 🫶 Save for later — your future tired self will thank you.
                </p>
              </div>

              {/* Generating shimmer line */}
              <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span>Generating shot list…</span>
              </div>
            </div>

            {/* Floating "before" → blank state chip */}
            <div className="absolute -top-3 -left-4 hidden rounded-2xl border border-border/60 bg-card px-3 py-2 shadow-[var(--shadow-elegant)] sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Before</p>
              <p className="text-xs text-muted-foreground/80">Blank page · 0 ideas</p>
            </div>
            {/* Floating "after" win chip */}
            <div className="absolute -bottom-4 -right-4 hidden rounded-2xl border border-border/60 bg-card p-3 shadow-[var(--shadow-elegant)] sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--surface-mint)] text-success"><TrendingUp className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">After</p>
                  <p className="text-sm font-medium">5 posts ready ✨</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT HELPS ============ */}
      <section className="border-t border-border/60 bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-center">
            <p className="eyebrow">How it helps</p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">Everything you need to post — without the burnout.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { emoji: "✨", title: "Generate", body: "Get viral hooks, captions and reel ideas instantly.", tint: "var(--surface-blush)" },
              { emoji: "📅", title: "Plan", body: "Organise your content week in minutes.", tint: "var(--surface-mint)" },
              { emoji: "🚀", title: "Grow", body: "Use AI-powered strategies designed for creator growth.", tint: "var(--surface-peach)" },
            ].map((item) => (
              <div key={item.title} className="card-elegant p-7 text-left">
                <div className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: item.tint }}>
                  {item.emoji}
                </div>
                <h3 className="mt-5 font-display text-xl font-normal">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF + TESTIMONIALS ============ */}
      <section className="border-y border-border/60 bg-[image:var(--gradient-stone)] py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: "10,000+", label: "AI ideas generated" },
              { value: "4.9★", label: "Average creator rating" },
              { value: "2 mins", label: "From idea to ready-to-post" },
            ].map((s) => (
              <div key={s.label} className="card-elegant flex items-center gap-4 p-5">
                <div className="font-display text-3xl text-primary">{s.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="eyebrow">Loved by mum creators</p>
            <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">Real mums. Real posts. Less burnout.</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { name: "Hannah", handle: "@hannah.mums", body: "I went from staring at a blank caption box to filming 5 reels in one nap. Genuinely the calmest content tool I've used." },
              { name: "Priya", handle: "@priyacreates", body: "The hooks are scary good. Two went viral in my first week. It's like having a content coach in my pocket." },
              { name: "Steph", handle: "@stephmumlife", body: "Finally a tool built for mum schedules — not 22-year-old creators with 12 free hours a day." },
            ].map((t, i) => (
              <figure
                key={t.handle}
                className="card-elegant relative p-6"
                style={{ animation: `fade-in 0.5s ease-out ${i * 0.12}s both` }}
              >
                <Quote className="absolute right-5 top-5 h-5 w-5 text-primary/40" />
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

      <section id="how" className="bg-[image:var(--gradient-stone)] py-20">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-5xl">From overwhelmed to filmed in three calm steps.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { icon: Heart, t: "Tell us your vibe", b: "2-minute setup: niche, kids' ages, what you want to be known for.", tint: "var(--surface-blush)" },
              { icon: Wand2, t: "Get today's brief", b: "Each morning we hand you ONE concrete idea built for your real life.", tint: "var(--surface-peach)" },
              { icon: Camera, t: "Film it & post", b: "Hook, caption, shot list, best post time — all done. You just press record.", tint: "var(--surface-mint)" },
            ].map((s, i) => (
              <div key={s.t} className="card-elegant p-7 text-left">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl text-foreground" style={{ background: s.tint }}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-2xl text-muted-foreground/60">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-normal">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="text-center">
          <p className="eyebrow">Inside the studio</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-5xl">A whole creator business, beautifully organised.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            One tool to plan, one to grow, one to get paid. No bloat — just the bits mum creators actually use.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <BigFeature
            img={featBrief}
            badge="Plan"
            title="Today's brief, ready by breakfast"
            body="One ready-to-film idea — hook, caption, shot list and best post time — built around your niche and kids."
            surface="surface-peach"
          />
          <BigFeature
            img={featBrand}
            badge="Create"
            title="Template Studio for posts, emails & DMs"
            body="Tell us what you need — we write 4 ready-to-use options in your voice. Posts, captions, brand replies and more."
            surface="surface-mint"
          />
          <BigFeature
            img={featGrow}
            badge="Grow"
            title="Insights that actually move you"
            body="See what's working across your last posts and get tomorrow's brief tuned to your wins."
            surface="surface-plum"
          />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniFeature icon={Flame} title="Viral Lab" body="Paste any trend → remix it for your niche." tint="var(--surface-blush)" />
          <MiniFeature icon={Wand2} title="Template Studio" body="Posts, emails & DMs in 4 picks." tint="var(--surface-peach)" />
          <MiniFeature icon={CalendarDays} title="Weekly Planner" body="7-day grid you'll actually fill." tint="var(--surface-mint)" />
          <MiniFeature icon={TrendingUp} title="Recycler" body="One clip → 5 fresh angles." tint="var(--surface-butter)" />
          <MiniFeature icon={Lightbulb} title="Content Ideas" body="A library that learns your voice." tint="var(--surface-plum)" />
          <MiniFeature icon={BarChart3} title="Insights" body="Calm analytics — only what matters." tint="var(--surface-sky)" />
          <MiniFeature icon={DollarSign} title="Revenue Hub" body="Income, invoices & brand pipeline." tint="var(--surface-mint)" />
          <MiniFeature icon={Trophy} title="Creator Wins" body="Celebrate every milestone." tint="var(--surface-blush)" />
        </div>
      </section>

      <section id="pricing" className="border-t border-border/60 bg-[image:var(--gradient-stone)] py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-5xl">Free to start. Upgrade when you're ready.</h2>
          <PricingPlans />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
        <p className="eyebrow text-center">FAQ</p>
        <h2 className="mt-3 text-center font-display text-3xl font-normal tracking-tight sm:text-4xl">Things mums ask us</h2>
        <div className="mt-10 space-y-3">
          {[
            { q: "Do I need to be on camera?", a: "Nope. Most briefs work as voiceover, hands-only or text-on-screen." },
            { q: "What platforms is it for?", a: "TikTok and Instagram Reels. Briefs are designed for short-form vertical video." },
            { q: "How long does setup take?", a: "About 2 minutes. Tell us your niche, kids' ages and goal and you're in." },
            { q: "Can I cancel anytime?", a: "Yes — one click in Settings. No awkward emails." },
          ].map((f) => (
            <details key={f.q} className="group rounded-3xl border border-border/70 bg-card p-6 transition hover:border-border [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-foreground">
                {f.q}
                <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[image:var(--gradient-ink)] p-10 text-center text-background sm:p-14">
          <div className="absolute inset-0 bg-background/20" aria-hidden />
          <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[image:var(--gradient-warm)] opacity-30 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[image:var(--gradient-bloom)] opacity-25 blur-3xl" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-background/80 backdrop-blur">
              <Clock className="h-3.5 w-3.5" /> Tomorrow morning
            </span>
            <h2 className="mt-4 font-display text-3xl font-normal tracking-tight sm:text-5xl">Your brief is already being written.</h2>
            <p className="mx-auto mt-3 max-w-xl text-background/70">Stop scrolling for ideas. Start filming the right one — calm, clear, on-brand.</p>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Link to={ctaPrimary.to}><Button size="lg" className="w-full rounded-full bg-background px-8 text-foreground hover:bg-background/90 sm:w-auto">{ctaPrimary.label} <ArrowRight className="h-4 w-4" /></Button></Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.to}><Button size="lg" variant="ghost" className="w-full rounded-full text-background hover:bg-background/10 sm:w-auto">Sign in</Button></Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        <p>Made with care for mum creators · @theblogmumstudio</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <span aria-hidden>·</span>
          <Link to="/refund" className="hover:text-foreground">Refund Policy</Link>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <span aria-hidden>·</span>
          <a href="mailto:studio@theblogmum.com" className="hover:text-foreground">Contact</a>
        </p>
        <p className="mt-2">© {new Date().getFullYear()} Stephanie Trump trading as The Blog Mum Studio</p>
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
      <div className={highlighted ? "h-full rounded-[calc(1.75rem-1.5px)] bg-card p-5 text-left flex flex-col" : "flex flex-1 flex-col"}>
        {highlighted && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-background">Most loved</span>
        )}
        <p className="eyebrow">{name}</p>
        <p className="mt-2 font-display text-3xl sm:text-4xl font-normal tracking-tight">
          {price}<span className="ml-0.5 text-sm font-normal text-muted-foreground">{priceSuffix}</span>
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground leading-snug">{tagline}</p>
        <ul className="mt-4 flex-1 space-y-2 text-[13px] leading-snug">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-1 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Check className="h-2 w-2" /></span>
              <span className="min-w-0 break-words text-foreground/80">{f}</span>
            </li>
          ))}
        </ul>
        <Button onClick={cta.onClick} disabled={cta.disabled} className={`mt-5 w-full rounded-full ${highlighted ? "bg-foreground text-background hover:bg-foreground/90" : ""}`} variant={highlighted ? "default" : "outline"}>
          {cta.label}
        </Button>
      </div>
    </div>
  );
}

function BigFeature({
  img, badge, title, body, surface,
}: { img: string; badge: string; title: string; body: string; surface: string }) {
  return (
    <div className={`group overflow-hidden rounded-[1.75rem] border border-border/60 ${surface} shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-elegant)]`}>
      <div className="aspect-[4/3] overflow-hidden">
        <img src={img} alt={title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="p-7">
        <span className="inline-block rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
          {badge}
        </span>
        <h3 className="mt-3 font-display text-xl font-normal leading-snug">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">{body}</p>
      </div>
    </div>
  );
}

function MiniFeature({
  icon: Icon, title, body, tint,
}: { icon: ComponentType<{ className?: string }>; title: string; body: string; tint?: string }) {
  return (
    <div className="card-elegant p-5">
      <div className="grid h-10 w-10 place-items-center rounded-2xl text-foreground" style={{ background: tint ?? "var(--surface-stone)" }}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-display text-base font-normal">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function MiniStat({
  icon: Icon, label, value, unit, tint,
}: { icon: ComponentType<{ className?: string }>; label: string; value: string; unit: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3.5">
      <div className="flex items-center justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-xl text-foreground" style={{ background: tint }}>
          <Icon className="h-4 w-4" />
        </span>
        <TrendingUp className="h-3.5 w-3.5 text-success" />
      </div>
      <p className="mt-2.5 font-display text-2xl leading-none">{value}<span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span></p>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
