import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { checkIsAdmin } from "@/lib/admin.functions";
import {
  adminListProducts,
  adminUpsertProduct,
  adminDeleteProduct,
  adminGetUploadUrl,
  adminGetCoverUrl,
} from "@/lib/store.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin_/products")({
  head: () => ({ meta: [{ title: "Admin · Products" }] }),
  component: AdminProductsPage,
});

type Editing = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  cover_url: string | null;
  file_path: string | null;
  active: boolean;
  sort_order: number;
};

const empty: Editing = {
  slug: "",
  title: "",
  description: "",
  price_cents: 0,
  currency: "usd",
  cover_url: null,
  file_path: null,
  active: true,
  sort_order: 0,
};

function AdminProductsPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(checkIsAdmin);
  const adminQ = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });
  useEffect(() => {
    if (adminQ.data && !adminQ.data.isAdmin) navigate({ to: "/app" });
  }, [adminQ.data, navigate]);

  const list = useServerFn(adminListProducts);
  const upsert = useServerFn(adminUpsertProduct);
  const del = useServerFn(adminDeleteProduct);
  const getUploadUrl = useServerFn(adminGetUploadUrl);
  const getCoverUrl = useServerFn(adminGetCoverUrl);
  const qc = useQueryClient();
  const productsQ = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => list(),
    enabled: !!adminQ.data?.isAdmin,
  });

  const [editing, setEditing] = useState<Editing | null>(null);
  const [uploading, setUploading] = useState<"file" | "cover" | null>(null);

  const upload = async (kind: "file" | "cover", file: File) => {
    setUploading(kind);
    try {
      const { path, token } = await getUploadUrl({ data: { fileName: file.name, kind } });
      const { error } = await supabase.storage.from("digital-products").uploadToSignedUrl(path, token, file);
      if (error) throw error;
      if (kind === "file") {
        setEditing((s) => s && { ...s, file_path: path });
        toast.success("File uploaded");
      } else {
        const { url } = await getCoverUrl({ data: { path } });
        setEditing((s) => s && { ...s, cover_url: url });
        toast.success("Cover uploaded");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.title) {
      toast.error("Slug and title are required");
      return;
    }
    try {
      await upsert({
        data: {
          ...editing,
          description: editing.description || null,
        },
      });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    }
  };

  if (adminQ.isLoading) return <AppShell><div className="p-8 text-muted-foreground">Checking access…</div></AppShell>;
  if (adminQ.data && !adminQ.data.isAdmin) return <AppShell><div className="p-8">Not authorised.</div></AppShell>;

  const products = productsQ.data?.products ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your digital store catalog.</p>
          </div>
          <Button onClick={() => setEditing({ ...empty })}><Plus className="mr-1 h-4 w-4" /> New product</Button>
        </div>

        <div className="mt-6 space-y-2">
          {products.length === 0 && <p className="text-muted-foreground">No products yet.</p>}
          {products.map((p: any) => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
              <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                {p.cover_url && <img src={p.cover_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{p.title}</div>
                <div className="text-xs text-muted-foreground">
                  /{p.slug} · ${(p.price_cents / 100).toFixed(2)} · {p.active ? "Active" : "Hidden"}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing({
                id: p.id, slug: p.slug, title: p.title, description: p.description ?? "",
                price_cents: p.price_cents, currency: p.currency, cover_url: p.cover_url,
                file_path: p.file_path, active: p.active, sort_order: p.sort_order ?? 0,
              })}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={async () => {
                if (!confirm("Hide this product?")) return;
                await del({ data: { id: p.id } });
                qc.invalidateQueries({ queryKey: ["admin-products"] });
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setEditing(null)}>
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold">{editing.id ? "Edit product" : "New product"}</h2>
              <div className="mt-4 grid gap-3">
                <div>
                  <Label>Title</Label>
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.replace(/[^a-z0-9-]/g, "-").toLowerCase() })} placeholder="creator-guide" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Price (USD)</Label>
                    <Input type="number" min="0" step="0.01" value={(editing.price_cents / 100).toString()}
                      onChange={(e) => setEditing({ ...editing, price_cents: Math.round(parseFloat(e.target.value || "0") * 100) })} />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value.toLowerCase() })} />
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <Label>Cover image</Label>
                  {editing.cover_url && <img src={editing.cover_url} alt="" className="mt-2 h-28 w-full rounded object-cover" />}
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs">
                    <Upload className="h-3.5 w-3.5" /> {uploading === "cover" ? "Uploading…" : "Upload cover"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload("cover", e.target.files[0])} />
                  </label>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <Label>Digital file (PDF, ZIP, etc.)</Label>
                  {editing.file_path && <div className="mt-1 truncate text-xs text-muted-foreground">{editing.file_path}</div>}
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs">
                    <Upload className="h-3.5 w-3.5" /> {uploading === "file" ? "Uploading…" : "Upload file"}
                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload("file", e.target.files[0])} />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Label>Active (visible in store)</Label>
                  <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}