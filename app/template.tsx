"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { MOTION } from "@/config/motion";

interface TemplateProps {
  children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin || shouldReduceMotion) {
    return <div className="w-full flex-1 flex flex-col">{children}</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: MOTION.duration.base,
          ease: MOTION.ease.outExpo,
        }}
        className="w-full flex-1 flex flex-col"
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
