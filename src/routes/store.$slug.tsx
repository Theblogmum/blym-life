import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProductBySlug, createProductCheckout } from "@/lib/store.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Download, Mail, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/store/$slug")({
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
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Store
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
          {p.cover_url ? (
            <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-muted-foreground/40">No image</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{p.title}</h1>
          <div className="mt-3 text-2xl font-semibold">{fmt(p.price_cents, p.currency)}</div>
          {p.description && (
            <p className="mt-4 whitespace-pre-line text-muted-foreground">{p.description}</p>
          )}

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> Instant access after payment</li>
            <li className="flex items-center gap-2"><Download className="h-4 w-4 text-foreground" /> Secure download link</li>
            <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-foreground" /> Lifetime access in your library</li>
          </ul>

          {!user && (
            <div className="mt-6">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Email for delivery</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Or <button onClick={() => navigate({ to: "/login" })} className="underline">log in</button> to save it to your library.
              </p>
            </div>
          )}

          <Button onClick={buy} disabled={loading} size="lg" className="mt-6 w-full">
            {loading ? "Opening checkout…" : `Buy · ${fmt(p.price_cents, p.currency)}`}
          </Button>
        </div>
      </section>
    </main>
  );
}