import { Badge } from "@/components/ui/badge";

type SettingsRowProps = {
  title: string;
  description: string;
  value: string;
  badge?: string;
};

export function SettingsRow({ title, description, value, badge }: SettingsRowProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">{title}</p>
          {badge ? <Badge variant="muted">{badge}</Badge> : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white">
        {value}
      </div>
    </div>
  );
}
