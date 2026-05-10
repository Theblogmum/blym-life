import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Shield, Users as UsersIcon, Search, RefreshCw, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { checkIsAdmin, listAllUsers } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · Users" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(checkIsAdmin);
  const fetchUsers = useServerFn(listAllUsers);
  const [q, setQ] = useState("");

  const adminQ = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });

  useEffect(() => {
    if (adminQ.data && !adminQ.data.isAdmin) navigate({ to: "/app" });
  }, [adminQ.data, navigate]);

  const usersQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
    enabled: !!adminQ.data?.isAdmin,
  });

  const rows = usersQ.data?.users ?? [];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r: any) =>
      [r.email, r.display_name, r.tier, r.subscription_status]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(s))
    );
  }, [rows, q]);

  const stats = useMemo(() => {
    const total = rows.length;
    const paid = rows.filter((r: any) => r.has_lifetime || ["active", "trialing", "past_due"].includes(r.subscription_status ?? "")).length;
    const onboarded = rows.filter((r: any) => r.onboarded).length;
    const last7 = rows.filter((r: any) => Date.now() - +new Date(r.created_at) < 7 * 86400000).length;
    return { total, paid, onboarded, last7 };
  }, [rows]);

  if (adminQ.isLoading) {
    return <div className="p-8 text-muted-foreground">Checking access…</div>;
  }
  if (adminQ.data && !adminQ.data.isAdmin) {
    return <div className="p-8 text-muted-foreground">Not authorised.</div>;
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-normal tracking-tight">Admin · Users</h1>
            <p className="text-sm text-muted-foreground">See everyone signed up to your studio.</p>
          </div>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => usersQ.refetch()} disabled={usersQ.isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${usersQ.isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total signups" value={stats.total} icon={<UsersIcon className="h-4 w-4" />} />
        <Stat label="New (last 7 days)" value={stats.last7} />
        <Stat label="Onboarded" value={stats.onboarded} />
        <Stat label="Paying" value={stats.paid} icon={<Crown className="h-4 w-4 text-primary" />} />
      </section>

      <div className="mt-6 relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email, name, tier…"
          className="h-11 rounded-full pl-10"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>User</Th>
                <Th>Signed up</Th>
                <Th>Last sign in</Th>
                <Th>Provider</Th>
                <Th>Tier</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {usersQ.isLoading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading users…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                filtered.map((u: any) => (
                  <tr key={u.id} className="border-t border-border/50">
                    <Td>
                      <div className="font-medium text-foreground">{u.display_name || u.email?.split("@")[0] || "—"}</div>
                      <div className="text-[12px] text-muted-foreground">{u.email}</div>
                      {u.roles?.includes("admin") && (
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Admin</span>
                      )}
                    </Td>
                    <Td>{fmt(u.created_at)}</Td>
                    <Td>{u.last_sign_in_at ? fmt(u.last_sign_in_at) : <span className="text-muted-foreground">—</span>}</Td>
                    <Td className="capitalize">{u.provider ?? "email"}</Td>
                    <Td className="capitalize">{u.tier}</Td>
                    <Td>
                      {u.has_lifetime ? (
                        <Badge tone="primary">Lifetime</Badge>
                      ) : u.subscription_status ? (
                        <Badge tone="primary">{u.subscription_status}</Badge>
                      ) : (
                        <Badge tone="muted">Free</Badge>
                      )}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{icon}{label}</p>
      <p className="mt-1.5 font-display text-3xl font-normal tracking-tight">{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3 text-left">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3 align-top ${className}`}>{children}</td>;
}
function Badge({ children, tone }: { children: React.ReactNode; tone: "primary" | "muted" }) {
  const cls = tone === "primary"
    ? "bg-primary/10 text-primary"
    : "bg-secondary text-muted-foreground";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${cls}`}>{children}</span>;
}
function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}