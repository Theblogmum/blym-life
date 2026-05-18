import { useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Soft daily-reminder opt-in card.
 * Uses the browser Notification API to schedule a local "daily quest" nudge.
 * No push server / VAPID needed — fires while the tab is open or via the
 * service worker on supported devices.
 */
export function NotifyOptIn({ className }: { className?: string }) {
  const [supported, setSupported] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setSupported(true);
    setPerm(Notification.permission);
  }, []);

  const ask = async () => {
    if (!supported) {
      toast("Your browser doesn't support notifications", { description: "Try installing Blym to your home screen 💛" });
      return;
    }
    const result = await Notification.requestPermission();
    setPerm(result);
    if (result === "granted") {
      localStorage.setItem("blym.notify", "1");
      try {
        new Notification("you're in 💛", { body: "we'll nudge you for your daily quest. soft, never spammy." });
      } catch {}
      toast.success("daily nudges enabled 🔔", { description: "we'll keep it soft. one tap a day." });
    } else if (result === "denied") {
      toast("Notifications blocked", { description: "you can enable them in your browser settings later." });
    }
  };

  if (!supported) return null;

  const granted = perm === "granted";
  const denied = perm === "denied";

  return (
    <div className={cn("sticker p-4 flex items-center gap-3", className)} style={{ background: "var(--surface-butter)" }}>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-foreground bg-card shadow-[0_3px_0_0_var(--foreground)]">
        {granted ? <Check className="h-5 w-5 text-success" /> : denied ? <BellOff className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base leading-tight">
          {granted ? "daily nudges on 💛" : denied ? "nudges blocked" : "want a soft daily reminder?"}
        </p>
        <p className="text-xs text-foreground/70">
          {granted
            ? "we'll ping you once a day for your tiny quest. that's it."
            : denied
            ? "enable notifications in your browser settings to turn back on."
            : "one tap a day. no spam, no streak shame."}
        </p>
      </div>
      {!granted && !denied && (
        <button onClick={ask} className="btn-chunky btn-chunky--primary shrink-0">
          turn on
        </button>
      )}
    </div>
  );
}