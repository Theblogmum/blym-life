import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import blymLogo from "@/assets/logo-blym.png";

export type NavLink = { label: string; href?: string; to?: string };

/** Sticky landing navbar — single source of truth for the public marketing nav. */
export function LandingNavbar({
  links = [],
}: {
  links?: NavLink[];
}) {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
        scrolled
          ? "bg-background/55 backdrop-blur-2xl backdrop-saturate-150 border-b border-border/40 shadow-[0_1px_0_0_oklch(1_0_0/0.6)_inset,0_8px_24px_-12px_oklch(0.3_0.05_20/0.18)]"
          : "bg-background/30 backdrop-blur-xl border-b border-transparent",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 120% at 15% 0%, color-mix(in oklab, var(--surface-blush) 28%, transparent), transparent 60%), radial-gradient(45% 100% at 90% 0%, color-mix(in oklab, var(--surface-peach) 22%, transparent), transparent 65%)",
        }}
      />
      <div
        className={cn(
          "relative mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 transition-all duration-500",
          scrolled ? "py-2.5" : "py-4",
        )}
      >
        <Link to="/" className="group flex items-center gap-2">
          <span className="sr-only">Blym</span>
          <img
            src={blymLogo}
            alt="Blym — where creators level up"
            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-0.5 text-sm sm:flex">
          {links.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="group relative rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-tight text-foreground/65 transition-colors duration-300 hover:text-foreground"
              >
                <NavLabel label={item.label} />
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="group relative rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-tight text-foreground/65 transition-colors duration-300 hover:text-foreground"
              >
                <NavLabel label={item.label} />
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/app" className="group">
              <Button size="lg" variant="bloom" className="px-5 text-[13px]">
                Open studio <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="rounded-full px-3.5 text-[13px] font-semibold">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup" className="group">
                <Button size="lg" variant="anchor" className="px-5 text-[13px]">
                  Start free <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLabel({ label }: { label: string }) {
  return (
    <span className="relative">
      {label}
      <span
        aria-hidden
        className="absolute -bottom-0.5 left-1/2 h-[1.5px] w-0 -translate-x-1/2 rounded-full bg-[image:var(--gradient-bloom)] transition-[width] duration-300 ease-out group-hover:w-full"
      />
    </span>
  );
}