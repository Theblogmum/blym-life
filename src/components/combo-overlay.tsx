import { useEffect, useState } from "react";
import { subscribeCombo, COMBO_WINDOW_MS, type ComboState } from "@/lib/combo";
import { cn } from "@/lib/utils";

// Floating combo HUD — pops bottom-center when chain ≥ 2, fades when window expires.
export function ComboOverlay() {
  const [state, setState] = useState<ComboState | null>(null);
  const [pulse, setPulse] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1);

  useEffect(() => {
    const unsub = subscribeCombo((s) => {
      setState(s);
      setPulse((p) => p + 1);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!state || state.count < 2) return;
    const tick = () => {
      const elapsed = Date.now() - state.lastAt;
      const ratio = Math.max(0, 1 - elapsed / COMBO_WINDOW_MS);
      setTimeLeft(ratio);
      if (ratio <= 0) setState(null);
    };
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [state]);

  if (!state || state.count < 2) return null;

  return (
    <div
      key={pulse}
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 sm:bottom-10"
    >
      <div
        className={cn(
          "combo-pop relative flex items-center gap-3 rounded-full border-2 border-foreground bg-card px-4 py-2 shadow-[var(--shadow-elegant)]",
        )}
      >
        <span className="text-[26px] leading-none">🔥</span>
        <div className="flex flex-col leading-none">
          <span className="font-display text-[20px] font-black tabular-nums">
            x{state.multiplier} combo
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">
            {state.count} in a row · keep going
          </span>
        </div>
        {/* timer ring */}
        <span className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-foreground/8">
          <span
            aria-hidden
            className="block h-1.5 rounded-full bg-[image:var(--gradient-warm)]"
            style={{ width: `${Math.max(8, Math.round(timeLeft * 22))}px` }}
          />
        </span>
      </div>
    </div>
  );
}
