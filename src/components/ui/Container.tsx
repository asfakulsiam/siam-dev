import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
}

export function Container({ className, size = "default", children, ...props }: ContainerProps) {
  const sizeStyles = {
    default: "max-w-[1440px]",
    narrow: "max-w-[1200px]",
    wide: "max-w-[1600px]",
  };

  return (
    <div
      className={cn("w-full mx-auto px-4 sm:px-8 md:px-12", sizeStyles[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "default" | "compact" | "spacious";
}

export function Section({ className, spacing = "default", children, ...props }: SectionProps) {
  const spacingStyles = {
    default: "py-[clamp(72px,10vw,140px)]",
    compact: "py-[clamp(48px,6vw,80px)]",
    spacious: "py-[clamp(96px,14vw,180px)]",
  };

  return (
    <section className={cn("w-full relative", spacingStyles[spacing], className)} {...props}>
      {children}
    </section>
  );
}
