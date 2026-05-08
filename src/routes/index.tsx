import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Camera, Calendar, TrendingUp, HeartHandshake,
  Check, Clock, Wand2, Send,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Blog Mum Studio — Tell me what to film today" },
      { name: "description", content: "The daily content brief for mum creators. One ready-to-shoot idea every morning: hook, caption, shot list and best time to post. Free to start." },
      { property: "og:title", content: "The Blog Mum Studio — Tell me what to film today" },
      { property: "og:description", content: "Personalised daily filming briefs for mum creators on TikTok and Instagram. Free to start." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [user, loading, navigate]);

  const ctaPrimary = user ? { to: "/app" as const, label: "Open the studio" } : { to: "/signup" as const, label: "Get my first brief — free" };
  const ctaSecondary = user ? null : { to: "/login" as const, label: "I have an account" };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          <span className="font-display font-black">the blog mum</span>{" "}
          <span className="text-muted-foreground">studio</span>
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

      <section className="mx-auto max-w-4xl px-6 pt-10 pb-20 text-center sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5" /> For mum content creators
        </span>
        <h1 className="mt-6 font-display text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
          Tell me what to{" "}
          <span className="bg-[image:var(--gradient-warm)] bg-clip-text text-transparent">film today.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Every morning, get one ready-to-shoot brief: the clip idea, the hook, the caption,
          the shot list, and the time to post. No more staring at your phone wondering.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={ctaPrimary.to}><Button size="lg" className="rounded-full px-8">{ctaPrimary.label}</Button></Link>
          {ctaSecondary && (
            <Link to={ctaSecondary.to}><Button size="lg" variant="outline" className="rounded-full">{ctaSecondary.label}</Button></Link>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">3 daily briefs free · £19/month for unlimited</p>
      </section>

      <section id="how" className="border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">From overwhelmed to filmed in 3 steps.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: HeartHandshake, t: "1. Tell us your vibe", b: "2-minute setup: niche, kids' ages, what you want to be known for." },
              { icon: Wand2, t: "2. Get today's brief", b: "Each morning we hand you ONE concrete idea built for your real life." },
              { icon: Send, t: "3. Film it & post", b: "Hook, caption, shot list, best post time — all done. You just press record." },
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

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Inside the studio</p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">Everything you need. Nothing you don't.</h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Camera, title: "Tell Me What To Film", body: "A full daily brief, personalised to your niche, kids and life — not generic 'content ideas'." },
          { icon: Sparkles, title: "Viral Content Lab", body: "Paste any trend. Get the hook breakdown and how to remix it for YOUR audience." },
          { icon: Calendar, title: "Weekly Planner", body: "Your whole week mapped out. Drag, drop, done." },
          { icon: TrendingUp, title: "Growth Insights", body: "We learn what works for you and double down on it." },
          { icon: HeartHandshake, title: "UGC Creator Hub", body: "Pricing, pitches and scripts that get brands to actually pay you." },
          { icon: Sparkles, title: "Built for real life", body: "Designed to feel calm, not overwhelming. Because you already are." },
        ].map((f) => (
          <div key={f.title} className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-border bg-secondary/40 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">Free to start. Upgrade when you're ready.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <PriceCard
              name="Free"
              price="£0"
              tagline="Find your rhythm."
              features={["3 daily briefs / day", "Caption + hook generator", "Read-only weekly planner"]}
              cta={{ to: user ? "/app" : "/signup", label: user ? "Open studio" : "Start free" }}
            />
            <PriceCard
              highlighted
              name="Premium"
              price="£19"
              priceSuffix="/mo"
              tagline="Grow on autopilot."
              features={["Unlimited daily briefs", "Viral Content Lab", "Clip Recycler", "Growth Insights", "UGC pitches & pricing"]}
              cta={{ to: user ? "/settings" : "/signup", label: user ? "Upgrade" : "Try free, then upgrade" }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">FAQ</p>
        <h2 className="mt-2 text-center font-display text-3xl font-black">Things mums ask us</h2>
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

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="rounded-3xl bg-[image:var(--gradient-warm)] p-[2px] shadow-[var(--shadow-soft)]">
          <div className="rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card p-10 text-center">
            <Clock className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-3xl font-black">Tomorrow morning, your brief is ready.</h2>
            <p className="mt-2 text-muted-foreground">Stop scrolling for ideas. Start filming the right one.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to={ctaPrimary.to}><Button size="lg" className="rounded-full px-8">{ctaPrimary.label}</Button></Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.to}><Button size="lg" variant="ghost" className="rounded-full">Sign in</Button></Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Made with care for mum creators · @theblogmumstudio
      </footer>
    </div>
  );
}

function PriceCard({
  name, price, priceSuffix, tagline, features, cta, highlighted,
}: {
  name: string; price: string; priceSuffix?: string; tagline: string;
  features: string[]; cta: { to: string; label: string }; highlighted?: boolean;
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
        <Link to={cta.to as any} className="mt-5 block">
          <Button className="w-full rounded-full" variant={highlighted ? "default" : "outline"}>{cta.label}</Button>
        </Link>
      </div>
    </div>
  );
}
