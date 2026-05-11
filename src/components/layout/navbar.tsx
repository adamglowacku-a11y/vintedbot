import { Menu, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { navItems, siteConfig } from "@/lib/site";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 py-4">
      <div className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3">
        <a className="flex items-center gap-3" href="#">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-[-0.03em] text-white">{siteConfig.name}</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.06] hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" size="sm" variant="ghost">
            Zaloguj się
          </ButtonLink>
          <ButtonLink href="/register" size="sm">
            Zacznij
          </ButtonLink>
        </div>

        <button
          aria-label="Otwórz menu"
          className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white md:hidden"
          type="button"
        >
          <Menu className="size-5" />
        </button>
      </div>
    </header>
  );
}
