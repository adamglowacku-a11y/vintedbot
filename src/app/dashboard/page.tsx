import { ArrowRight, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { MetricCard } from "@/components/dashboard/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  automationActivity,
  extensionStatus,
  overviewCards,
  quickActions,
  recentActions,
  syncTimeline
} from "@/lib/dashboard-data";

export default function DashboardOverviewPage() {
  return (
    <>
      <PageHeader
        action={<Button type="button">Create automation</Button>}
        description="Monitor extension health, automation results, recent queue activity, and seller workflow shortcuts."
        eyebrow="Dashboard"
        title="Overview"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Extension connection</h2>
              <p className="mt-1 text-sm text-muted-foreground">Prepared for Chrome extension pairing and realtime sync.</p>
            </div>
            <Badge variant={extensionStatus.connected ? "success" : "warning"}>
              {extensionStatus.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries({
              Browser: extensionStatus.browser,
              Version: extensionStatus.version,
              "Last sync": extensionStatus.lastSync,
              "Active tab": extensionStatus.activeTab
            }).map(([label, value]) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={label}>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {syncTimeline.map((item) => (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3" key={item.label}>
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Quick actions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => (
              <button
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-primary/30 hover:bg-primary/10"
                key={action.label}
                type="button"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-white">
                  <action.icon className="size-4 text-primary" />
                  {action.label}
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Automation activity</h2>
          <div className="mt-5 space-y-3">
            {automationActivity.map((item) => (
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={item.title}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Recent actions</h2>
          <div className="mt-5 space-y-3">
            {recentActions.map((action) => (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={action}>
                <CheckCircle2 className="size-5 text-primary" />
                <span className="text-sm text-white">{action}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
