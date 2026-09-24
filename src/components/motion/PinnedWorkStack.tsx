"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { Project } from "@/features/projects/types";
import { ProjectCard } from "@/features/projects/components/ProjectCard";

interface PinnedWorkStackProps {
  projects: Project[];
}

export function PinnedWorkStack({ projects }: PinnedWorkStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Pinned sequence only at lg+ (≥ 1024px) with no-preference for reduced motion
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = containerRef.current?.querySelectorAll<HTMLElement>(".pinned-card-item");
        if (!cards || cards.length <= 1) return;

        cards.forEach((card, index) => {
          if (index === 0) return;

          gsap.fromTo(
            card,
            {
              yPercent: 30,
              opacity: 0.5,
              scale: 0.97,
            },
            {
              yPercent: 0,
              opacity: 1,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "top 55%",
                scrub: true,
              },
            },
          );
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {projects.map((project, idx) => (
        <div key={project.slug} className="pinned-card-item will-change-transform">
          <ProjectCard project={project} priority={idx === 0} />
        </div>
      ))}
    </div>
  );
}
