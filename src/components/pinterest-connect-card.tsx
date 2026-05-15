import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function PinterestConnectCard() {
  return (
    <Card className="rounded-3xl p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Pinterest auto-pin · coming soon
      </p>
      <p className="mt-1 font-medium">
        Connect your Pinterest account to auto-publish scheduled pins.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Pinterest is the only platform that legitimately allows third-party auto-posting for personal accounts. We're finalising the integration — for now use the in-app Schedule + email reminders.
      </p>
      <Button variant="outline" className="mt-4 rounded-full" disabled>
        <ExternalLink className="mr-2 h-4 w-4" /> Connect Pinterest (coming soon)
      </Button>
    </Card>
  );
}