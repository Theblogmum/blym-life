import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getVaultData, deleteSavedItem } from "@/lib/vault.functions";
import { getDownloadUrl } from "@/lib/store.functions";
import { REWARDS } from "@/lib/rewards-content";
import { EmptyState } from "@/components/empty-state";
import {
  Sparkles, Copy, Download, Trash2, BookHeart, Search, X, Heart,
  ChevronLeft, ChevronRight,
} from "lucide-react";
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
  createdAt?: string;
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

const FAV_KEY = "vault:favourites";

function useFavourites() {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  const toggle = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(FAV_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };
  return { favs, toggle };
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
  const { favs, toggle: toggleFav } = useFavourites();
  const railRef = useRef<HTMLDivElement>(null);

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
        createdAt: p.created_at,
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
        createdAt: s.created_at,
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
    if (favs.size) tabs.push({ id: "favourites", label: "Favourites", emoji: "❤️" });
    const order = ["hook", "caption", "pitch", "script", "audio", "lesson", "theme", "saved"];
    for (const k of order) {
      if (counts[k]) tabs.push({ id: k, label: KIND_LABELS[k], emoji: KIND_EMOJI[k] });
    }
    return tabs;
  }, [counts, favs.size]);

  const visiblePins = useMemo(() => {
    let list = pins;
    if (filter === "favourites") list = list.filter((p) => favs.has(p.id));
    else if (filter !== "all") list = list.filter((p) => p.kind === filter);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          (p.body ?? "").toLowerCase().includes(needle),
      );
    }
    return list;
  }, [pins, filter, q, favs]);

  const recentPins = useMemo(
    () => [...pins]
      .filter((p) => p.createdAt)
      .sort((a, b) => (b.createdAt! > a.createdAt! ? 1 : -1))
      .slice(0, 12),
    [pins],
  );

  const STAT_KINDS: Array<{ id: Pin["kind"]; label: string; emoji: string }> = [
    { id: "hook",    label: "Hooks",    emoji: "🪝" },
    { id: "caption", label: "Captions", emoji: "💌" },
    { id: "script",  label: "Scripts",  emoji: "🎬" },
    { id: "saved",   label: "Ideas",    emoji: "💡" },
    { id: "pitch",   label: "Pitches",  emoji: "💼" },
  ];

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

  const scrollRail = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <div>
      {/* Compact creator dashboard header */}
      <section className="relative border-b border-border/30 bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(50% 70% at 0% 0%, color-mix(in oklab, var(--surface-blush) 38%, transparent), transparent 60%), radial-gradient(40% 60% at 100% 0%, color-mix(in oklab, var(--surface-mint) 28%, transparent), transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-6 pb-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/80 ring-1 ring-white/60 shadow-[var(--shadow-soft)] backdrop-blur-sm">
                <BookHeart className="h-4.5 w-4.5 text-foreground/80" />
              </div>
              <div>
                <h1 className="font-display text-[22px] font-bold leading-none tracking-[-0.02em] sm:text-[26px]">
                  My Creative Vault™
                </h1>
                <p className="mt-1 text-[12px] text-foreground/55">
                  {pins.length} pieces of magic, all yours forever
                </p>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {STAT_KINDS.map((s) => {
              const count = counts[s.id] ?? 0;
              const active = filter === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setFilter(active ? "all" : s.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl bg-white/75 px-3.5 py-3 text-left ring-1 ring-white/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_40px_-22px_var(--stat-glow)]",
                    active && "ring-2 ring-foreground/70 bg-white",
                  )}
                  style={{ ["--stat-glow" as any]: KIND_GLOW[s.id] }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                    style={{ background: KIND_GLOW[s.id] }}
                  />
                  <div className="relative flex items-baseline justify-between">
                    <span className="text-[20px]">{s.emoji}</span>
                    <span className="font-display text-[22px] font-bold tracking-tight tabular-nums">{count}</span>
                  </div>
                  <div className="relative mt-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
                    {s.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-6 sm:py-7">
        {/* Recently saved rail */}
        {recentPins.length > 0 && (
          <div className="mb-7">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="font-display text-[17px] font-bold tracking-[-0.012em]">Recently saved</h2>
                <p className="text-[11.5px] text-foreground/50">your latest sparks of inspiration</p>
              </div>
              <div className="hidden gap-1 sm:flex">
                <button onClick={() => scrollRail(-1)} className="grid h-8 w-8 place-items-center rounded-full bg-white/80 ring-1 ring-foreground/10 transition hover:bg-white hover:-translate-y-0.5" aria-label="scroll left">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => scrollRail(1)} className="grid h-8 w-8 place-items-center rounded-full bg-white/80 ring-1 ring-foreground/10 transition hover:bg-white hover:-translate-y-0.5" aria-label="scroll right">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div
              ref={railRef}
              className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {recentPins.map((pin) => (
                <button
                  key={`rail-${pin.id}`}
                  onClick={() => copy(pin.body ?? pin.title, pin.title)}
                  className="group relative w-[240px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white/85 p-3.5 text-left ring-1 ring-white/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-22px_var(--pin-glow)]"
                  style={{ ["--pin-glow" as any]: pin.glow }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-8 right-0 h-20 w-20 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                    style={{ background: pin.glow }}
                  />
                  <div className="relative flex items-center gap-2">
                    <span className="text-[15px]">{pin.emoji}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
                      {KIND_LABELS[pin.kind] ?? pin.kind}
                    </span>
                    <span className="ml-auto text-[10px] text-foreground/40">{formatDate(pin.createdAt)}</span>
                  </div>
                  <h3 className="relative mt-2 line-clamp-2 font-display text-[13.5px] font-bold leading-snug tracking-[-0.01em]">
                    {pin.title}
                  </h3>
                  {pin.body && (
                    <p className="relative mt-1.5 line-clamp-2 text-[11.5px] leading-snug text-foreground/55">{pin.body}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* search + filter */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your captions, hooks, scripts and ideas…"
              className="w-full rounded-2xl bg-white/80 px-11 py-3.5 text-[14px] ring-1 ring-foreground/10 backdrop-blur-sm transition-all placeholder:text-foreground/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-foreground/25"
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
                <span className="ml-1.5 text-[10.5px] opacity-60">
                  {t.id === "favourites" ? favs.size : counts[t.id] ?? counts.all}
                </span>
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
                isFav={favs.has(pin.id)}
                onToggleFav={() => toggleFav(pin.id)}
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
  isFav,
  onToggleFav,
  busy,
}: {
  pin: Pin;
  onCopy: () => void;
  onDownload: () => void;
  onDelete: () => void;
  isFav: boolean;
  onToggleFav: () => void;
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
          <button
            onClick={onToggleFav}
            aria-label={isFav ? "unfavourite" : "favourite"}
            className={cn(
              "ml-auto grid h-7 w-7 place-items-center rounded-full transition-all hover:-translate-y-0.5",
              isFav ? "bg-foreground text-background" : "bg-white/80 text-foreground/40 ring-1 ring-foreground/10 hover:text-foreground",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
          </button>
        </div>

        <h3 className="font-display text-[18px] font-bold leading-[1.2] tracking-[-0.015em]">
          {pin.title}
        </h3>

        {pin.body && (
          <pre className="mt-2 max-h-36 overflow-hidden whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed text-foreground/60">
            {pin.body}
          </pre>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 text-[10.5px] uppercase tracking-[0.14em] text-foreground/40">
          <span className="truncate">{pin.source}</span>
          {pin.createdAt && <span className="shrink-0 normal-case tracking-normal text-foreground/45">· {formatDate(pin.createdAt)}</span>}
        </div>

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
