import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sendTransactionalEmail } from "@/lib/email/send";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/app" });
  },
  head: () => ({
    meta: [
      { title: "Sign up for Blym — Daily filming briefs for mum creators" },
      {
        name: "description",
        content:
          "Create your free Blym account and start getting a personalised daily filming brief — hook, caption, shot list and best time to post.",
      },
      { property: "og:title", content: "Sign up for Blym — Daily filming briefs for mum creators" },
      {
        property: "og:description",
        content:
          "Create your free Blym account and start getting a personalised daily filming brief — hook, caption, shot list and best time to post.",
      },
      { property: "og:url", content: "https://www.blym.life/signup" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://www.blym.life/signup" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/onboarding",
        data: { display_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    // Fire welcome email (idempotent on user id)
    const uid = data.user?.id ?? email;
    sendTransactionalEmail({
      templateName: "welcome",
      recipientEmail: email,
      idempotencyKey: `welcome-${uid}`,
      templateData: { name },
    });
    toast.success("Check your email to confirm.");
    navigate({ to: "/onboarding" });
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await signInWithGoogle("/onboarding", { prompt: "select_account" });
    setGoogleLoading(false);
    if (result.error) return toast.error(result.error.message || "Google sign in failed");
    if (result.redirected) return;
    navigate({ to: "/onboarding" });
  };

  const handleApple = async () => {
    setAppleLoading(true);
    const result = await signInWithApple("/onboarding");
    setAppleLoading(false);
    if (result.error) return toast.error(result.error.message || "Apple sign in failed");
    if (result.redirected) return;
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <Link to="/" className="text-sm text-muted-foreground">
          ← back
        </Link>
        <h1 className="mt-2 font-display text-3xl font-black">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          2 minutes. Then you'll know what to film.
        </p>

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
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full">
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have one?{" "}
          <Link
            to="/login"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
