import { useEffect } from "react";

export function EraTheme() {
  useEffect(() => {
    const apply = () => {
      const era = localStorage.getItem("blym.era") || "soft";
      document.documentElement.dataset.era = era;
    };
    apply();
    const onStorage = (e: StorageEvent) => { if (e.key === "blym.era") apply(); };
    window.addEventListener("storage", onStorage);
    // also re-apply when tab regains focus (covers same-tab updates after onboarding)
    const onFocus = () => apply();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  return null;
}

const ERA_META: Record<string, { emoji: string; label: string }> = {
  soft:  { emoji: "🫧", label: "soft girl era" },
  hot:   { emoji: "💋", label: "hot girl era" },
  mum:   { emoji: "🍼", label: "mum-of-chaos era" },
  boss:  { emoji: "👑", label: "ceo era" },
  quiet: { emoji: "🌙", label: "quiet rebuild era" },
  main:  { emoji: "✨", label: "main character era" },
};

export function EraRibbon() {
  const era = typeof document !== "undefined" ? document.documentElement.dataset.era : undefined;
  const meta = ERA_META[era ?? "soft"] ?? ERA_META.soft;
  return (
    <div
      className="sticker inline-flex items-center gap-2 px-4 py-2 text-sm font-bold"
      style={{ background: "var(--era-grad)" }}
    >
      <span className="text-lg">{meta.emoji}</span>
      <span>currently in: {meta.label}</span>
    </div>
  );
}
