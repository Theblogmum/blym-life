import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/film-this")({
  component: () => (
    <div className="mx-auto max-w-3xl px-5 py-6 text-center">
      <h1 className="font-display text-3xl font-black">Film This</h1>
      <p className="mt-2 text-muted-foreground">Your full filming brief lives on the dashboard.</p>
      <Link to="/app"><Button className="mt-6 rounded-full">Go to today's brief</Button></Link>
    </div>
  ),
});