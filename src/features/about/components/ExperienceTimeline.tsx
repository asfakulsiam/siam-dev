"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { ExperienceItem } from "@/features/experience/data";

interface ExperienceTimelineProps {
  items: ExperienceItem[];
}

export function ExperienceTimeline({ items }: ExperienceTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!containerRef.current || !lineRef.current) return;

        // Draw the vertical line smoothly as the user scrolls through the timeline (M6)
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
              end: "bottom 60%",
              scrub: true,
            },
          },
        );

        // Highlight nodes as the line reaches them
        const dots = containerRef.current.querySelectorAll<HTMLElement>(".timeline-dot");
        dots.forEach((dot) => {
          gsap.fromTo(
            dot,
            { borderColor: "var(--line)", backgroundColor: "var(--surface)" },
            {
              borderColor: "var(--accent)",
              backgroundColor: "var(--accent)",
              scrollTrigger: {
                trigger: dot,
                start: "top 70%",
                toggleActions: "play reverse play reverse",
              },
            },
          );
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="relative space-y-8 pl-6 sm:pl-8">
      {/* Background track line */}
      <div
        className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-0.5 bg-[var(--line)]"
        aria-hidden="true"
      />

      {/* Dynamic drawn accent line (M6) */}
      <div
        ref={lineRef}
        className="absolute left-[7px] sm:left-[9px] top-2 bottom-2 w-0.5 bg-[var(--accent)] origin-top will-change-transform"
        aria-hidden="true"
      />

      {items.map((item) => (
        <article key={item.id} className="relative space-y-4">
          {/* Dot Indicator */}
          <div
            className="timeline-dot absolute -left-[27px] sm:-left-[31px] top-1.5 w-4 h-4 rounded-full bg-[var(--surface)] border-2 border-[var(--ink-muted)] transition-colors duration-200"
            aria-hidden="true"
          />

          {/* Role Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h3 className="text-xl font-bold text-[var(--ink)]">
              {item.role}{" "}
              <span className="font-normal text-[var(--ink-muted)]">at {item.organization}</span>
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
              <span>{item.period}</span>
              <span className="px-2 py-0.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]">
                {item.type}
              </span>
            </div>
          </div>

          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{item.description}</p>

          {/* Achievements */}
          {item.achievements.length > 0 && (
            <ul className="space-y-2 text-sm text-[var(--ink)]">
              {item.achievements.map((ach) => (
                <li key={ach} className="flex items-start gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[var(--ink)]">{ach}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Tech list */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {item.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-mono text-[var(--ink-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-[var(--r-sm)] border border-[var(--line)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
