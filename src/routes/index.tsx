import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Check, Clock, Wand2, Building2, Camera, Flame,
  TrendingUp, CalendarDays, Heart, Star,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { useSubscription } from "@/hooks/use-subscription";
import featBrief from "@/assets/feature-brief.jpg";
import featBrand from "@/assets/feature-brand.jpg";
import featGrow from "@/assets/feature-grow.jpg";
import logoImg from "@/assets/logo.png";

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
      { property: "og:url", content: "https://theblogmumstudio.lovable.app/" },
      { property: "og:title", content: "The Blog Mum Studio — Tell me what to film today" },
      { property: "og:description", content: "Personalised daily filming briefs for mum creators on TikTok and Instagram. Free to start." },
      { property: "og:image", content: "https://theblogmumstudio.lovable.app/og-landing.jpg" },
      { property: "og:image:secure_url", content: "https://theblogmumstudio.lovable.app/og-landing.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { property: "og:image:alt", content: "The Blog Mum Studio — Tell me what to film today" },
      { property: "og:locale", content: "en_GB" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Blog Mum Studio — Tell me what to film today" },
      { name: "twitter:description", content: "Personalised daily filming briefs for mum creators on TikTok and Instagram. Free to start." },
      { name: "twitter:image", content: "https://theblogmumstudio.lovable.app/og-landing.jpg" },
      { name: "twitter:image:alt", content: "The Blog Mum Studio — Tell me what to film today" },
    ],
    links: [
      { rel: "canonical", href: "https://theblogmumstudio.lovable.app/" },
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

  const ctaPrimary = user ? { to: "/app" as const, label: "Open the studio" } : { to: "/signup" as const, label: "Get my first brief — free" };
  const ctaSecondary = user ? null : { to: "/login" as const, label: "I have an account" };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="The Blog Mum" className="h-8 w-auto sm:h-10" width={120} height={40} />
          <span className="sr-only">The Blog Mum Studio</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/app"><Button size="sm" className="rounded-full">Open studio</Button></Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/signup"><Button size="sm" className="rounded-full">Start free</Button></Link>
            </>
          )}
        </div>
      </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-sunrise)] opacity-40" aria-hidden />
        <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-white/40 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 pb-12 sm:gap-10 sm:px-6 sm:pt-20 sm:pb-16 lg:grid-cols-2 lg:gap-12 lg:pt-28">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-widest text-foreground/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> For mum content creators
            </span>
            <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tight sm:mt-5 sm:text-6xl lg:text-7xl">
              Your tiny content team{" "}
              <span className="bg-[image:var(--gradient-warm)] bg-clip-text text-transparent">in your pocket.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-foreground/70 sm:mt-5 sm:text-lg lg:mx-0">
              Daily briefs, viral remixes, brand pitches and an outreach tracker — built for mums who film between school runs.
            </p>
            <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
              <Link to={ctaPrimary.to}>
                <Button size="lg" className="w-full rounded-full px-8 shadow-[var(--shadow-glow)] sm:w-auto">
                  {ctaPrimary.label}
                </Button>
              </Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.to}>
                  <Button size="lg" variant="outline" className="w-full rounded-full sm:w-auto">
                    {ctaSecondary.label}
                  </Button>
                </Link>
              )}
            </div>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold text-foreground/60 lg:justify-start">
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary" /> 3-day full trial</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary" /> Captions free forever</span>
              <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-primary" /> Cancel any time</span>
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-xs sm:max-w-md lg:max-w-none">
            <div className="absolute -inset-6 rounded-full bg-[image:var(--gradient-warm)] opacity-25 blur-3xl" aria-hidden />
            <div className="relative rounded-[1.5rem] bg-card p-5 shadow-[var(--shadow-glow)] ring-1 ring-primary/15 sm:rounded-[2rem] sm:p-12">
              <img
                src={logoImg}
                alt="The Blog Mum — make it happen"
                width={1024}
                height={1024}
                className="mx-auto w-full max-w-[220px] sm:max-w-sm"
              />
            </div>
            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)] ring-1 ring-primary/10 sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today's brief</p>
              <p className="mt-1 text-sm font-semibold">Mum-hack reel · 18s</p>
              <p className="text-xs text-muted-foreground">Post 7:42pm · 6.4k est. views</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>Loved by UK mum creators</span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          </span>
          <span>Built by a mum, for mums</span>
          <span>50+ UK brands ready to pitch</span>
        </div>
      </section>

      <section id="how" className="border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-4xl">From overwhelmed to filmed in 3 steps.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Heart, t: "1. Tell us your vibe", b: "2-minute setup: niche, kids' ages, what you want to be known for." },
              { icon: Wand2, t: "2. Get today's brief", b: "Each morning we hand you ONE concrete idea built for your real life." },
              { icon: Camera, t: "3. Film it & post", b: "Hook, caption, shot list, best post time — all done. You just press record." },
            ].map((s) => (
              <div key={s.t} className="rounded-3xl bg-card p-6 text-left shadow-[var(--shadow-soft)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Inside the studio</p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-4xl">Three ways we save your evening.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-foreground/70">
            One tool to plan, one to grow, one to get paid. No bloat — just the bits mum creators actually use.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <BigFeature
            img={featBrief}
            badge="Plan"
            title="Today's brief, ready by breakfast"
            body="One ready-to-film idea — hook, caption, shot list and best post time — built around your niche and kids."
            surface="surface-peach"
          />
          <BigFeature
            img={featBrand}
            badge="Get paid"
            title="Brand Hub with 50+ UK brands"
            body="Find brands that work with mums, draft warm pitches with one click, and never double-pitch by accident."
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniFeature icon={Flame} title="Viral Lab" body="Paste any trend → remix it for your niche." />
          <MiniFeature icon={Wand2} title="Template Studio" body="Posts, emails & DMs in 4 picks." />
          <MiniFeature icon={CalendarDays} title="Weekly Planner" body="7-day grid you'll actually fill." />
          <MiniFeature icon={TrendingUp} title="Recycler" body="One clip → 5 fresh angles." />
        </div>
      </section>

      <section id="pricing" className="border-t border-border bg-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-4xl">Free to start. Upgrade when you're ready.</h2>
          <PricingPlans />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">FAQ</p>
        <h2 className="mt-2 text-center font-display text-2xl font-black sm:text-3xl">Things mums ask us</h2>
        <div className="mt-8 space-y-3">
          {[
            { q: "Do I need to be on camera?", a: "Nope. Most briefs work as voiceover, hands-only or text-on-screen." },
            { q: "What platforms is it for?", a: "TikTok and Instagram Reels. Briefs are designed for short-form vertical video." },
            { q: "How long does setup take?", a: "About 2 minutes. Tell us your niche, kids' ages and goal and you're in." },
            { q: "Can I cancel anytime?", a: "Yes — one click in Settings. No awkward emails." },
          ].map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="rounded-3xl bg-[image:var(--gradient-warm)] p-[2px] shadow-[var(--shadow-soft)]">
          <div className="rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card p-6 text-center sm:p-10">
            <Clock className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-black sm:text-3xl">Tomorrow morning, your brief is ready.</h2>
            <p className="mt-2 text-muted-foreground">Stop scrolling for ideas. Start filming the right one.</p>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Link to={ctaPrimary.to}><Button size="lg" className="w-full rounded-full px-8 sm:w-auto">{ctaPrimary.label}</Button></Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.to}><Button size="lg" variant="ghost" className="w-full rounded-full sm:w-auto">Sign in</Button></Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
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
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
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

  const premiumPriceId = interval === "monthly" ? "premium_monthly" : "premium_yearly";
  const premiumPrice = interval === "monthly" ? "£19" : "£170";
  const premiumSuffix = interval === "monthly" ? "/mo" : "/yr";
  const premiumNote = interval === "yearly" ? "Save ~25% vs monthly" : "Cancel anytime";

  return (
    <>
      {isActive && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
          <Check className="h-4 w-4 text-primary" />
          {hasLifetime ? "You're a Lifetime member 💛" : "You're on Premium"}
        </div>
      )}
      {!isActive && (
      <div className="mt-6 inline-flex rounded-full border border-border bg-card p-1 text-sm">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={`rounded-full px-4 py-1.5 transition ${interval === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >Monthly</button>
        <button
          type="button"
          onClick={() => setInterval("yearly")}
          className={`rounded-full px-4 py-1.5 transition ${interval === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >Yearly · save ~25%</button>
      </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <PriceCard
          name="Free"
          price="£0"
          tagline="Captions free, forever."
          features={["Basic caption generator", "3-day full trial of everything", "No card required"]}
          cta={
            isActive
              ? { label: "Included", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: user ? "Open studio" : "Start free", onClick: () => navigate({ to: user ? "/app" : "/signup" }) }
          }
        />
        <PriceCard
          highlighted
          name="Premium"
          price={premiumPrice}
          priceSuffix={premiumSuffix}
          tagline={premiumNote}
          features={["Unlimited daily briefs", "Viral Content Lab", "Clip Recycler", "Growth Insights", "UGC pitches & pricing"]}
          cta={
            isActive
              ? { label: hasLifetime ? "Included in Lifetime" : "Current plan", onClick: () => navigate({ to: "/app" }), disabled: true }
              : { label: loading ? "Opening…" : user ? "Upgrade now" : "Start free, then upgrade", onClick: () => buy(premiumPriceId), disabled: loading }
          }
        />
        <PriceCard
          name="Lifetime"
          price="£299"
          tagline="One payment. Forever yours."
          features={["Everything in Premium", "Pay once, never again", "All future features included"]}
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
      ? "rounded-3xl bg-[image:var(--gradient-warm)] p-[2px] shadow-[var(--shadow-soft)]"
      : "rounded-3xl border border-border bg-card p-6 text-left"}>
      <div className={highlighted ? "rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card p-6 text-left" : ""}>
        <p className="text-sm font-semibold text-primary">{name}</p>
        <p className="mt-1 font-display text-4xl font-black">
          {price}<span className="text-base font-medium text-muted-foreground">{priceSuffix}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {features.map((f) => (
            <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{f}</li>
          ))}
        </ul>
        <Button onClick={cta.onClick} disabled={cta.disabled} className="mt-5 w-full rounded-full" variant={highlighted ? "default" : "outline"}>
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
    <div className={`overflow-hidden rounded-3xl border-0 ${surface} shadow-[var(--shadow-soft)]`}>
      <div className="aspect-[4/3] overflow-hidden">
        <img src={img} alt={title} loading="lazy" width={1024} height={768} className="h-full w-full object-cover" />
      </div>
      <div className="p-6">
        <span className="inline-block rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/70">
          {badge}
        </span>
        <h3 className="mt-3 font-display text-xl font-black">{title}</h3>
        <p className="mt-2 text-sm text-foreground/70">{body}</p>
      </div>
    </div>
  );
}

function MiniFeature({
  icon: Icon, title, body,
}: { icon: ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
