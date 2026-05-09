import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, delta, icon: Icon }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-primary">{delta}</p>
    </Card>
  );
}
