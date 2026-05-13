import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getMyPurchases, getDownloadUrl } from "@/lib/store.functions";
import { Button } from "@/components/ui/button";
import { Download, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

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
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">My library</h1>
        <p className="mt-1 text-sm text-muted-foreground">All your guides and templates, ready to download.</p>

        <div className="mt-8 space-y-3">
          {q.isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : purchases.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No purchases yet.</p>
              <a href="/store" className="mt-4 inline-block text-sm font-semibold underline">Browse the store →</a>
            </div>
          ) : (
            purchases.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.product?.cover_url && <img src={p.product.cover_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.product?.title ?? "Product"}</div>
                  <div className="text-xs text-muted-foreground">
                    Purchased {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Button size="sm" onClick={() => download(p.id)} disabled={busy === p.id || !p.product?.file_path}>
                  <Download className="mr-1 h-3.5 w-3.5" />
                  {p.product?.file_path ? (busy === p.id ? "…" : "Download") : "Pending"}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}