import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  icon?: ReactNode;
  active?: boolean;
};

type SidebarProps = {
  items: SidebarItem[];
  footer?: ReactNode;
  className?: string;
};

export function Sidebar({ items, footer, className }: SidebarProps) {
  return (
    <aside className={cn("glass-panel flex h-full w-64 flex-col rounded-3xl p-3", className)}>
      <div className="px-3 py-4 text-sm font-semibold tracking-[-0.02em] text-white">VintedFlow</div>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-white/[0.06] hover:text-white",
              item.active && "bg-white/[0.08] text-white"
            )}
            key={item.label}
            type="button"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      {footer ? <div className="mt-auto pt-4">{footer}</div> : null}
    </aside>
  );
}
