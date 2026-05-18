import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "blym.lowEnergy";
const TINY_TASKS = [
  "open the app. that's it. that's the task.",
  "save one content idea — even a chaotic one.",
  "write ONE hook. just one. you got this.",
  "film 5 seconds of nothing in particular.",
  "drink water. seriously. then come back.",
  "scroll for inspo for 60 seconds. close the app.",
  "reply to ONE comment. just one.",
];

export function LowEnergyButton() {
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(KEY) === "1";
    setOn(v);
    if (v) document.documentElement.classList.add("low-energy");
  }, []);

  const toggle = (next: boolean) => {
    setOn(next);
    localStorage.setItem(KEY, next ? "1" : "0");
    document.documentElement.classList.toggle("low-energy", next);
    if (next) setOpen(true);
  };

  const task = TINY_TASKS[new Date().getDate() % TINY_TASKS.length];

  return (
    <>
      <button
        onClick={() => (on ? toggle(false) : toggle(true))}
        className={cn(
          "fixed bottom-20 right-4 z-40 grid place-items-center rounded-full h-14 w-14 border-2 border-foreground shadow-[0_4px_0_0_var(--foreground)] transition-all hover:-translate-y-0.5 sm:bottom-6",
          on ? "bg-accent text-accent-foreground" : "bg-card text-foreground",
        )}
        aria-label={on ? "Exit low energy mode" : "I'm overwhelmed"}
        title={on ? "Exit chaos mode" : "I'm overwhelmed"}
      >
        <Heart className={cn("h-6 w-6", on && "wiggle")} />
      </button>

      {open && on && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="sticker max-w-sm w-full p-6 bg-card bounce-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <span className="text-3xl">🤍</span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <h2 className="mt-2 font-display text-2xl leading-tight">rough day? we got you.</h2>
            <p className="mt-2 text-sm text-muted-foreground">low energy mode is on. softer colours, tiny tasks, zero pressure.</p>
            <div className="mt-4 rounded-2xl border-2 border-foreground bg-secondary p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">today's tiny task</p>
              <p className="mt-1 font-display text-lg leading-snug">{task}</p>
            </div>
            <p className="mt-4 text-xs text-center text-muted-foreground">consistency &gt; perfection. survival counts. 💕</p>
            <button onClick={() => setOpen(false)} className="btn-chunky btn-chunky--primary w-full mt-4 text-sm">okay bestie ✨</button>
          </div>
        </div>
      )}
    </>
  );
}
