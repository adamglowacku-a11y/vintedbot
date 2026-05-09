import { TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { analyticsSegments, hourlyPerformance } from "@/lib/dashboard-data";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        description="Measure revenue, response speed, conversion impact, and automation lift across seller workflows."
        eyebrow="Performance"
        title="Analytics"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsSegments.map((segment) => (
          <Card className="p-5" key={segment.label}>
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </div>
            <p className="mt-5 text-sm text-muted-foreground">{segment.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">{segment.value}</p>
            <p className="mt-3 text-sm text-primary">{segment.detail}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-5">
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Hourly performance</h2>
          <p className="mt-1 text-sm text-muted-foreground">Mock analytics chart ready to connect to Supabase events.</p>
        </div>
        <div className="flex h-80 items-end gap-3">
          {hourlyPerformance.map((height, index) => (
            <div className="flex flex-1 flex-col items-center gap-3" key={height + index}>
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-accent/45 to-primary shadow-glow"
                style={{ height }}
              />
              <span className="text-xs text-muted-foreground">{index + 8}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
