import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect } from "react";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{ background: "radial-gradient(60% 50% at 50% 30%, oklch(0.94 0.06 30 / 0.7), transparent 70%), radial-gradient(40% 40% at 80% 80%, oklch(0.92 0.08 340 / 0.55), transparent 70%)" }}
      />
      <div className="relative max-w-lg text-center">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-foreground/15 bg-card text-5xl shadow-[8px_8px_0_-2px_oklch(0.2_0.01_20/0.08)]">
          🗺️
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">404 · off the map</p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.4rem)] font-black leading-[1.05] tracking-tight text-foreground">
          you wandered off the map bestie
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          this page doesn't exist (yet). but your daily quests, fresh ideas
          and brand pitches are still waiting back at base camp.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link
            to="/app"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[image:var(--gradient-warm)] px-5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5"
          >
            take me home →
          </Link>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-foreground/30"
          >
            visit landing page
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("[root errorComponent]", error, error?.stack);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        {error?.message && (
          <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-left text-[11px] text-muted-foreground">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Blym — Tell me what to film today" },
      { name: "google-site-verification", content: "e4D5wUDtvJnS57xxCaD9v4UIPPtJKYJeq8vQN03mACs" },
      { name: "description", content: "AI content studio for mum creators. Get a full filming brief every morning — hook, caption, shot list, post time. Built for real life." },
      { property: "og:title", content: "Blym — Tell me what to film today" },
      { property: "og:description", content: "AI content studio for mum creators. Get a full filming brief every morning — hook, caption, shot list, post time. Built for real life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Blym — Tell me what to film today" },
      { name: "twitter:description", content: "AI content studio for mum creators. Get a full filming brief every morning — hook, caption, shot list, post time. Built for real life." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/61ed3aea-44a2-4b15-8f67-dd3502f2280f" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/61ed3aea-44a2-4b15-8f67-dd3502f2280f" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" } as any,
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Inter:wght@300;400;500;600;700&family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Blym",
          alternateName: ["Blym Studio"],
          url: "https://blym.life",
          logo: "https://blym.life/favicon.png",
          description:
            "AI content studio for mum creators. Get a full filming brief every morning — hook, caption, shot list, post time.",
          sameAs: ["https://www.instagram.com/theblogmumstudio"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Blym",
          url: "https://blym.life",
          publisher: { "@type": "Organization", name: "Blym" },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    try {
      if (localStorage.getItem("blym.theme.softSunset") === "1") {
        document.documentElement.classList.add("theme-soft-sunset");
      }
    } catch {}
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
