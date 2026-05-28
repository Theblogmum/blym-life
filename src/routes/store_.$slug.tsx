import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProductBySlug, createProductCheckout } from "@/lib/store.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Download, Mail, Shield, Zap, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { isNativeIOS } from "@/lib/platform";

export const Route = createFileRoute("/store_/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Buy · ${params.slug.replace(/-/g, " ")} · Blym Store` },
      { name: "description", content: "Instant download digital product from Blym. Secure checkout, lifetime access in your library." },
      { property: "og:url", content: `https://www.blym.life/store/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `https://www.blym.life/store/${params.slug}` }],
  }),
  component: ProductPage,
});

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fetcher = useServerFn(getProductBySlug);
  const checkout = useServerFn(createProductCheckout);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const iosBlocked = isNativeIOS();

  const q = useQuery({ queryKey: ["product", slug], queryFn: () => fetcher({ data: { slug } }) });
  const p = q.data?.product as any;

  const buy = async () => {
    if (!p) return;
    if (!user && !email.trim()) {
      toast.error("Enter your email to receive your download");
      return;
    }
    setLoading(true);
    try {
      const { url } = await checkout({
        data: {
          productId: p.id,
          successUrl: `${window.location.origin}/store/success?slug=${p.slug}`,
          cancelUrl: window.location.href,
          email: email.trim() || undefined,
        },
      });
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e?.message ?? "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (q.isLoading) return <main className="p-12 text-muted-foreground">Loading…</main>;
  if (!p) {
    return (
      <main className="p-12">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/store" className="mt-4 inline-block text-sm underline">Back to store</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Store
          </Link>
          <Link to="/" className="font-display text-base font-semibold tracking-tight">Blym</Link>
          <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground transition">My library →</Link>
        </div>
      </header>

      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
          style={{
            background:
              "radial-gradient(60% 80% at 20% 0%, var(--surface-blush) 0%, transparent 60%), radial-gradient(50% 70% at 90% 0%, var(--surface-butter) 0%, transparent 65%)",
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.1fr_1fr] md:py-16">
          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/15 blur-2xl" />
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
              {p.cover_url ? (
                <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground/40">No image</div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:pt-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/70 ring-1 ring-border backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> Digital product
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
              {p.title}
            </h1>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold text-foreground">{fmt(p.price_cents, p.currency)}</span>
              <span className="text-xs text-muted-foreground">one-time · lifetime access</span>
            </div>

            {p.description && (
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            )}

            <div className="mt-7 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">What's included</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-primary" /> Instant access after payment</li>
                <li className="flex items-center gap-2.5"><Download className="h-4 w-4 text-primary" /> Secure, time-limited download link</li>
                <li className="flex items-center gap-2.5"><Shield className="h-4 w-4 text-primary" /> Lifetime access in your Blym library</li>
                <li className="flex items-center gap-2.5"><Zap className="h-4 w-4 text-primary" /> Free updates as the product evolves</li>
              </ul>
            </div>

            {!user && (
              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Email for delivery
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Or <button onClick={() => navigate({ to: "/login" })} className="underline underline-offset-2">log in</button> to save it to your library.
                </p>
              </div>
            )}

            {iosBlocked ? (
              <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4 text-center">
                <p className="text-sm font-medium">Not available in this app</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  This product isn't available for purchase in the iOS app.
                </p>
              </div>
            ) : (
              <>
                <Button
                  onClick={buy}
                  disabled={loading}
                  size="lg"
                  className="mt-6 h-12 w-full rounded-full bg-foreground text-background shadow-lg shadow-foreground/10 hover:bg-primary/85"
                >
                  {loading ? "Opening checkout…" : `Buy now · ${fmt(p.price_cents, p.currency)}`}
                </Button>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Secure checkout powered by Stripe · Cards, Apple Pay & Google Pay
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}