import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Sparkles, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSearch: () => void;
};

const ITEMS = [
  { to: "/app", label: "Home", icon: Home },
  { to: "/generator", label: "Create", icon: Sparkles },
  { to: "/planner", label: "Plan", icon: Calendar },
] as const;

export function MobileBottomNav({ onSearch }: Props) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => path === to || (to !== "/app" && path.startsWith(to));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Primary mobile navigation"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = isActive(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.9} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            onClick={onSearch}
            className="flex w-full flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Search tools"
          >
            <Search className="h-5 w-5" strokeWidth={1.9} />
            <span>Search</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}