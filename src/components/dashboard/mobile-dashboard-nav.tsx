"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import { dashboardNavItems } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export function MobileDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 lg:hidden">
      {dashboardNavItems.map((item) => {
        const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        const href = item.href as Route;

        return (
          <Link
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-muted-foreground",
              isActive && "border-primary/30 bg-primary/10 text-primary"
            )}
            href={href}
            key={item.href}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
