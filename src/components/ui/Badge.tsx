import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "text";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]",
    outline: "border border-[var(--line)] text-[var(--ink-muted)] bg-transparent",
    success: "bg-[var(--surface-2)] text-[var(--success)] border border-[var(--success)]/30",
    warning: "bg-[var(--surface-2)] text-[var(--warning)] border border-[var(--warning)]/30",
    danger: "bg-[var(--surface-2)] text-[var(--danger)] border border-[var(--danger)]/30",
    text: "text-[var(--ink-muted)] border-0 bg-transparent p-0",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono rounded-[var(--r-pill)] select-none tabular-nums",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
