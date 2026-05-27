import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookHeart, Check } from "lucide-react";
import { toast } from "sonner";
import { saveToVault } from "@/lib/vault-save.functions";
import { cn } from "@/lib/utils";

type Props = {
  kind: string;
  body: string;
  title?: string;
  meta?: Record<string, unknown>;
  className?: string;
  variant?: "icon" | "pill";
  label?: string;
};

export function SaveToVaultButton({
  kind,
  body,
  title,
  meta,
  className,
  variant = "icon",
  label = "Save to vault",
}: Props) {
  const fn = useServerFn(saveToVault);
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const m = useMutation({
    mutationFn: () =>
      fn({ data: { kind, body, title: title ?? null, meta: meta ?? null } }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["vault"] });
      toast.success("Saved to vault 🤍");
    },
    onError: (e: Error) => toast.error(e.message || "Couldn't save"),
  });

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={() => !saved && !m.isPending && m.mutate()}
        disabled={saved || m.isPending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.05] px-3 py-1.5 text-[12px] font-semibold text-foreground/70 transition-all duration-300 hover:bg-primary/15 hover:text-primary disabled:opacity-70",
          className,
        )}
      >
        {saved ? <Check className="h-3.5 w-3.5" /> : <BookHeart className="h-3.5 w-3.5" />}
        {saved ? "Saved" : m.isPending ? "Saving…" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !saved && !m.isPending && m.mutate()}
      disabled={saved || m.isPending}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/[0.05] text-foreground/65 transition-all duration-300 hover:bg-primary/15 hover:text-primary active:scale-90 disabled:opacity-70",
        className,
      )}
    >
      {saved ? <Check className="h-4 w-4" /> : <BookHeart className="h-4 w-4" />}
    </button>
  );
}