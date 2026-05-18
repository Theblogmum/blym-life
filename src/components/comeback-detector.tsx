import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { sendTransactionalEmail } from "@/lib/email/send";

const LAST_VISIT = "blym.lastVisit";
const COMEBACK_SENT = "blym.comebackSentAt";
const DAYS_AWAY_THRESHOLD = 3;
const RESEND_COOLDOWN_DAYS = 14;

/**
 * Tracks last visit timestamp and, on return after 3+ days, fires the
 * comeback email (idempotent + rate-limited) and shows a soft welcome-back toast.
 * Mount once inside the authenticated shell.
 */
export function ComebackDetector() {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || !user?.email) return;
    const now = Date.now();
    const last = Number(localStorage.getItem(LAST_VISIT) || 0);
    const daysAway = last ? Math.floor((now - last) / 86_400_000) : 0;

    if (last && daysAway >= DAYS_AWAY_THRESHOLD) {
      toast(`welcome back bestie 💛`, {
        description: `${daysAway} days away. your spot is exactly where you left it.`,
      });

      const lastSent = Number(localStorage.getItem(COMEBACK_SENT) || 0);
      const cooldownOk = !lastSent || now - lastSent > RESEND_COOLDOWN_DAYS * 86_400_000;
      if (cooldownOk) {
        const bucket = Math.floor(now / (RESEND_COOLDOWN_DAYS * 86_400_000));
        sendTransactionalEmail({
          templateName: "comeback",
          recipientEmail: user.email,
          idempotencyKey: `comeback-${user.id}-${bucket}`,
          templateData: {
            name: (user.user_metadata as any)?.display_name,
            daysAway,
          },
        });
        localStorage.setItem(COMEBACK_SENT, String(now));
      }
    }

    localStorage.setItem(LAST_VISIT, String(now));
  }, [user?.id, user?.email]);

  return null;
}