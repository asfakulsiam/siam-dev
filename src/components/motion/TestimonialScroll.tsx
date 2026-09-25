"use client";

import { useRef } from "react";
import Image from "next/image";
import { Quote, User } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { Testimonial } from "@/features/testimonials/schema";
import { cldUrl } from "@/lib/cloudinary";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Badge } from "@/components/ui/Badge";

interface TestimonialScrollProps {
  testimonials: Testimonial[];
}

export function TestimonialScroll({ testimonials }: TestimonialScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop scrub reveal (lg+ ≥ 1024px) with no-preference for reduced motion
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = containerRef.current?.querySelectorAll<HTMLElement>(".testimonial-card-item");
        if (!cards || cards.length === 0) return;

        cards.forEach((card, index) => {
          if (index === 0) return; // First card starts in natural reading position

          gsap.fromTo(
            card,
            {
              yPercent: 24,
              opacity: 0.35,
              scale: 0.98,
            },
            {
              yPercent: 0,
              opacity: 1,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
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

  // If there are zero published testimonials, the section is invisible per prompt specification
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <Section spacing="default" className="border-t border-[var(--line)] relative overflow-hidden">
      <Container className="space-y-12">
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl">
          <Badge variant="outline">Endorsements</Badge>
          <Heading as="h2" size="3xl">
            What Collaborators Say
          </Heading>
          <Text size="lg" variant="muted">
            Direct perspectives from engineering leaders, design partners, and product managers.
          </Text>
        </div>

        {/* Testimonials Vertical Scrubbed Stack */}
        <div
          ref={containerRef}
          className="space-y-8 max-w-3xl mx-auto"
        >
          {testimonials.map((item, idx) => (
            <article
              key={item.id}
              className="testimonial-card-item p-8 sm:p-10 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] relative shadow-xs will-change-[transform,opacity] transition-colors"
            >
              {/* Subtle Quotation Watermark */}
              <div className="absolute top-6 right-6 text-[var(--accent)]/15 pointer-events-none select-none">
                <Quote className="w-10 h-10 sm:w-12 sm:h-12" aria-hidden="true" />
              </div>

              {/* Quote Body */}
              <blockquote className="space-y-6 relative z-10">
                <p className="text-lg sm:text-xl font-medium text-[var(--ink)] leading-relaxed text-pretty">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author Info */}
                <footer className="flex items-center gap-4 pt-4 border-t border-[var(--line)]/60">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--surface-2)] border border-[var(--line)] relative shrink-0 flex items-center justify-center">
                    {item.authorPhoto ? (
                      <Image
                        src={cldUrl(item.authorPhoto.publicId)}
                        alt={item.authorPhoto.alt}
                        fill
                        sizes="48px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-6 h-6 text-[var(--ink-muted)]" aria-hidden="true" />
                    )}
                  </div>

                  <div>
                    <cite className="not-italic block font-bold text-sm sm:text-base text-[var(--ink)]">
                      {item.authorName}
                    </cite>
                    {item.authorRole && (
                      <span className="block text-xs sm:text-sm text-[var(--ink-muted)]">
                        {item.authorRole}
                      </span>
                    )}
                  </div>
                </footer>
              </blockquote>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
