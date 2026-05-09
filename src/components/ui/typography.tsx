import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function SectionEyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary",
        className
      )}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-balance text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl",
        className
      )}
      {...props}
    />
  );
}

export function SectionLead({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg", className)}
      {...props}
    />
  );
}
