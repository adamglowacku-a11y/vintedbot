import { Bell, Menu, Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageCountrySwitcher } from "@/components/layout/language-country-switcher";
import { Button } from "@/components/ui/button";

type DashboardTopbarProps = {
  user: User;
};

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  const displayName = user.user_metadata?.full_name ?? user.email ?? "Sprzedawca";
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Button className="lg:hidden" size="sm" type="button" variant="secondary">
          <Menu className="size-4" />
        </Button>
        <div className="hidden max-w-md flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-muted-foreground md:flex">
          <Search className="size-4" />
          Szukaj ofert, automatyzacji i wiadomości...
        </div>
        <div className="ml-auto flex items-center gap-3">
          <LanguageCountrySwitcher />
          <Button size="sm" type="button" variant="ghost">
            <Bell className="size-4" />
          </Button>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white">
            {initials}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
