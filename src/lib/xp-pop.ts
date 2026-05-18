// Floating "+N XP" pop — light dopamine for completing micro-actions.
// SSR-safe. Pairs with celebrate() if you want confetti as well.
import { pop as soundPop } from "@/lib/celebrate";

export function xpPop(amount: number, label?: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  soundPop();

  const el = document.createElement("div");
  el.textContent = `+${amount} XP${label ? ` · ${label}` : ""}`;
  el.setAttribute("aria-live", "polite");
  el.style.cssText = [
    "position:fixed",
    "left:50%",
    "top:18%",
    "transform:translate(-50%,0)",
    "z-index:9999",
    "pointer-events:none",
    "padding:8px 14px",
    "border-radius:9999px",
    "font:700 13px/1 ui-sans-serif,system-ui",
    "letter-spacing:.02em",
    "color:#3a1f12",
    "background:linear-gradient(135deg,#FFE6C9,#FFC9D6)",
    "box-shadow:0 8px 24px -6px rgba(255,122,135,.45),0 2px 6px rgba(0,0,0,.06)",
    "opacity:0",
    reduce
      ? "transition:opacity .2s ease"
      : "animation:xp-float 1.4s cubic-bezier(.2,.7,.2,1) forwards",
  ].join(";");
  document.body.appendChild(el);
  if (reduce) {
    requestAnimationFrame(() => (el.style.opacity = "1"));
    setTimeout(() => el.remove(), 1400);
  } else {
    setTimeout(() => el.remove(), 1500);
  }
}
