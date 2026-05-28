import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/app",
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/app" });
  },
  head: () => ({
    meta: [
      { title: "Log in to Blym — Get today's filming brief" },
      {
        name: "description",
        content:
          "Log in to your Blym account to view today's personalised filming brief, captions, planner and creator tools.",
      },
      { property: "og:title", content: "Log in to Blym — Get today's filming brief" },
      {
        property: "og:description",
        content:
          "Log in to your Blym account to view today's personalised filming brief, captions, planner and creator tools.",
      },
      { property: "og:url", content: "https://www.blym.life/login" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://www.blym.life/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <Link to="/" className="text-sm text-muted-foreground">
          ← back
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Let's get your brief.</p>

        <Button
          onClick={handleGoogle}
          disabled={googleLoading || appleLoading || loading}
          variant="outline"
          className="mt-6 w-full rounded-full"
        >
          {googleLoading ? "Opening Google…" : "Continue with Google"}
        </Button>
        <Button
          onClick={handleApple}
          disabled={googleLoading || appleLoading || loading}
          variant="outline"
          className="mt-3 w-full rounded-full"
        >
          {appleLoading ? "Opening Apple…" : "Continue with Apple"}
        </Button>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? "Signing in…" : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link
            to="/signup"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
