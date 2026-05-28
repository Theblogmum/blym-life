import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Check, Clock, Wand2, Camera,
  Heart, Star, ArrowRight, Quote, Zap, CalendarDays, MessageSquareText, Recycle, LineChart, Trophy, Flame, Crown, Gift, BadgeCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";
import { useSubscription } from "@/hooks/use-subscription";
import { LandingDemo } from "@/components/landing-demo";
import { CreatorJourney } from "@/components/creator-journey";
import blymLogo from "@/assets/blym-icon.png";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Subtle scroll-reveal for sections (premium, calm fade-up)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll<HTMLElement>(".landing-brand section");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    targets.forEach((el) => el.classList.add("reveal-on-scroll"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Note: signed-in users still see the homepage. They can click "Open studio" to enter the app.
  void loading;
  void navigate;

  const ctaPrimary = user ? { to: "/app" as const, label: "Create my content" } : { to: "/signup" as const, label: "Create my content — free" };
  const ctaSecondary = user ? null : { to: "/login" as const, label: "I have an account" };

  return (
    <div className="landing-brand landing-page min-h-screen overflow-x-hidden bg-background">
      <header
        className={`sticky top-0 z-40 border-b border-white/30 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,backdrop-filter,box-shadow] duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_0_oklch(1_0_0/0.7)_inset,0_12px_36px_-16px_oklch(0.65_0.18_330/0.45)]"
            : "bg-white/55 shadow-[0_1px_0_0_oklch(1_0_0/0.6)_inset,0_8px_28px_-18px_oklch(0.65_0.18_330/0.35)]"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(55% 140% at 10% 0%, color-mix(in oklab, oklch(0.85 0.10 350) 28%, transparent), transparent 60%), radial-gradient(45% 130% at 95% 0%, color-mix(in oklab, oklch(0.82 0.12 300) 22%, transparent), transparent 65%)",
          }}
        />
        <nav className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-8 px-6 sm:px-10">
          {/* LEFT — logo */}
          <Link to="/" aria-label="Blym home" className="flex items-center gap-2">
            <img src={blymLogo} alt="Blym — Show up. Create. Grow." className="h-10 w-auto sm:h-11" />
          </Link>

          {/* CENTER — nav links */}
          <ul className="hidden items-center gap-9 md:flex">
            {[
              { href: "#features", label: "Features" },
              { href: "#how", label: "How It Works" },
              { href: "#pricing", label: "Pricing" },
              { href: "#testimonials", label: "Creator Wins" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[13px] font-medium tracking-tight text-foreground/70 transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* RIGHT — auth CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!user && (
              <Link
                to="/login"
                className="hidden text-[13px] font-medium text-foreground/70 transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign In
              </Link>
            )}
            <Link to={user ? "/app" : "/signup"}>
              <Button
                size="sm"
                className="h-9 rounded-full bg-gradient-to-r from-[oklch(0.72_0.18_350)] to-[oklch(0.68_0.20_310)] px-4 text-[13px] font-semibold text-white shadow-[0_6px_20px_-8px_oklch(0.65_0.22_330/0.55)] transition-all hover:shadow-[0_10px_26px_-8px_oklch(0.65_0.22_330/0.65)]"
              >
                {user ? "Open studio" : "Start Free"}
              </Button>
            </Link>
          </div>
        </nav>
      </header>
      <main>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-background">
        {/* Soft, faded backdrop — single subtle wash, no decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 gradient-drift"
          style={{ background: "var(--gradient-aurora)" }}
        />
        {/* Floating stickers — hero */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
          <span className="chip-sticker drift absolute left-[2%] top-[14%] text-foreground" style={{ ['--drift-rot' as any]: '-8deg', animationDelay: '0.4s' }}>
            <Flame className="h-3.5 w-3.5 text-[color:var(--accent)]" /> 7-day streak
          </span>
          <span className="chip-sticker drift-slow absolute left-[3%] bottom-[12%]" style={{ ['--drift-rot' as any]: '5deg', background: 'var(--surface-peach)' }}>
            <Sparkles className="h-3.5 w-3.5" /> +120 XP
          </span>
          <span className="chip-sticker drift absolute right-[2%] top-[12%]" style={{ ['--drift-rot' as any]: '6deg', background: 'var(--surface-mint)', animationDelay: '1.1s' }}>
            <Crown className="h-3.5 w-3.5" /> Level 4 unlocked
          </span>
          <span className="chip-sticker drift-slow absolute right-[3%] bottom-[14%]" style={{ ['--drift-rot' as any]: '-4deg', background: 'var(--surface-blush)' }}>
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Quest done
          </span>
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 pt-16 pb-12 sm:px-8 sm:pt-[96px] sm:pb-[96px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          {/* LEFT — single focal point: headline + subtext + CTA */}
          <div className="text-left">
            <span className="eyebrow">a creator journey, not a dashboard</span>
            <h1 className="mt-3 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground text-balance sm:text-[52px] lg:text-[60px] xl:text-[68px]">
              Where Creators <span className="text-gradient-game">Level Up</span>.
            </h1>
            <p className="mt-4 max-w-lg text-[16px] leading-[1.5] text-muted-foreground text-pretty sm:text-[20px]">
              The creator app making showing up easier.
            </p>
            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link to={ctaPrimary.to} className="w-full sm:w-auto">
                <Button size="lg" className="btn-chunky btn-chunky--primary w-full text-base sm:w-auto">
                  Start my journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.to} className="w-full sm:w-auto">
                  <Button size="lg" variant="ghost" className="w-full rounded-full px-5 py-6 text-base text-muted-foreground hover:text-foreground sm:w-auto">
                    {ctaSecondary.label}
                  </Button>
                </Link>
              )}
            </div>
            <p className="mt-4 text-[12px] text-muted-foreground">
              free to start · no card · level 1 unlocks instantly ✨
            </p>
            {/* Inline stats — directly under CTA so they feel part of the promise */}
            <dl className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-10">
              {[
                { value: "10 levels", label: "to unlock" },
                { value: "🔥 daily", label: "streaks + XP" },
                { value: "4.9★", label: "creator rating" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <dt className="font-display text-lg text-foreground sm:text-2xl">{s.value}</dt>
                  <dd className="text-[12px] text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* RIGHT — Creator journey game preview */}
          <LandingDemo />
        </div>
      </section>

      {/* ============ THE JOURNEY MAP — signature moment ============ */}
      <CreatorJourney />

      {/* ============ HOW IT HELPS ============ */}
      <section id="features" className="relative bg-background py-11 sm:py-[62px]">
        {/* Floating decorative chips */}
        <span aria-hidden className="chip-sticker drift hidden md:inline-flex absolute right-[8%] top-16" style={{ ['--drift-rot' as any]: '6deg', background: 'var(--surface-mint)' }}>
          <Gift className="h-3.5 w-3.5" /> New brief daily
        </span>
        <span aria-hidden className="chip-sticker drift-slow hidden md:inline-flex absolute left-[6%] bottom-12" style={{ ['--drift-rot' as any]: '-5deg', background: 'var(--surface-peach)' }}>
          <Flame className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Streak saved
        </span>
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">The toolkit</p>
            <h2 className="mt-4 font-display text-[32px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[48px]">
              Everything you need to keep creating.
            </h2>
            <p className="mt-3 text-[14px] font-medium text-muted-foreground">Swipe →</p>
          </div>
        </div>

        {/* Swipeable horizontal carousel */}
        <div className="mt-10 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-5 px-5 sm:px-8 snap-x snap-mandatory">
            {[
              { icon: Zap, title: "Viral Hooks", body: "Hooks that sound like you on a good day — never \"Are you tired of…\" again.", tint: "var(--surface-peach)", to: "/generator" as const },
              { icon: MessageSquareText, title: "Captions in your voice", body: "Four ready-to-post captions with the right hooks and CTAs in seconds.", tint: "var(--surface-blush)", to: "/generator" as const },
              { icon: CalendarDays, title: "Weekly Planner", body: "Drag, drop, done. A full week laid out around your real life.", tint: "var(--surface-mint)", to: "/planner" as const },
              { icon: Recycle, title: "Recycler", body: "Turn one idea into a week's worth of fresh angles.", tint: "var(--surface-peach)", to: "/app" as const },
              { icon: LineChart, title: "Insights", body: "See what's working — without doom-scrolling your own analytics.", tint: "var(--surface-mint)", to: "/app" as const },
              { icon: Trophy, title: "Creator Wins", body: "Celebrate every milestone. Build the receipts for your brand pitches.", tint: "var(--surface-blush)", to: "/app" as const },
            ].map((c, i) => (
              <Link
                key={c.title}
                to={c.to}
                className="group relative shrink-0 snap-start w-[78vw] max-w-[320px] sm:w-[320px] rounded-[2rem] border border-border/60 bg-card p-6 shadow-[var(--shadow-soft),0_8px_32px_-12px_oklch(0.72_0.18_350/0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant),0_12px_40px_-12px_oklch(0.72_0.18_350/0.30)]"
                style={{ animation: `fade-in 0.5s ease-out ${i * 0.08}s both` }}
              >
                <div
                  className="grid h-14 w-14 place-items-center rounded-2xl text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]"
                  style={{ background: c.tint }}
                >
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-[22px] leading-[1.15] tracking-[-0.015em]">{c.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground text-pretty">{c.body}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-transform duration-300 group-hover:translate-x-1">
                  Open <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
            <div className="shrink-0 w-2 sm:w-4" aria-hidden />
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF + TESTIMONIALS ============ */}
      <section id="testimonials" className="relative overflow-hidden bg-[image:var(--gradient-stone)] py-12 sm:py-[72px]">
        <div aria-hidden className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[image:var(--gradient-bloom)] opacity-25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[image:var(--gradient-mint)] opacity-25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="text-center">
            <p className="eyebrow">Loved by mum creators</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[52px]">
              Real mums. Real posts. Less burnout.
            </h2>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {[
              { name: "Hannah", handle: "@hannah.mums", role: "Mum of 2 · Manchester", body: "I went from staring at a blank caption box to filming 5 reels in one nap. Genuinely the calmest content tool I've used." },
              { name: "Priya", handle: "@priyacreates", role: "UGC creator · London", body: "The hooks are scary good. Two went viral in my first week. It's like having a content coach in my pocket." },
              { name: "Steph", handle: "@stephmumlife", role: "Mum of 3 · Leeds", body: "Finally a tool built for mum schedules — not 22-year-old creators with 12 free hours a day." },
            ].map((t, i) => (
              <figure
                key={t.handle}
                className="group relative rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-primary/40 hover:shadow-[var(--shadow-elegant)]"
                style={{ animation: `fade-in 0.5s ease-out ${i * 0.12}s both` }}
              >
                <Quote className="absolute right-3 top-3 h-5 w-5 text-primary/30" />
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-primary" />)}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-foreground/85">"{t.body}"</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-bloom)] font-display text-sm text-foreground">{t.name[0]}</span>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-muted-foreground">{t.handle} · {t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          {/* As-seen-on style strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
            <span>As loved by creators on</span>
            <span className="font-display text-base normal-case tracking-tight text-foreground/80">TikTok</span>
            <span className="font-display text-base normal-case tracking-tight text-foreground/80">Instagram</span>
            <span className="font-display text-base normal-case tracking-tight text-foreground/80">YouTube Shorts</span>
          </div>
        </div>
      </section>

      <section id="how" className="relative overflow-hidden bg-[image:var(--gradient-sunrise)] py-12 sm:py-[72px]">
        {/* Wavy top divider */}
        <svg
          aria-hidden
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="absolute -top-px left-0 h-10 w-full text-background"
        >
          <path d="M0,40 C200,10 400,60 600,30 C800,0 1000,50 1200,20 L1200,0 L0,0 Z" fill="currentColor" />
        </svg>
        <div aria-hidden className="absolute right-[-4rem] top-20 h-72 w-72 rounded-full bg-[image:var(--gradient-bloom)] opacity-30 blur-3xl gradient-drift" />
        <div aria-hidden className="absolute left-[-3rem] bottom-10 h-60 w-60 rounded-full bg-[image:var(--gradient-mint)] opacity-25 blur-3xl gradient-drift" style={{ animationDelay: '4s' }} />
        {/* Floating stickers around the steps */}
        <span aria-hidden className="chip-sticker drift hidden md:inline-flex absolute left-[10%] top-32" style={{ ['--drift-rot' as any]: '-7deg' }}>
          <Sparkles className="h-3.5 w-3.5" /> 2 min setup
        </span>
        <span aria-hidden className="chip-sticker drift-slow hidden md:inline-flex absolute right-[8%] bottom-24" style={{ ['--drift-rot' as any]: '5deg', background: 'var(--surface-blush)' }}>
          <Heart className="h-3.5 w-3.5 text-primary" fill="currentColor" /> Built for mums
        </span>
        <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="eyebrow">How it works</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[56px]">
            From overwhelmed to filmed in three calm steps.
          </h2>
          <div className="mt-11 grid gap-8 sm:grid-cols-3 sm:gap-7">
            {[
              { icon: Heart, t: "Tell us your vibe", b: "2-minute setup.", tint: "var(--surface-blush)" },
              { icon: Wand2, t: "Get today's brief", b: "One idea, built for you.", tint: "var(--surface-peach)" },
              { icon: Camera, t: "Film it & post", b: "Press record. Done.", tint: "var(--surface-mint)" },
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
      <section id="pricing" className="relative overflow-hidden bg-[image:var(--gradient-stone)] py-12 sm:py-[72px]">
        <div aria-hidden className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[image:var(--gradient-aurora)] opacity-40 blur-3xl gradient-drift" />
        <span aria-hidden className="chip-sticker drift hidden md:inline-flex absolute left-[6%] top-16" style={{ ['--drift-rot' as any]: '-6deg', background: 'var(--surface-mint)' }}>
          <Gift className="h-3.5 w-3.5" /> Free forever plan
        </span>
        <span aria-hidden className="chip-sticker drift-slow hidden md:inline-flex absolute right-[6%] top-24" style={{ ['--drift-rot' as any]: '6deg', background: 'var(--surface-peach)' }}>
          <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Cancel anytime
        </span>
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="eyebrow">Pricing</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[56px]">
            Free to start. Upgrade when you're ready.
          </h2>
          <PricingPlans />
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-[72px]">
        <p className="eyebrow text-center">FAQ</p>
        <h2 className="mx-auto mt-2 text-center font-display text-[26px] font-normal leading-[1.05] tracking-[-0.02em] text-balance sm:text-[36px]">
          Things mums ask us
        </h2>
        <div className="mt-6 space-y-1">
          {[
            { q: "Do I need to be on camera?", a: "Nope. Most briefs work as voiceover, hands-only or text-on-screen." },
            { q: "What platforms is it for?", a: "TikTok and Instagram Reels. Briefs are designed for short-form vertical video." },
            { q: "How long does setup take?", a: "About 2 minutes. Tell us your niche, kids' ages and goal and you're in." },
            { q: "Can I cancel anytime?", a: "Yes — one click in Settings. No awkward emails." },
          ].map((f) => (
            <details key={f.q} className="group px-1 py-3 border-b border-border/50 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-[14px] font-medium leading-snug text-foreground">
                {f.q}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-muted-foreground text-pretty">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-4xl px-5 pb-12 sm:px-8 sm:pb-[72px]">
        <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-anchor p-6 text-center text-white shadow-[var(--shadow-elegant)] sm:p-7 flex flex-col">
            <div className="absolute -top-24 -right-16 h-60 w-60 rounded-full bg-[image:var(--gradient-warm)] opacity-25 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-[image:var(--gradient-bloom)] opacity-20 blur-3xl" aria-hidden />
            <div className="relative flex flex-1 flex-col">
              <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                <Clock className="h-3 w-3" /> Tomorrow morning
              </span>
              <h2 className="mx-auto mt-3 font-display text-[20px] font-normal leading-[1.1] tracking-[-0.02em] text-balance sm:text-[26px]">
                Your brief is already being written.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.55] text-white/75 text-pretty">
                Stop scrolling for ideas. Start filming the right one — calm, clear, on-brand.
              </p>
              <div className="mt-auto pt-4 flex flex-col items-stretch justify-center gap-2 sm:flex-row">
                <Link to={ctaPrimary.to}>
                  <Button size="lg" className="w-full rounded-full bg-white px-5 py-3.5 text-sm text-foreground shadow-[var(--shadow-soft)] hover:bg-white/90 sm:w-auto">
                    {ctaPrimary.label} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {ctaSecondary && (
                  <Link to={ctaSecondary.to}>
                    <Button size="lg" variant="ghost" className="w-full rounded-full px-4 py-3.5 text-sm text-white hover:bg-white/10 sm:w-auto">
                      Sign in
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-primary/70 p-6 text-center text-white shadow-[var(--shadow-soft)] sm:p-7 flex flex-col">
            <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">Get in touch</span>
            <h2 className="mt-3 font-display text-[20px] font-normal leading-[1.1] tracking-[-0.02em] text-white text-balance sm:text-[26px]">Say hi — we read every message.</h2>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.55] text-white/85 text-pretty">
              Questions, partnerships, or just want to share a win? Email the studio and we'll reply personally.
            </p>
            <Link
              to="/contact"
              className="mt-auto inline-flex items-center justify-center self-center rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-foreground transition hover:bg-white/90"
            >
              info@blym.life
            </Link>
          </div>
        </div>
      </section>
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground">
        <p>Made with care for mum creators · @blym.life</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <span aria-hidden>·</span>
          <Link to="/refund" className="hover:text-foreground">Refund Policy</Link>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <span aria-hidden>·</span>
          <Link to="/contact" className="hover:text-foreground underline-offset-2 hover:underline">Contact</Link>
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
      <div className="mx-auto mt-7 grid max-w-5xl items-stretch gap-5 sm:grid-cols-3">
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
          price="£14.99"
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
              ? { label: "Included", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: loading ? "Opening…" : user ? "Go Creator" : "Go Creator", onClick: () => buy("creator_monthly"), disabled: loading }
          }
        />
        <PriceCard
          highlighted
          name="Pro"
          price="£27.99"
          priceSuffix="/mo"
          tagline="Your always-on AI growth coach."
          features={[
            "Everything in Creator",
            "Full Viral Growth Strategy generator",
            "Advanced AI: viral rewrites + SEO captions",
            "Viral breakdown library + performance scoring",
            "1-click 7-day content batching",
            "Niche domination + repurposing engine",
            "Personal AI growth coach (chat + critique)",
            "Brand pitch generator + media kit + invoices",
          ]}
          cta={
            isActive
              ? { label: "Included", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: loading ? "Opening…" : user ? "Upgrade to Pro" : "Start with Pro", onClick: () => buy("pro_monthly"), disabled: loading }
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
      ? "pricing-featured-wrap group relative h-full rounded-[1.75rem] bg-[image:var(--gradient-warm)] p-[1.5px] shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_30px_80px_-20px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
      : "group relative h-full rounded-[1.75rem] bg-[image:var(--gradient-warm-soft)] p-[1.5px] shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--primary)_20%,transparent)]"}>
      <div className="h-full rounded-[calc(1.75rem-1.5px)] bg-card p-4 sm:p-5 text-left flex flex-col">
        {highlighted && (
          <span className="pricing-featured-badge absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">Most loved</span>
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
              <span className="min-w-0 break-words text-foreground/90">{f}</span>
            </li>
          ))}
        </ul>
        <Button
          onClick={cta.onClick}
          disabled={cta.disabled}
          size="sm"
          className={`mt-4 w-full rounded-full px-3 text-[12px] font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${highlighted ? "bg-anchor text-anchor-foreground hover:bg-anchor/90" : ""}`}
          variant={highlighted ? "default" : "outline"}
        >
          {cta.label}
        </Button>
      </div>
    </div>
  );
}

