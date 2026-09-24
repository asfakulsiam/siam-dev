import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full h-10 px-3.5 text-sm rounded-[var(--r-sm)] border bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-[var(--danger)] focus-visible:outline-[var(--danger)]"
            : "border-[var(--line)] hover:border-[var(--ink-muted)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full min-h-[120px] p-3.5 text-sm rounded-[var(--r-sm)] border bg-[var(--surface)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-1 disabled:opacity-50 disabled:cursor-not-allowed resize-y",
          error
            ? "border-[var(--danger)] focus-visible:outline-[var(--danger)]"
            : "border-[var(--line)] hover:border-[var(--ink-muted)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--r-sm)] bg-[var(--surface-2)]", className)}
      {...props}
    />
  );
}
