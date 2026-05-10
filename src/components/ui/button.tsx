import Link from "next/link";
import type { Route } from "next";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 hover:shadow-[0_0_48px_rgba(45,212,191,0.25)]",
  secondary:
    "border border-white/10 bg-white/[0.06] text-white hover:border-white/20 hover:bg-white/[0.1]",
  ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-white"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: Route | `#${string}` | `mailto:${string}` | `http${string}`;
  };

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button className={cn(baseClass, variants[variant], sizes[size], className)} {...props} />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: ButtonLinkProps) {
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http")) {
    return <a className={cn(baseClass, variants[variant], sizes[size], className)} href={href} {...props} />;
  }

  const routeHref = href as Route;

  return (
    <Link className={cn(baseClass, variants[variant], sizes[size], className)} href={routeHref} {...props} />
  );
}
