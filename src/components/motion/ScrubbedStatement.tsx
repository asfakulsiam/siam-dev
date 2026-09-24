"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface ScrubbedStatementProps {
  text: string;
  className?: string;
  statementClassName?: string;
}

export function ScrubbedStatement({
  text,
  className,
  statementClassName = "text-xl sm:text-2xl font-semibold text-[var(--ink)] leading-snug",
}: ScrubbedStatementProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const wordElements = rootRef.current?.querySelectorAll(".scrub-word");
        if (!wordElements || wordElements.length === 0) return;

        gsap.fromTo(
          wordElements,
          { opacity: 0.2 },
          {
            opacity: 1,
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 85%",
              end: "bottom 45%",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={className} aria-label={text}>
      <p aria-hidden="true" className={statementClassName}>
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="scrub-word inline-block mr-[0.25em] transition-opacity"
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  );
}
