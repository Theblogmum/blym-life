// 🎉 BLYM dopamine engine — confetti + Web Audio chime + haptics
// SSR-safe (everything guards on `typeof window`).

type Intensity = "tiny" | "normal" | "big" | "level-up";

let audioCtx: AudioContext | null = null;
function getAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctx = (window.AudioContext ?? (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (Ctx) audioCtx = new Ctx();
    } catch { /* ignore */ }
  }
  return audioCtx;
}

// Soft, friendly chime built from sine tones — no asset download needed.
function chime(notes: number[], duration = 0.18, gain = 0.07) {
  const ctx = getAudio();
  if (!ctx || prefersReducedMotion() || isMuted()) return;
  const now = ctx.currentTime;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, now + i * 0.08);
    g.gain.linearRampToValueAtTime(gain, now + i * 0.08 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + duration + 0.05);
  });
}

function haptic(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (prefersReducedMotion()) return;
  try { navigator.vibrate(pattern); } catch { /* ignore */ }
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function isMuted() {
  if (typeof window === "undefined") return true;
  try { return localStorage.getItem("blym.sound") === "off"; } catch { return false; }
}

export function setMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("blym.sound", muted ? "off" : "on"); } catch { /* ignore */ }
}

export function getMuted() {
  return isMuted();
}

// BLYM palette
const BLYM_COLORS = ["#FFB199", "#FF7A87", "#FFD27D", "#F9A8D4", "#A78BFA", "#FDE68A"];

async function fireConfetti(intensity: Intensity) {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  const { default: confetti } = await import("canvas-confetti");
  const cfg = {
    tiny:     { particleCount: 14, spread: 50,  startVelocity: 22, scalar: 0.7 },
    normal:   { particleCount: 60, spread: 70,  startVelocity: 35, scalar: 0.9 },
    big:      { particleCount: 140, spread: 90, startVelocity: 45, scalar: 1.05 },
    "level-up": { particleCount: 220, spread: 110, startVelocity: 55, scalar: 1.15 },
  }[intensity];

  confetti({
    ...cfg,
    origin: { x: 0.5, y: 0.55 },
    colors: BLYM_COLORS,
    ticks: 220,
    gravity: 0.95,
    decay: 0.92,
    zIndex: 9999,
  });

  if (intensity === "big" || intensity === "level-up") {
    // double-burst from sides
    setTimeout(() => confetti({ ...cfg, particleCount: Math.round(cfg.particleCount * 0.6), origin: { x: 0.15, y: 0.7 }, colors: BLYM_COLORS, angle: 60, zIndex: 9999 }), 120);
    setTimeout(() => confetti({ ...cfg, particleCount: Math.round(cfg.particleCount * 0.6), origin: { x: 0.85, y: 0.7 }, colors: BLYM_COLORS, angle: 120, zIndex: 9999 }), 220);
  }
}

/** Main API. */
export function celebrate(intensity: Intensity = "normal") {
  void fireConfetti(intensity);
  switch (intensity) {
    case "tiny":
      chime([880], 0.12, 0.05);
      haptic(8);
      break;
    case "normal":
      chime([784, 1046], 0.18);
      haptic([10, 30, 10]);
      break;
    case "big":
      chime([659, 880, 1318], 0.22, 0.08);
      haptic([20, 40, 20, 40, 60]);
      break;
    case "level-up":
      chime([523, 659, 784, 1046, 1318], 0.25, 0.09);
      haptic([30, 50, 30, 50, 30, 80, 120]);
      break;
  }
}

/** Just sound + haptic, no confetti — for tiny toggles. */
export function pop() {
  chime([1046], 0.08, 0.04);
  haptic(6);
}
