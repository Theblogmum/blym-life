import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getVaultData, deleteSavedItem } from "@/lib/vault.functions";
import { getDownloadUrl } from "@/lib/store.functions";
import { REWARDS } from "@/lib/rewards-content";
import { PageHero } from "@/components/page-hero";
import { EmptyState } from "@/components/empty-state";
import { Sparkles, Copy, Download, Trash2, BookHeart, Gift, Search, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({ meta: [{ title: "My Vault · Blym" }] }),
  component: VaultPage,
});

type Pin = {
  id: string;
  kind: "purchase" | "hook" | "caption" | "pitch" | "lesson" | "theme" | "script" | "audio" | "saved";
  title: string;
  body?: string;
  source: string;
  glow: string;
  emoji: string;
  cover?: string;
  purchaseId?: string;
  savedId?: string;
  hasFile?: boolean;
};

const KIND_LABELS: Record<string, string> = {
  hook: "Hooks",
  caption: "Captions",
  pitch: "Pitches",
  lesson: "Lessons",
  theme: "Themes",
  script: "Scripts",
  audio: "Audios",
  saved: "Saved",
  purchase: "Purchased",
};

const KIND_GLOW: Record<string, string> = {
  hook: "oklch(0.74 0.2 25)",
  caption: "oklch(0.82 0.16 80)",
  pitch: "oklch(0.7 0.18 320)",
  lesson: "oklch(0.78 0.14 200)",
  theme: "oklch(0.78 0.16 280)",
  script: "oklch(0.78 0.16 150)",
  audio: "oklch(0.76 0.18 340)",
  saved: "oklch(0.78 0.12 60)",
  purchase: "oklch(0.78 0.18 350)",
};

const KIND_EMOJI: Record<string, string> = {
  hook: "🪝",
  caption: "💌",
  pitch: "💼",
  lesson: "📖",
  theme: "🌸",
  script: "🎬",
  audio: "🎵",
  saved: "🤍",
  purchase: "🛍️",
};

// map saved_content.kind text to a pin kind bucket
function bucketSavedKind(k: string): Pin["kind"] {
  const s = (k || "").toLowerCase();
  if (s.includes("hook")) return "hook";
  if (s.includes("caption")) return "caption";
  if (s.includes("pitch")) return "pitch";
  if (s.includes("script")) return "script";
  if (s.includes("audio") || s.includes("sound")) return "audio";
  if (s.includes("lesson")) return "lesson";
  if (s.includes("theme")) return "theme";
  return "saved";
}

// map a reward to its pin kind
function bucketRewardKind(rewardId: string, rewardKind: string): Pin["kind"] {
  if (rewardKind === "theme") return "theme";
  if (rewardKind === "lessons") return "lesson";
  if (rewardId === "caption") return "caption";
  if (rewardId === "pitch") return "pitch";
  return "hook";
}

function VaultPage() {
  const qc = useQueryClient();
  const fetchVault = useServerFn(getVaultData);
  const signDownload = useServerFn(getDownloadUrl);
  const deleteSaved = useServerFn(deleteSavedItem);

  const { data, isLoading } = useQuery({ queryKey: ["vault"], queryFn: () => fetchVault() });
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteSaved({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vault"] });
      toast.success("removed from vault");
    },
  });

  const pins: Pin[] = useMemo(() => {
    if (!data) return [];
    const out: Pin[] = [];
    const claimedSet = new Set((data.claimed ?? []).map((c: any) => c.chest_id));

    for (const p of data.purchases ?? []) {
      const prod = (p as any).product;
      if (!prod) continue;
      out.push({
        id: `purchase-${p.id}`,
        kind: "purchase",
        title: prod.title ?? "Product",
        body: `Purchased ${new Date(p.created_at).toLocaleDateString()}`,
        source: "from the store",
        glow: KIND_GLOW.purchase,
        emoji: KIND_EMOJI.purchase,
        cover: prod.cover_url ?? undefined,
        purchaseId: p.id,
        hasFile: !!prod.file_path,
      });
    }

    for (const r of REWARDS) {
      if (!claimedSet.has(r.id)) continue;
      const pinKind = bucketRewardKind(r.id, r.kind);
      for (const item of r.items) {
        out.push({
          id: `reward-${r.id}-${item.title}`,
          kind: pinKind,
          title: item.title,
          body: item.body,
          source: `${r.emoji} ${r.title}`,
          glow: r.glow,
          emoji: KIND_EMOJI[pinKind] ?? r.emoji,
        });
      }
    }

    for (const s of data.saved ?? []) {
      const pinKind = bucketSavedKind(s.kind);
      out.push({
        id: `saved-${s.id}`,
        kind: pinKind,
        title: s.title ?? KIND_LABELS[pinKind] ?? "Saved",
        body: s.body,
        source: "you saved this",
        glow: KIND_GLOW[pinKind],
        emoji: KIND_EMOJI[pinKind] ?? "🤍",
        savedId: s.id,
      });
    }

    return out;
  }, [data]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: pins.length };
    for (const p of pins) c[p.kind] = (c[p.kind] ?? 0) + 1;
    return c;
  }, [pins]);

  const filterTabs = useMemo(() => {
    const tabs = [{ id: "all", label: "Everything", emoji: "✨" }];
    const order = ["purchase", "hook", "caption", "pitch", "script", "audio", "lesson", "theme", "saved"];
    for (const k of order) {
      if (counts[k]) tabs.push({ id: k, label: KIND_LABELS[k], emoji: KIND_EMOJI[k] });
    }
    return tabs;
  }, [counts]);

  const visiblePins = useMemo(() => {
    let list = pins;
    if (filter !== "all") list = list.filter((p) => p.kind === filter);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          (p.body ?? "").toLowerCase().includes(needle),
      );
    }
    return list;
  }, [pins, filter, q]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied 🤍`);
    } catch {
      toast.error("couldn't copy");
    }
  };

  const download = async (id: string) => {
    setBusy(id);
    try {
      const { url } = await signDownload({ data: { purchaseId: id } });
      window.open(url, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "download failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHero
        icon={BookHeart}
        eyebrow="Content Vault™"
        title="everything you've saved, in one place ✨"
        description="purchases, rewards, hooks, captions, scripts — all your magic in one beautiful place. yours forever."
        variant="sunrise"
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip-soft">🛍️ {counts.purchase ?? 0} purchased</span>
          <span className="chip-soft">🎁 {(data?.claimed ?? []).length} rewards</span>
          <span className="chip-soft">🤍 {(data?.saved ?? []).length} saved</span>
        </div>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-6 sm:py-8">
        {/* search + filter */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="search your vault…"
              className="w-full rounded-full bg-white/80 px-11 py-3 text-[14px] ring-1 ring-foreground/10 backdrop-blur-sm transition-all placeholder:text-foreground/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-foreground/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {filterTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-all",
                  filter === t.id
                    ? "bg-foreground text-background shadow-[0_8px_22px_-10px_oklch(0.13_0.012_20/0.4)]"
                    : "bg-white/70 text-foreground/70 ring-1 ring-foreground/10 hover:bg-white hover:-translate-y-0.5",
                )}
              >
                <span className="mr-1">{t.emoji}</span>
                {t.label}
                <span className="ml-1.5 text-[10.5px] opacity-60">{counts[t.id] ?? counts.all}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-foreground/50">loading your vault…</p>
        ) : pins.length === 0 ? (
          <EmptyState
            icon={BookHeart}
            tone="butter"
            title="your vault is waiting ✨"
            description="purchases, claimed rewards and saved snippets all land here — a beautiful pinboard of everything that's yours."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/rewards" className="rounded-full bg-white px-5 py-2 text-sm font-semibold ring-1 ring-foreground/10 hover:-translate-y-0.5">
                  unlock rewards
                </Link>
              </div>
            }
          />
        ) : visiblePins.length === 0 ? (
          <p className="py-12 text-center text-sm text-foreground/50">nothing in this category yet ✨</p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {visiblePins.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                onCopy={() => pin.body && copy(pin.body, pin.title)}
                onDownload={() => pin.purchaseId && download(pin.purchaseId)}
                onDelete={() => pin.savedId && deleteMut.mutate(pin.savedId)}
                busy={busy === pin.purchaseId}
              />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-[11.5px] text-foreground/45">
          <Sparkles className="mr-1 inline h-3 w-3" />
          everything here stays yours forever — pin it, copy it, use it anytime.
        </p>
      </section>
    </div>
  );
}

function PinCard({
  pin,
  onCopy,
  onDownload,
  onDelete,
  busy,
}: {
  pin: Pin;
  onCopy: () => void;
  onDownload: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-[1.5rem] bg-white/85 ring-1 ring-white/60 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-20px_var(--pin-glow)]"
      style={{ ["--pin-glow" as any]: pin.glow, boxShadow: `inset 0 1px 0 oklch(1 0 0 / 0.7), 0 1px 2px oklch(0.13 0.012 20 / 0.04), 0 14px 30px -18px ${pin.glow}` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 h-28 w-28 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: pin.glow }}
      />

      {pin.cover && (
        <div className="relative aspect-[4/3] overflow-hidden bg-foreground/[0.04]">
          <img src={pin.cover} alt={pin.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
      )}

      <div className="relative p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: pin.glow }}
          >
            {pin.emoji} {KIND_LABELS[pin.kind] ?? pin.kind}
          </span>
        </div>

        <h3 className="font-display text-[15.5px] font-bold leading-snug tracking-[-0.012em]">
          {pin.title}
        </h3>

        {pin.body && (
          <pre className="mt-2 max-h-48 overflow-hidden whitespace-pre-wrap break-words font-sans text-[12.5px] leading-relaxed text-foreground/70">
            {pin.body}
          </pre>
        )}

        <p className="mt-3 text-[10.5px] uppercase tracking-[0.14em] text-foreground/40">
          {pin.source}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {pin.kind === "purchase" ? (
            <button
              onClick={onDownload}
              disabled={!pin.hasFile || busy}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-[11.5px] font-semibold text-background transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Download className="h-3 w-3" /> {pin.hasFile ? (busy ? "…" : "download") : "pending"}
            </button>
          ) : (
            pin.body && (
              <button
                onClick={onCopy}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-[11.5px] font-semibold text-background transition-all hover:-translate-y-0.5"
              >
                <Copy className="h-3 w-3" /> copy
              </button>
            )
          )}
          {pin.savedId && (
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center rounded-full bg-foreground/[0.06] px-2.5 py-2 text-foreground/60 transition-all hover:bg-foreground/10 hover:text-foreground"
              aria-label="remove"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
