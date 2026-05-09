import { KeyRound, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { settingsGroups } from "@/lib/dashboard-data";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        action={<Button type="button">Save changes</Button>}
        description="Manage account preferences, subscription status, extension sync, API credentials, and security controls."
        eyebrow="Workspace"
        title="Settings"
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Account settings</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace name</Label>
              <Input id="workspace" defaultValue="Adam's Vinted Studio" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Notification email</Label>
              <Input id="email" defaultValue="seller@example.com" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Subscription info</h2>
              <p className="mt-1 text-sm text-muted-foreground">Stripe-ready billing summary for SaaS monetization.</p>
            </div>
            <Badge variant="success">Growth</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["€49/mo", "Unlimited listings", "Renews Jun 9"].map((item) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-medium text-white" key={item}>
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {settingsGroups.map((group) => (
          <Card className="p-5" key={group.title}>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">{group.title}</h2>
            <div className="mt-5 space-y-3">
              {group.items.map((item) => (
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={item}>
                  <span className="text-sm text-white">{item}</span>
                  <Button size="sm" type="button" variant="ghost">
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">API access</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Reserve API key management, webhook secrets, and extension pairing tokens for future backend routes.
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Security</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Track sessions, OAuth providers, audit logs, and account-level automation approvals.
          </p>
        </Card>
      </div>
    </>
  );
}
