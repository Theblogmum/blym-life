import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, LogOut, Sparkles, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getMe } from "@/lib/profile.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fetchMe = useServerFn(getMe);
  const me = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const tier = me.data?.profile?.tier ?? "free";

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-secondary p-2 text-primary"><SettingsIcon className="h-5 w-5" /></div>
        <h1 className="font-display text-3xl font-black">Settings</h1>
      </div>

      <Card className="mt-6 rounded-3xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
        <p className="mt-1 font-medium">{user?.email}</p>
        <p className="mt-1 text-sm text-muted-foreground">Plan: <span className="font-semibold capitalize text-foreground">{tier}</span></p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ to: "/onboarding" })}>Update creator profile</Button>
          <Button variant="ghost" className="rounded-full" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </Card>

      {tier === "free" && (
        <Card className="mt-5 rounded-3xl border-0 bg-[image:var(--gradient-warm)] p-[2px]">
          <div className="rounded-[calc(theme(borderRadius.3xl)-2px)] bg-card p-5">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Premium — £19/mo</p>
            </div>
            <p className="mt-2 font-display text-2xl font-black">Unlimited briefs, deeper insights.</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[
                "Unlimited 'Tell Me What To Film' plans",
                "Viral breakdowns + remixes",
                "Clip recycler",
                "Growth insights",
                "UGC pitch generator",
              ].map((p) => (
                <li key={p} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{p}</li>
              ))}
            </ul>
            <Button className="mt-4 rounded-full" onClick={() => toast("Payments coming soon — get early access at hello@theblogmum.studio")}>
              Upgrade
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}