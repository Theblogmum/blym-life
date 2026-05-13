import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/store.functions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";

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
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground">My library →</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <ShoppingBag className="h-3 w-3" /> Store
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Guides &amp; templates</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Hand-crafted resources to help you create faster and grow smarter. Instant access after checkout.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {q.isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            New drops coming soon. Check back shortly.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p: any) => (
              <Link
                key={p.id}
                to="/store/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-foreground/30"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground/40">
                      <ShoppingBag className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-base font-semibold">{p.title}</h2>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold">{fmt(p.price_cents, p.currency)}</span>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}