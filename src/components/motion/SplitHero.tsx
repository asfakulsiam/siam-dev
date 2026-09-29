"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cldUrl } from "@/lib/cloudinary";

export interface SplitHeroProps {
  name: string;
  headline: string;
  overlapWord?: string;
  subheadline?: string;
  bio?: string;
  primaryPhoto?: { publicId: string; alt: string; accentColor?: string } | null;
  secondaryPhoto?: { publicId: string; alt: string; accentColor?: string } | null;
  metaRow: React.ReactNode;
  actions: React.ReactNode;
}

export function SplitHero({
  name,
  headline,
  overlapWord,
  subheadline,
  bio,
  primaryPhoto,
  secondaryPhoto,
  metaRow,
  actions,
}: SplitHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const primaryImgRef = useRef<HTMLDivElement>(null);
  const secondaryImgRef = useRef<HTMLDivElement>(null);

  // Extract main phrase and target overlap word from headline
  const { mainPhrase, targetOverlapWord } = useMemo(() => {
    const trimmed = (headline || "").trim();
    if (!primaryPhoto) {
      return { mainPhrase: trimmed, targetOverlapWord: "" };
    }

    if (overlapWord && overlapWord.trim()) {
      const explicit = overlapWord.trim();
      const main = trimmed.endsWith(explicit)
        ? trimmed.slice(0, -explicit.length).trim()
        : trimmed;
      return { mainPhrase: main, targetOverlapWord: explicit };
    }

    // Default to the final word of the headline (e.g. "considered." or "products.")
    const words = trimmed.split(/\s+/);
    if (words.length > 1) {
      const last = words[words.length - 1]!;
      const rest = words.slice(0, -1).join(" ");
      return { mainPhrase: rest, targetOverlapWord: last };
    }

    return { mainPhrase: trimmed, targetOverlapWord: "" };
  }, [headline, overlapWord, primaryPhoto]);

  // Motion Orchestration with GSAP
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Variable font load animation (M3)
        const fontProxy = { wght: 300, wdth: 80, opacity: 0, y: 16 };

        gsap.to(fontProxy, {
          wght: 800,
          wdth: 100,
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          onUpdate: () => {
            if (headlineRef.current) {
              headlineRef.current.style.fontVariationSettings = `'wght' ${Math.round(fontProxy.wght)}, 'wdth' ${Math.round(fontProxy.wdth)}`;
              headlineRef.current.style.opacity = `${fontProxy.opacity}`;
              headlineRef.current.style.transform = `translate3d(0, ${fontProxy.y}px, 0)`;
            }
          },
        });

        // 2. Subheadline & Bio entrance
        if (subheadRef.current) {
          gsap.fromTo(
            subheadRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "expo.out" },
          );
        }

        // 3. Primary Photo scale-fade entrance
        if (primaryImgRef.current) {
          gsap.fromTo(
            primaryImgRef.current,
            { opacity: 0, scale: 1.03 },
            {
              opacity: 1,
              scale: 1.0,
              duration: 0.75,
              delay: 0.18,
              ease: "expo.out",
            },
          );
        }

        // 4. Secondary Photo subtle entrance
        if (secondaryImgRef.current) {
          gsap.fromTo(
            secondaryImgRef.current,
            { opacity: 0, y: 16, rotate: -8 },
            {
              opacity: 1,
              y: 0,
              rotate: -4,
              duration: 0.7,
              delay: 0.32,
              ease: "expo.out",
            },
          );
        }

        // 5. ScrollTrigger unified hero parallax compress
        if (containerRef.current) {
          const targets = [headlineRef.current, photoContainerRef.current].filter(Boolean);
          if (targets.length > 0) {
            gsap.to(targets, {
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
              },
              opacity: 0.3,
              yPercent: -8,
              ease: "none",
            });
          }
        }
      });

      // Accessible reduced motion: render immediately in final static state with zero motion
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (headlineRef.current) {
          headlineRef.current.style.fontVariationSettings = "'wght' 800, 'wdth' 100";
          headlineRef.current.style.opacity = "1";
          headlineRef.current.style.transform = "none";
        }
        if (subheadRef.current) {
          subheadRef.current.style.opacity = "1";
          subheadRef.current.style.transform = "none";
        }
        if (primaryImgRef.current) {
          primaryImgRef.current.style.opacity = "1";
          primaryImgRef.current.style.transform = "none";
        }
        if (secondaryImgRef.current) {
          secondaryImgRef.current.style.opacity = "1";
          secondaryImgRef.current.style.transform = "rotate(-4deg)";
        }
      });
    },
    { scope: containerRef },
  );

  const hasPhoto = Boolean(primaryPhoto?.publicId);

  return (
    <div ref={containerRef} className="w-full relative">
      {/* 
        Asymmetric split based on Figma v9 spec:
        - Left column: ~53% width (meta, headline, subheadline, CTAs)
        - Right column: ~47% width (full-bleed photo with single bottom-left soft corner)
        - Single column fallback when zero photos are assigned
      */}
      <div
        className={
          hasPhoto
            ? "grid grid-cols-1 lg:grid-cols-[1.24fr_1fr] xl:grid-cols-[1.32fr_1fr] gap-8 lg:gap-0 items-stretch"
            : "max-w-4xl space-y-8"
        }
      >
        {/* Left Column: Metadata, Headline, Subheadline, CTAs */}
        <div
          ref={leftColRef}
          className="relative z-20 flex flex-col justify-end lg:pr-6 xl:pr-10 space-y-7"
        >
          {/* Metadata Row */}
          <div>{metaRow}</div>

          {/* Headline & Narrative Block */}
          <div className="space-y-[28px]">
            <h1
              ref={headlineRef}
              aria-label={`${name} — ${headline}`}
              className="text-[clamp(2.5rem,4.8vw,4rem)] font-extrabold tracking-[-0.02em] text-[var(--ink)] leading-[1.04] text-balance transition-colors duration-[var(--duration-base)]"
              style={
                {
                  fontVariationSettings: "'wght' 800, 'wdth' 100",
                  lineHeight: "1.04",
                  willChange: "transform, opacity",
                } as React.CSSProperties
              }
            >
              {/* On desktop lg+ with photo, render main phrase and target overlap word in flow with z-30 overlap */}
              {hasPhoto && targetOverlapWord ? (
                <>
                  <span className="hidden lg:inline">
                    {mainPhrase}{" "}
                    <span
                      className="relative z-30 inline-block font-extrabold tracking-[-0.02em] text-[var(--ink)] whitespace-nowrap"
                      style={{
                        lineHeight: "1.04",
                      }}
                    >
                      {targetOverlapWord}
                    </span>
                  </span>
                  <span className="lg:hidden">{headline}</span>
                </>
              ) : (
                headline
              )}
            </h1>

            {(subheadline || bio) && (
              <p
                ref={subheadRef}
                className="text-[1.125rem] text-[var(--ink-muted)] max-w-[560px] text-pretty leading-[1.5] font-normal"
                style={{ lineHeight: "1.5" }}
              >
                {subheadline} {bio}
              </p>
            )}
          </div>

          {/* Action CTAs Row */}
          <div ref={actionsRef} className="pt-2">
            {actions}
          </div>
        </div>

        {/* Right Column: Full-Bleed Photo Panel with Single Soft Corner & Overlap */}
        {hasPhoto && primaryPhoto && (
          <div ref={photoContainerRef} className="relative w-full order-first lg:order-last z-10">
            {/* 
              Primary Photo Panel:
              - Bleeds to top and right edges on desktop
              - Exact single soft corner: rounded-bl-[32px] lg:rounded-bl-[40px] (bottom-left only), all other corners sharp (0px)
              - Restraint: no glow, no drop shadow as decoration, no gradient border
            */}
            <div
              ref={primaryImgRef}
              className="relative w-full h-[48vh] sm:h-[58vh] lg:h-[calc(100svh-4.5rem)] lg:-mr-[max(0px,calc((100vw-1440px)/2))] overflow-hidden rounded-bl-[32px] lg:rounded-bl-[40px] bg-[var(--surface-2)] select-none border-b border-l lg:border-t-0 lg:border-r-0 border-[var(--line)]"
            >
              {primaryPhoto.publicId.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryPhoto.publicId}
                  alt={primaryPhoto.alt}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <Image
                  src={cldUrl(primaryPhoto.publicId, {
                    duotone: true,
                    accent: primaryPhoto.accentColor,
                  })}
                  alt={primaryPhoto.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 47vw"
                  className="object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* 
              Optional Secondary Photo Card:
              - Tucked at the photo panel's own bottom-left corner
              - Inside the panel bounds, inset roughly 36px to the left of the panel's edge
              - Absent entirely when no secondary photo is assigned
              - Rotated -4deg with clean paper border
            */}
            {secondaryPhoto && secondaryPhoto.publicId && (
              <div
                ref={secondaryImgRef}
                className="hidden lg:block absolute bottom-6 -left-9 w-36 h-48 xl:w-44 xl:h-56 rotate-[-4deg] rounded-[var(--r-md)] overflow-hidden border-2 border-[var(--bg)] shadow-[var(--shadow-floating)] z-20 bg-[var(--surface-2)] select-none transition-transform duration-300 hover:rotate-0 hover:scale-105"
              >
                {secondaryPhoto.publicId.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={secondaryPhoto.publicId}
                    alt={secondaryPhoto.alt || ""}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <Image
                    src={cldUrl(secondaryPhoto.publicId, {
                      duotone: true,
                      accent: secondaryPhoto.accentColor,
                    })}
                    alt={secondaryPhoto.alt || ""}
                    fill
                    sizes="(max-width: 1280px) 150px, 180px"
                    className="object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
