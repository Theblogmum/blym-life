import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMyPurchases, getDownloadUrl } from "@/lib/store.functions";
import { Button } from "@/components/ui/button";
import { Download, BookHeart } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "My Library · Blym" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const fetcher = useServerFn(getMyPurchases);
  const sign = useServerFn(getDownloadUrl);
  const q = useQuery({ queryKey: ["my-purchases"], queryFn: () => fetcher() });
  const [busy, setBusy] = useState<string | null>(null);

  const download = async (id: string) => {
    setBusy(id);
    try {
      const { url } = await sign({ data: { purchaseId: id } });
      window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Download failed");
    } finally {
      setBusy(null);
    }
  };

  const purchases = q.data?.purchases ?? [];

  return (
    <div>
      <PageHero
        icon={BookHeart}
        eyebrow="Your library"
        title="Everything you've collected."
        description="Guides, templates and unlockables — yours forever, ready to download whenever you need them."
        variant="butter"
      />
      <section className="page-shell">
        <div className="space-y-3">
          {q.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : purchases.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              tone="butter"
              title="your shelf is waiting ✨"
              description="purchases and unlockables land here — yours to access forever."
            />
          ) : (
            purchases.map((p: any) => (
              <div key={p.id} className="soft-card soft-card-hover flex items-center gap-4 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/40">
                  {p.product?.cover_url && <img src={p.product.cover_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold tracking-[-0.005em]">{p.product?.title ?? "Product"}</div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    Purchased {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Button size="sm" className="rounded-full" onClick={() => download(p.id)} disabled={busy === p.id || !p.product?.file_path}>
                  <Download className="mr-1 h-3.5 w-3.5" />
                  {p.product?.file_path ? (busy === p.id ? "…" : "Download") : "Pending"}
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}