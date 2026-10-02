import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "text" | "tag";
  size?: "sm" | "xs";
}

export function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    xs: "px-1.5 py-0.2 text-[10px] gap-1",
  };

  const variantStyles = {
    default: "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]",
    outline: "border border-[var(--line)] text-[var(--ink-muted)] bg-transparent",
    tag: "bg-[var(--surface-2)] text-[var(--ink-muted)] border border-[var(--line)]",
    success: "bg-[var(--surface-2)] text-[var(--success)] border border-[var(--success)]/30",
    warning: "bg-[var(--surface-2)] text-[var(--warning)] border border-[var(--warning)]/30",
    danger: "bg-[var(--surface-2)] text-[var(--danger)] border border-[var(--danger)]/30",
    text: "text-[var(--ink-muted)] border-0 bg-transparent p-0",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono rounded-[var(--r-pill)] select-none tabular-nums",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
