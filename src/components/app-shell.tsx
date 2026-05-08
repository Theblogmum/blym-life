import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Flame,
  Camera,
  Folder,
  TrendingUp,
  CalendarDays,
  Wallet,
  Settings,
  Rocket,
  LogOut,
} from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { DunningBanner } from "@/components/dunning-banner";

const nav = [
  { to: "/app", label: "Today", icon: Home },
  { to: "/film-this", label: "Film this", icon: Rocket },
  { to: "/viral-lab", label: "Viral Lab", icon: Flame },
  { to: "/generator", label: "Generator", icon: Camera },
  { to: "/recycler", label: "Recycler", icon: Folder },
  { to: "/insights", label: "Insights", icon: TrendingUp },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/ugc-hub", label: "UGC Hub", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const isActive = (to: string) => path === to || (to !== "/app" && path.startsWith(to));

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar p-4 lg:flex lg:flex-col">
        <Link to="/app" className="px-2 pb-6 pt-1 font-display text-xl font-black">
          the blog mum<span className="text-muted-foreground">.</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                isActive(n.to)
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "text-foreground/80 hover:bg-sidebar-accent",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 justify-start"
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden pb-24 lg:pb-0">
        <DunningBanner />
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        {nav.slice(0, 5).map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium",
              isActive(n.to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <n.icon className="h-5 w-5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}