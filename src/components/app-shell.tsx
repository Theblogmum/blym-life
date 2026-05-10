import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Sparkles, Calendar, TrendingUp, DollarSign, BarChart3, Heart,
  FolderOpen, Users, Star, Settings, LogOut, ChevronDown, ChevronRight,
  Menu, X, Bell, Search,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { DunningBanner } from "@/components/dunning-banner";
import logo from "@/assets/logo-blogmum.png";

type Item = { to: string; label: string };
type Group = { label: string; icon: typeof Home; to?: string; items?: Item[] };

const NAV: Group[] = [
  { label: "Home", icon: Home, to: "/app" },
  {
    label: "Create", icon: Sparkles, items: [
      { to: "/generator", label: "Idea Generator" },
      { to: "/templates", label: "Template Studio" },
      { to: "/film-this", label: "Film Today" },
      { to: "/viral-lab", label: "Viral Lab" },
      { to: "/recycler", label: "Recycler" },
      { to: "/repurpose", label: "Repurpose 1→10" },
      { to: "/script-tightener", label: "Script Tightener" },
      { to: "/cta-generator", label: "CTA Lines" },
      { to: "/broll", label: "B-Roll Ideas" },
      { to: "/series-builder", label: "Series Builder" },
      { to: "/response-writer", label: "DM Replies" },
      { to: "/seo-keywords", label: "SEO Keywords" },
      { to: "/bio-optimiser", label: "Bio Optimiser" },
      { to: "/post-timing", label: "Post Timing" },
      { to: "/faceless-optimiser", label: "Faceless Mode" },
      { to: "/pin-optimiser", label: "Pinterest Pin" },
    ],
  },
  { label: "Plan", icon: Calendar, to: "/planner" },
  {
    label: "Grow", icon: TrendingUp, items: [
      { to: "/insights", label: "Insights" },
      { to: "/niche-audit", label: "Niche Audit" },
      { to: "/profile-audit", label: "Profile Audit" },
      { to: "/flop-analyser", label: "Flop Analyser" },
      { to: "/pitch-generator", label: "Brand Pitch" },
      { to: "/deliverables-builder", label: "Deliverables" },
      { to: "/usage-rights", label: "Usage Rights" },
      { to: "/media-kit", label: "Media Kit" },
      { to: "/portfolio", label: "Portfolio" },
      { to: "/passive-ideas", label: "Passive Ideas" },
      { to: "/engagement-booster", label: "Engagement" },
    ],
  },
  {
    label: "Monetise", icon: DollarSign, items: [
      { to: "/business", label: "Business Mode" },
      { to: "/invoices", label: "Invoices" },
      { to: "/income-tracker", label: "Income Tracker" },
      { to: "/affiliates", label: "Affiliate Links" },
      { to: "/package-names", label: "Package Names" },
      { to: "/service-description", label: "Services" },
    ],
  },
  { label: "Analyse", icon: BarChart3, to: "/insights" },
  {
    label: "Confidence", icon: Heart, items: [
      { to: "/motivation", label: "Daily Motivation" },
      { to: "/wins", label: "Doing Better" },
      { to: "/rejection-recovery", label: "Rejection Recovery" },
    ],
  },
  { label: "Resources", icon: FolderOpen, to: "/templates" },
  { label: "Community", icon: Users, to: "/community" },
  { label: "Favourites", icon: Star, to: "/wins" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Flatten nav into searchable items
  const allItems = useMemo(() => {
    const items: { to: string; label: string; group: string }[] = [];
    NAV.forEach((g) => {
      if (g.to) items.push({ to: g.to, label: g.label, group: g.label });
      g.items?.forEach((i) => items.push({ to: i.to, label: i.label, group: g.label }));
    });
    return items;
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allItems
      .filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, allItems]);

  const goToResult = (to: string) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate({ to });
  };

  const isActive = (to?: string) => !!to && (path === to || (to !== "/app" && path.startsWith(to)));
  const initial = (user?.email ?? "?").slice(0, 1).toUpperCase();

  const renderNav = (onClick?: () => void) => (
    <nav className="space-y-1.5">
      {NAV.map((g) => {
        const active = isActive(g.to) || (g.items?.some((i) => isActive(i.to)) ?? false);
        const open = openGroups[g.label] ?? active;
        if (g.items) {
          return (
            <div key={g.label}>
              <button
                onClick={() => setOpenGroups((s) => ({ ...s, [g.label]: !open }))}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                  active ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-secondary",
                )}
              >
                <span className="flex items-center gap-3">
                  <g.icon className="h-4 w-4" strokeWidth={1.75} />
                  {g.label}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
              </button>
              {open && (
                <ul className="mt-1 ml-7 space-y-0.5 border-l border-border/60 pl-3">
                  {g.items.map((i) => (
                    <li key={i.to}>
                      <Link
                        to={i.to}
                        onClick={onClick}
                        className={cn(
                          "block rounded-xl px-3 py-1.5 text-[12.5px] transition",
                          isActive(i.to)
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-foreground/65 hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        {i.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }
        return (
          <Link
            key={g.label}
            to={g.to!}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary/10 text-primary"
                : "text-foreground/70 hover:bg-secondary",
            )}
          >
            <g.icon className="h-4 w-4" strokeWidth={1.75} />
            {g.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (onClick?: () => void) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link to="/app" onClick={onClick} className="block">
          <img src={logo} alt="The Blog Mum" className="h-16 w-auto object-contain" />
        </Link>
      </div>

      {/* Nav (scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 pb-6">{renderNav(onClick)}</div>

      {/* Inspirational card */}
      <div className="px-6 py-3">
        <div className="mx-auto max-w-[200px] rounded-2xl bg-primary/8 px-4 py-3 text-center">
          <p className="font-display text-[12px] leading-[1.45] text-foreground/85 text-balance">
            You're not just creating content — you're building{" "}
            <span className="italic">your dream life.</span>
          </p>
          <Heart className="mx-auto mt-2 h-3 w-3 fill-primary text-primary" />
        </div>
      </div>

      {/* Profile + settings */}
      <div className="space-y-2 px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-2.5 text-left transition hover:bg-secondary">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  Hi, {(user?.email ?? "you").split("@")[0]} <span className="text-primary">♥</span>
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">Creator</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl">
            <DropdownMenuLabel className="truncate text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={async (e) => { e.preventDefault(); await signOut(); navigate({ to: "/" }); }}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          to="/settings"
          onClick={onClick}
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-secondary"
        >
          <Settings className="h-4 w-4" strokeWidth={1.75} /> Settings
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background">
      <DunningBanner />
      <div className="flex w-full">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur lg:block">
          {sidebarInner()}
        </aside>

        {/* Mobile sheet */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border/60 bg-background shadow-2xl lg:hidden">
              {sidebarInner(() => setMobileOpen(false))}
            </aside>
          </>
        )}

        {/* Main column */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-5 lg:px-8">
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative grid h-10 w-10 place-items-center rounded-full bg-card text-foreground/70 ring-1 ring-border hover:text-foreground"
                      aria-label="Notifications"
                    >
                      <Bell className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 rounded-2xl">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Notifications
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      You're all caught up ✨
                      <div className="mt-1 text-[11px]">No new notifications</div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div ref={searchRef} className="relative hidden md:block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchResults[0]) {
                        goToResult(searchResults[0].to);
                      } else if (e.key === "Escape") {
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Search anything..."
                    className="h-10 w-72 rounded-full border border-border bg-card pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {searchOpen && searchQuery.trim() && (
                    <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
                      {searchResults.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No results for "{searchQuery}"
                        </div>
                      ) : (
                        <ul className="max-h-80 overflow-y-auto py-2">
                          {searchResults.map((r) => (
                            <li key={r.to}>
                              <button
                                onClick={() => goToResult(r.to)}
                                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-secondary"
                              >
                                <span className="font-medium text-foreground">{r.label}</span>
                                <span className="text-[11px] text-muted-foreground">{r.group}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="overflow-x-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
