import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/store.functions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Sparkles, Download, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Store · Guides & Templates by Blym" },
      {
        name: "description",
        content:
          "Shop creator guides, templates, and digital downloads from Blym. Instant delivery, secure payment, and a personal library to access your purchases anytime.",
      },
      { property: "og:title", content: "Blym Store — Creator guides & templates" },
      { property: "og:url", content: "https://www.blym.life/store" },
    ],
    links: [{ rel: "canonical", href: "https://www.blym.life/store" }],
  }),
  component: StorePage,
});

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function StorePage() {
  const fetcher = useServerFn(listProducts);
  const q = useQuery({ queryKey: ["store-products"], queryFn: () => fetcher() });
  const products = q.data?.products ?? [];

  return (
    <main className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link to="/" className="font-display text-base font-semibold tracking-tight">Blym</Link>
          <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground transition">My library →</Link>
        </div>
      </header>

      {/* Editorial hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 15% 20%, var(--surface-blush) 0%, transparent 60%), radial-gradient(50% 50% at 85% 0%, var(--surface-butter) 0%, transparent 65%), radial-gradient(60% 60% at 100% 100%, var(--surface-rose) 0%, transparent 55%)",
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1.4fr_1fr] md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 ring-1 ring-border backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> The Blym Shop
            </div>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
              Guides &amp; templates<br />
              <span className="italic text-primary">made for mum creators.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Plug-and-play playbooks, templates and trainings to help you create faster, post smarter and grow with confidence. Instant download after checkout.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Instant access</span>
              <span className="inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-primary" /> Lifetime downloads</span>
              <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Secure checkout</span>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -right-6 top-2 h-56 w-56 rotate-6 rounded-3xl bg-card shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] ring-1 ring-border" style={{ background: "var(--surface-peach)" }} />
            <div className="absolute right-20 top-20 h-56 w-44 -rotate-6 rounded-3xl bg-card shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] ring-1 ring-border" style={{ background: "var(--surface-mint)" }} />
            <div className="absolute right-40 top-8 h-48 w-40 rotate-3 rounded-3xl bg-card shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] ring-1 ring-border" style={{ background: "var(--surface-plum)" }} />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Catalog</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">All products</h2>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">{products.length} item{products.length === 1 ? "" : "s"}</p>
        </div>

        {q.isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-border bg-card">
                <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-4 font-display text-xl">New drops coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back shortly — the shelves are being stocked.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p: any, idx: number) => {
              const tints = ["var(--surface-peach)", "var(--surface-mint)", "var(--surface-butter)", "var(--surface-sky)", "var(--surface-blush)", "var(--surface-plum)"];
              const tint = tints[idx % tints.length];
              return (
                <Link
                  key={p.id}
                  to="/store/$slug"
                  params={{ slug: p.slug }}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.25)]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: tint }}>
                    {p.cover_url ? (
                      <img
                        src={p.cover_url}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-foreground/30">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
                      Digital
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">{p.title}</h3>
                    {p.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    )}
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-display text-xl font-semibold text-foreground">
                        {fmt(p.price_cents, p.currency)}
                      </span>
                      <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                        View <ArrowRightTiny />
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust strip */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Instant delivery", body: "Download links sent the moment your payment clears." },
            { icon: Download, title: "Yours forever", body: "Re-download anytime from your personal library." },
            { icon: Shield, title: "Secure checkout", body: "Encrypted payments, no account required to buy." },
          ].map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-display text-base font-semibold">{f.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ArrowRightTiny() {
  return (
    <svg viewBox="0 0 16 16" className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}