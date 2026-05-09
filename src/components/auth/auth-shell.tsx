import Link from "next/link";
import type { ReactNode } from "react";

import { siteConfig } from "@/lib/site";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="surface-grid absolute inset-0 opacity-70" />
      <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <Link className="mx-auto mb-8 flex w-fit items-center gap-3 text-sm font-semibold text-white" href="/">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
            VF
          </span>
          {siteConfig.name}
        </Link>
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </main>
  );
}
