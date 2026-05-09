import { MessageSquareText, ShieldAlert, TimerReset } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsRow } from "@/components/dashboard/shared/settings-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { messageTemplates } from "@/lib/dashboard-data";

export default function MessagesPage() {
  return (
    <>
      <PageHeader
        action={
          <Button type="button">
            <MessageSquareText className="size-4" />
            New template
          </Button>
        }
        description="Create buyer reply templates, tune auto replies, and protect accounts with cooldowns and spam checks."
        eyebrow="Inbox automation"
        title="Messages"
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Message templates</h2>
          <div className="mt-5 space-y-3">
            {messageTemplates.map((template) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={template.name}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.usage} · cooldown {template.cooldown}
                    </p>
                  </div>
                  <Badge variant={template.enabled ? "success" : "muted"}>
                    {template.enabled ? "Enabled" : "Paused"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Textarea defaultValue="Hi! Thanks for your interest. I can ship this item tomorrow and can offer a bundle discount if you add another listing." />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Auto reply settings</h2>
          <div className="mt-4 space-y-1">
            <SettingsRow
              badge="AI ready"
              description="Suggest replies based on listing context and buyer intent."
              title="Contextual replies"
              value="Enabled"
            />
            <SettingsRow
              description="Require review for messages with price changes above configured margin."
              title="Approval threshold"
              value="€15+"
            />
            <SettingsRow
              description="Do not send more than one automated message per buyer during cooldown."
              title="Buyer cooldown"
              value="45 min"
            />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <TimerReset className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Cooldown timers</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Queue messages using randomized delays, quiet hours, and per-buyer throttles before extension dispatch.
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Spam protection</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Detect repeated content, blocked keywords, failed sends, and unusual message velocity before automation continues.
          </p>
        </Card>
      </div>
    </>
  );
}
