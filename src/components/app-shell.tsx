import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Sparkles, Calendar, TrendingUp, DollarSign, Heart,
  Settings, LogOut, ChevronDown, ShoppingBag, MessageCircle,
  Menu, Bell, Search, Shield, Command as CommandIcon, Trophy,
  Gift, Users, Flag, Wand2, Target, Volume2, VolumeX,
} from "lucide-react";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { DunningBanner } from "@/components/dunning-banner";
import logo from "@/assets/logo-blym.png";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/admin.functions";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { LowEnergyButton } from "@/components/low-energy-button";
import { ToolBanner } from "@/components/tool-banner";
import { EraTheme } from "@/components/era-theme";
import { PlayerHud } from "@/components/player-hud";
import { getMuted, setMuted, pop } from "@/lib/celebrate";
import { ComboOverlay } from "@/components/combo-overlay";

type Item = { to: string; label: string };
type Group = { label: string; icon: typeof Home; to?: string; items?: Item[] };
type Section = { eyebrow: string; groups: Group[] };

const SECTIONS: Section[] = [
  {
    eyebrow: "Daily",
    groups: [
      { label: "Today", icon: Home, to: "/app" },
      { label: "Daily quests", icon: Target, to: "/quests" },
      { label: "My journey", icon: Trophy, to: "/journey" },
      { label: "Leagues", icon: Trophy, to: "/leagues" },
      { label: "Trophy room", icon: Trophy, to: "/achievements" },
      { label: "Wins wall", icon: Users, to: "/feed" },
      { label: "Big firsts", icon: Flag, to: "/milestones" },
      { label: "My creator type", icon: Wand2, to: "/creator-type" },
      { label: "Rewards", icon: Gift, to: "/rewards" },
      { label: "Pep talk", icon: MessageCircle, to: "/growth-coach" },
      { label: "Schedule", icon: Calendar, to: "/schedule" },
      { label: "Plan my week", icon: Calendar, to: "/planner" },
      { label: "Saved stuff", icon: ShoppingBag, to: "/library" },
    ],
  },
  {
    eyebrow: "Make stuff",
    groups: [
      {
        label: "Create", icon: Sparkles, items: [
          { to: "/generator", label: "Give me an idea" },
          { to: "/film-this", label: "Film this now" },
          { to: "/viral-lab", label: "Hook lab" },
          { to: "/recycler", label: "Recycle old posts" },
          { to: "/cta-generator", label: "CTA lines" },
          { to: "/broll", label: "B-roll ideas" },
          { to: "/series-builder", label: "Build a series" },
          { to: "/response-writer", label: "DM replies" },
          { to: "/seo-keywords", label: "SEO keywords" },
          { to: "/bio-optimiser", label: "Fix my bio" },
          { to: "/post-timing", label: "When to post" },
          { to: "/pin-optimiser", label: "Pinterest pin" },
        ],
      },
      {
        label: "Grow", icon: TrendingUp, items: [
          { to: "/insights", label: "What worked" },
          { to: "/brand-hub", label: "Brands to pitch" },
          { to: "/profile-audit", label: "Audit my profile" },
          { to: "/flop-analyser", label: "Why it flopped" },
          { to: "/deliverables-builder", label: "Deliverables" },
          { to: "/usage-rights", label: "Usage rights" },
          { to: "/media-kit", label: "Media kit" },
          { to: "/portfolio", label: "Portfolio" },
          { to: "/passive-ideas", label: "Passive income" },
          { to: "/engagement-booster", label: "Boost engagement" },
        ],
      },
      {
        label: "Monetise", icon: DollarSign, items: [
          { to: "/business", label: "Business mode" },
          { to: "/invoices", label: "Send an invoice" },
          { to: "/income-tracker", label: "Track the money" },
          { to: "/affiliates", label: "Affiliate links" },
        ],
      },
      {
        label: "Mindset", icon: Heart, items: [
          { to: "/motivation", label: "Daily pep talk" },
          { to: "/rejection-recovery", label: "Rejection recovery" },
        ],
      },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [muted, setMutedState] = useState(false);
  useEffect(() => { setMutedState(getMuted()); }, []);
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) pop();
  };

  const checkAdmin = useServerFn(checkIsAdmin);
  const adminQ = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  const isAdmin = !!adminQ.data?.isAdmin;

  // Cmd+K command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const allItems = useMemo(() => {
    const items: { to: string; label: string; group: string }[] = [];
    SECTIONS.forEach((s) =>
      s.groups.forEach((g) => {
        if (g.to) items.push({ to: g.to, label: g.label, group: s.eyebrow });
        g.items?.forEach((i) => items.push({ to: i.to, label: i.label, group: g.label }));
      }),
    );
    return items;
  }, []);

  const groupedForPalette = useMemo(() => {
    const map = new Map<string, { to: string; label: string }[]>();
    allItems.forEach((i) => {
      if (!map.has(i.group)) map.set(i.group, []);
      map.get(i.group)!.push({ to: i.to, label: i.label });
    });
    return Array.from(map.entries());
  }, [allItems]);

  const goToResult = (to: string) => {
    setPaletteOpen(false);
    navigate({ to });
  };

  const isActive = (to?: string) => !!to && (path === to || (to !== "/app" && path.startsWith(to)));
  const initial = (user?.email ?? "?").slice(0, 1).toUpperCase();

  const renderGroup = (g: Group, onClick?: () => void) => {
    const active = isActive(g.to) || (g.items?.some((i) => isActive(i.to)) ?? false);
    const open = openGroups[g.label] ?? active;
    if (g.items) {
      return (
        <div key={g.label}>
          <button
            onClick={() => setOpenGroups((s) => ({ ...s, [g.label]: !open }))}
            className={cn(
              "group flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all",
              active
                ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-foreground)] shadow-[0_1px_2px_oklch(0.2_0.01_20/0.08)]"
                : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-2.5">
              <g.icon className="h-3.5 w-3.5 opacity-70" strokeWidth={1.75} />
              {g.label}
            </span>
            <ChevronDown className={cn("h-3 w-3 opacity-40 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <ul className="mt-1 ml-[1.05rem] space-y-0.5 border-l border-border/60 pl-3">
              {g.items.map((i) => {
                const a = isActive(i.to);
                return (
                  <li key={i.to}>
                    <Link
                      to={i.to}
                      onClick={onClick}
                      className={cn(
                        "block rounded-lg px-2.5 py-1.5 text-[12.5px] transition",
                        a
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground/45 hover:bg-foreground/5 hover:text-foreground/85",
                      )}
                    >
                      {i.label}
                    </Link>
                  </li>
                );
              })}
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
          "flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all",
          active
            ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-foreground)] shadow-[0_1px_2px_oklch(0.2_0.01_20/0.08)]"
            : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground",
        )}
      >
        <g.icon className="h-3.5 w-3.5 opacity-70" strokeWidth={1.75} />
        {g.label}
      </Link>
    );
  };

  const sidebarInner = (onClick?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-5">
        <Link to="/app" onClick={onClick} className="block">
          <img src={logo} alt="Blym" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      {/* Search trigger */}
      <div className="px-3 pb-3">
        <button
          onClick={() => { setPaletteOpen(true); onClick?.(); }}
          className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-[13px] text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search tools…</span>
          <kbd className="rounded-md bg-foreground/8 px-1.5 py-0.5 text-[10px] font-mono font-semibold">⌘K</kbd>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {SECTIONS.map((s, idx) => (
          <div key={s.eyebrow} className={cn(idx === 0 ? "mb-8" : "mb-8 mt-2")}>
            <p className="px-3 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/55">
              {s.eyebrow}
            </p>
            <div className="space-y-0.5">
              {s.groups.map((g) => renderGroup(g, onClick))}
            </div>
          </div>
        ))}
        {isAdmin && (
          <div className="mb-2 mt-2">
            <p className="px-3 pb-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/55">
              Admin
            </p>
            <Link
              to="/admin"
              onClick={onClick}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all",
                isActive("/admin")
                  ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-foreground)] shadow-[0_1px_2px_oklch(0.2_0.01_20/0.08)]"
                  : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <Shield className="h-3.5 w-3.5 opacity-70" strokeWidth={1.75} />
              Admin
            </Link>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="border-t border-border px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-foreground/5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-warm)] text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
                {initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">
                  {(user?.email ?? "you").split("@")[0]}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">Creator</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background">
      <EraTheme />
      <DunningBanner />

      {/* Cmd+K Palette */}
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Jump to a tool, page, or feature…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groupedForPalette.map(([heading, items]) => (
            <CommandGroup key={heading} heading={heading}>
              {items.map((i) => (
                <CommandItem key={i.to} value={`${heading} ${i.label}`} onSelect={() => goToResult(i.to)}>
                  <span>{i.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-card lg:block">
          {sidebarInner()}
        </aside>

        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card shadow-2xl lg:hidden">
              {sidebarInner(() => setMobileOpen(false))}
            </aside>
          </>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
            <div className="flex h-14 items-center gap-3 px-5 lg:px-8">
              <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>

              <button
                onClick={() => setPaletteOpen(true)}
                className="hidden md:flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[13px] text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Find anything</span>
                <kbd className="ml-2 rounded bg-foreground/8 px-1.5 py-0.5 text-[10px] font-mono font-semibold">⌘K</kbd>
              </button>

              <div className="ml-auto flex items-center gap-2">
                <PlayerHud />
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute sounds" : "Mute sounds"}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-foreground/70 hover:text-foreground"
                >
                  {muted ? <VolumeX className="h-4 w-4" strokeWidth={1.75} /> : <Volume2 className="h-4 w-4" strokeWidth={1.75} />}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-foreground/70 hover:text-foreground"
                      aria-label="Notifications"
                    >
                      <Bell className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 rounded-xl">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      what's up
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      all caught up ✨
                      <div className="mt-1 text-[11px]">nothing new today</div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="overflow-x-hidden pb-20 lg:pb-0">
            <ToolBanner />
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav onSearch={() => setPaletteOpen(true)} />
      <LowEnergyButton />
      <ComboOverlay />
    </div>
  );
}
