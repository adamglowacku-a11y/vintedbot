import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { MobileDashboardNav } from "@/components/dashboard/mobile-dashboard-nav";
import { requireActiveUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireActiveUser();

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-72">
        <DashboardTopbar user={user} />
        <MobileDashboardNav />
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
