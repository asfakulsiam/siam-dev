import * as React from "react";
import { cn } from "@/lib/utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "display" | "4xl" | "3xl" | "2xl" | "xl";
}

export function Heading({
  as: Component = "h2",
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  // Infer default size from tag if not specified
  const effectiveSize =
    size ||
    (Component === "h1" ? "4xl" : Component === "h2" ? "3xl" : Component === "h3" ? "2xl" : "xl");

  const sizeStyles = {
    display: "text-[var(--text-display)] font-extrabold leading-[0.92] tracking-[-0.04em]",
    "4xl": "text-[var(--text-4xl)] font-bold leading-[1.0] tracking-[-0.03em]",
    "3xl": "text-[var(--text-3xl)] font-bold leading-[1.05] tracking-[-0.025em]",
    "2xl": "text-[var(--text-2xl)] font-semibold leading-[1.15] tracking-[-0.02em]",
    xl: "text-[var(--text-xl)] font-semibold leading-[1.25] tracking-[-0.015em]",
  };

  return (
    <Component
      className={cn("text-[var(--ink)] text-balance", sizeStyles[effectiveSize], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xl" | "lg" | "base" | "sm" | "xs";
  variant?: "default" | "muted" | "accent";
}

export function Text({
  size = "base",
  variant = "default",
  className,
  children,
  ...props
}: TextProps) {
  const sizeStyles = {
    xl: "text-[var(--text-xl)] leading-[1.25]",
    lg: "text-[var(--text-lg)] leading-[1.5]",
    base: "text-[var(--text-base)] leading-[1.6]",
    sm: "text-[var(--text-sm)] leading-[1.5]",
    xs: "text-[var(--text-xs)] leading-[1.4]",
  };

  const variantStyles = {
    default: "text-[var(--ink)]",
    muted: "text-[var(--ink-muted)]",
    accent: "text-[var(--accent)] font-medium",
  };

  return (
    <p
      className={cn(
        "max-w-[62ch] text-pretty",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
