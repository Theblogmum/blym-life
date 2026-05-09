import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Flame,
  Camera,
  Folder,
  TrendingUp,
  CalendarDays,
  Settings,
  Rocket,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Wand2,
  Mail,
  TrendingDown,
  Target,
  Clapperboard,
  ListOrdered,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { DunningBanner } from "@/components/dunning-banner";

type Item = { to: string; label: string; icon: typeof Home; desc?: string };

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Create",
    items: [
      { to: "/generator", label: "Generator", icon: Camera, desc: "Hooks, captions, scripts" },
      { to: "/templates", label: "Template Studio", icon: Wand2, desc: "Posts, emails & DMs in 4 picks" },
      { to: "/viral-lab", label: "Viral Lab", icon: Flame, desc: "Break down trends" },
      { to: "/recycler", label: "Recycler", icon: Folder, desc: "5 ideas from one clip" },
      { to: "/broll", label: "B-Roll Ideas", icon: Clapperboard, desc: "Shots, angles & aesthetics" },
      { to: "/series-builder", label: "Series Builder", icon: ListOrdered, desc: "30-part content series" },
    ],
  },
  {
    label: "Plan",
    items: [
      { to: "/film-this", label: "Film this", icon: Rocket, desc: "Today's brief" },
      { to: "/planner", label: "Weekly planner", icon: CalendarDays, desc: "7-day grid" },
    ],
  },
  {
    label: "Grow",
    items: [
      { to: "/insights", label: "Insights", icon: TrendingUp, desc: "Spot what works" },
      { to: "/niche-audit", label: "Niche Audit", icon: Target, desc: "Clarity, gaps & monetisation" },
      { to: "/flop-analyser", label: "Flop Analyser", icon: TrendingDown, desc: "Why a video underperformed" },
      { to: "/pitch-generator", label: "Pitch Generator", icon: Mail, desc: "Email + DM + follow-up" },
    ],
  },
];

const flatNav: Item[] = [
  { to: "/app", label: "Today", icon: Home },
  ...groups.flatMap((g) => g.items),
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) => path === to || (to !== "/app" && path.startsWith(to));
  const isGroupActive = (g: { items: Item[] }) => g.items.some((i) => isActive(i.to));
  const initial = (user?.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Top nav (desktop + mobile shared) */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <DunningBanner />
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 lg:px-6">
          <Link to="/app" className="flex items-center gap-2 font-display text-xl font-black">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-warm)] text-white shadow-[var(--shadow-soft)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="hidden sm:block">
              the blog mum<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            <NavLink to="/app" active={isActive("/app")}>
              Today
            </NavLink>
            {groups.map((g) => (
              <DropdownMenu key={g.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                      isGroupActive(g)
                        ? "bg-secondary text-foreground"
                        : "text-foreground/70 hover:bg-secondary/70 hover:text-foreground",
                    )}
                  >
                    {g.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 rounded-2xl p-2">
                  <DropdownMenuLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {g.label}
                  </DropdownMenuLabel>
                  {g.items.map((i) => (
                    <DropdownMenuItem key={i.to} asChild className="rounded-xl p-0">
                      <Link
                        to={i.to}
                        className="flex w-full items-start gap-3 p-2.5"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                          <i.icon className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold">{i.label}</span>
                          {i.desc && (
                            <span className="text-xs text-muted-foreground">{i.desc}</span>
                          )}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/film-this" className="hidden sm:block">
              <Button size="sm" className="rounded-full font-semibold shadow-[var(--shadow-soft)]">
                <Sparkles className="mr-1.5 h-4 w-4" /> Film this
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-bloom)] text-sm font-bold text-white shadow-[var(--shadow-soft)]"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={async (e) => {
                    e.preventDefault();
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-secondary lg:hidden"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        {mobileOpen && (
          <div className="border-t border-border/60 bg-background lg:hidden">
            <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
              <Link
                to="/app"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold",
                  isActive("/app") ? "bg-primary text-primary-foreground" : "bg-secondary",
                )}
              >
                <Home className="h-4 w-4" /> Today
              </Link>
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {g.label}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {g.items.map((i) => (
                      <Link
                        key={i.to}
                        to={i.to}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-semibold",
                          isActive(i.to)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground/80",
                        )}
                      >
                        <i.icon className="h-4 w-4" /> {i.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="overflow-x-hidden pb-24 lg:pb-0">{children}</main>

      {/* Bottom nav (mobile quick switcher) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-border/60 bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        {flatNav.slice(0, 5).map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold",
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

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
          : "text-foreground/70 hover:bg-secondary/70 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}