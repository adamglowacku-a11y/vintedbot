"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavItems } from "@/lib/dashboard-data";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-white/10 bg-black/20 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col">
      <div className="flex h-20 items-center px-6">
        <Link className="flex items-center gap-3 text-sm font-semibold text-white" href="/">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
            VF
          </span>
          {siteConfig.name}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {dashboardNavItems.map((item) => {
          const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-white/[0.06] hover:text-white",
                isActive && "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
              )}
              href={item.href}
              key={item.href}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-medium text-white">Chrome extension</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Prepare pairing keys and realtime events for extension integration.
          </p>
        </div>
      </div>
    </aside>
  );
}
