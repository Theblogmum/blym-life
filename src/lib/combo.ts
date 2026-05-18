// ⚡ BLYM combo system — chain actions within a window for multiplier XP.
// Pure client-side; emits events so any UI can listen.

const WINDOW_MS = 90_000; // 90s to chain
const KEY = "blym.combo";

export type ComboState = {
  count: number;     // current chain length
  multiplier: number; // 1, 1.5, 2, 2.5, 3 …
  lastAt: number;     // ms epoch
};

type Listener = (s: ComboState) => void;
const listeners = new Set<Listener>();

function load(): ComboState {
  if (typeof window === "undefined") return { count: 0, multiplier: 1, lastAt: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { count: 0, multiplier: 1, lastAt: 0 };
    const s = JSON.parse(raw) as ComboState;
    if (Date.now() - s.lastAt > WINDOW_MS) return { count: 0, multiplier: 1, lastAt: 0 };
    return s;
  } catch {
    return { count: 0, multiplier: 1, lastAt: 0 };
  }
}

function save(s: ComboState) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

function multiplierFor(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 1.5;
  if (count === 3) return 2;
  if (count === 4) return 2.5;
  return 3; // cap
}

/** Register a "hit". Returns the new combo state + bonus XP for a given base. */
export function registerComboHit(baseXp = 0): ComboState & { bonusXp: number } {
  const prev = load();
  const now = Date.now();
  const inWindow = now - prev.lastAt < WINDOW_MS;
  const count = inWindow ? prev.count + 1 : 1;
  const multiplier = multiplierFor(count);
  const next: ComboState = { count, multiplier, lastAt: now };
  save(next);
  listeners.forEach((l) => l(next));
  const bonusXp = Math.round(baseXp * (multiplier - 1));
  return { ...next, bonusXp };
}

export function getCombo(): ComboState {
  return load();
}

export function resetCombo() {
  const s: ComboState = { count: 0, multiplier: 1, lastAt: 0 };
  save(s);
  listeners.forEach((l) => l(s));
}

export function subscribeCombo(l: Listener): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export const COMBO_WINDOW_MS = WINDOW_MS;
