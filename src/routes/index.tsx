import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Camera, Calendar, TrendingUp, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          <span className="font-display font-black">the blog mum</span>{" "}
          <span className="text-muted-foreground">studio</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to="/signup"><Button size="sm" className="rounded-full">Start free</Button></Link>
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
          <Link to="/signup"><Button size="lg" className="rounded-full px-8">Get my first brief — free</Button></Link>
          <Link to="/login"><Button size="lg" variant="outline" className="rounded-full">I have an account</Button></Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">3 daily briefs free · £19/month for unlimited</p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Made with care for mum creators · @theblogmumstudio
      </footer>
    </div>
  );
}
