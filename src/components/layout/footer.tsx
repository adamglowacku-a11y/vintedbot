import { navItems, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{siteConfig.name}</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Chrome extension and web dashboard for serious Vinted sellers.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {navItems.map((item) => (
            <a className="transition hover:text-white" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          <a className="transition hover:text-white" href="mailto:hello@vintedflow.com">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
