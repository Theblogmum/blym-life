import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/store_/success")({
  head: () => ({
    meta: [
      { title: "Thanks for your purchase · Blym" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="max-w-md rounded-2xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-foreground" />
        <h1 className="mt-4 text-2xl font-semibold">Thank you!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your purchase is being processed. You'll find your downloads in your library — log in with the same email used at checkout.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/library"><Button className="w-full">Open my library</Button></Link>
          <Link to="/store"><Button variant="ghost" className="w-full">Keep shopping</Button></Link>
        </div>
      </div>
    </main>
  ),
});