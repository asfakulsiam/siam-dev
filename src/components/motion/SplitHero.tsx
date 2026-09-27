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
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const primaryImgRef = useRef<HTMLDivElement>(null);
  const secondaryImgRef = useRef<HTMLDivElement>(null);
  const overlapWordRef = useRef<HTMLSpanElement>(null);

  // Compute main phrase and overlap word
  const { mainPhrase, targetOverlapWord } = useMemo(() => {
    const trimmedHeadline = (headline || "").trim();
    if (!primaryPhoto) {
      return { mainPhrase: trimmedHeadline, targetOverlapWord: "" };
    }

    if (overlapWord && overlapWord.trim()) {
      const explicitWord = overlapWord.trim();
      const main = trimmedHeadline.endsWith(explicitWord)
        ? trimmedHeadline.slice(0, -explicitWord.length).trim()
        : trimmedHeadline;
      return { mainPhrase: main, targetOverlapWord: explicitWord };
    }

    // Default to the last word of the headline
    const words = trimmedHeadline.split(/\s+/);
    if (words.length > 1) {
      const last = words[words.length - 1];
      const rest = words.slice(0, -1).join(" ");
      return { mainPhrase: rest, targetOverlapWord: last };
    }

    return { mainPhrase: trimmedHeadline, targetOverlapWord: "" };
  }, [headline, overlapWord, primaryPhoto]);

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

        // 2. Subhead & Bio fade-in
        if (textRef.current) {
          gsap.fromTo(
            textRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "expo.out" },
          );
        }

        // 3. Primary Photo scale-fade entrance (staggered ~180ms after headline start)
        if (primaryImgRef.current) {
          gsap.fromTo(
            primaryImgRef.current,
            { opacity: 0, scale: 1.04 },
            {
              opacity: 1,
              scale: 1.0,
              duration: 0.75,
              delay: 0.2,
              ease: "expo.out",
            },
          );
        }

        // 4. Secondary Photo subtle tilt entrance
        if (secondaryImgRef.current) {
          gsap.fromTo(
            secondaryImgRef.current,
            { opacity: 0, y: 20, rotate: -10 },
            {
              opacity: 1,
              y: 0,
              rotate: -6,
              duration: 0.8,
              delay: 0.35,
              ease: "expo.out",
            },
          );
        }

        // 5. Overlap Word entrance (lands visibly after photo settles)
        if (overlapWordRef.current) {
          gsap.fromTo(
            overlapWordRef.current,
            { opacity: 0, x: -16 },
            {
              opacity: 1,
              x: 0,
              duration: 0.65,
              delay: 0.45,
              ease: "expo.out",
            },
          );
        }

        // 6. ScrollTrigger compress on scroll: unified composition recedes together
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
              yPercent: -10,
              ease: "none",
            });
          }
        }
      });
    },
    { scope: containerRef },
  );

  const hasPhoto = Boolean(primaryPhoto?.publicId);

  return (
    <div ref={containerRef} className="w-full relative">
      {/* 
        Single-column clean fallback when zero photos are assigned;
        Two-column asymmetric Split Frame on lg+ when primary photo is present.
      */}
      <div
        className={
          hasPhoto
            ? "grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] xl:grid-cols-[1.35fr_1fr] gap-8 lg:gap-0 items-stretch"
            : "max-w-4xl space-y-8"
        }
      >
        {/* Left Column: Metadata, Headline, Subhead, CTAs */}
        <div className="relative z-10 flex flex-col justify-end lg:pr-8 xl:pr-12 space-y-8">
          {/* Metadata Row */}
          <div>{metaRow}</div>

          {/* Main Headline */}
          <div className="space-y-6">
            <h1
              ref={headlineRef}
              aria-label={`${name} — ${headline}`}
              className="text-[var(--text-display)] font-extrabold tracking-tight text-[var(--ink)] leading-[0.92] text-balance transition-colors duration-[var(--duration-base)]"
              style={
                {
                  fontVariationSettings: "'wght' 800, 'wdth' 100",
                  willChange: "transform, opacity",
                } as React.CSSProperties
              }
            >
              {/* On desktop lg+ with photo, render mainPhrase without the overlap word; on mobile or no-photo, render full headline */}
              {hasPhoto && targetOverlapWord ? (
                <>
                  <span className="hidden lg:inline">{mainPhrase}</span>
                  <span className="lg:hidden">{headline}</span>
                </>
              ) : (
                headline
              )}
            </h1>

            {(subheadline || bio) && (
              <p
                ref={textRef}
                className="text-[var(--text-xl)] text-[var(--ink-muted)] max-w-2xl text-pretty leading-relaxed"
              >
                {subheadline} {bio}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-2">{actions}</div>
        </div>

        {/* Right Column: Full-Bleed Split Photo with Desktop Overlap */}
        {hasPhoto && primaryPhoto && (
          <div ref={photoContainerRef} className="relative w-full order-first lg:order-last">
            {/* 
              Primary Photo: Full-bleed to top and right edges on desktop,
              clean architectural crop with a soft bottom-left corner only (rounded-bl-3xl).
              Zero blobs, zero glows, zero clip-path gimmicks.
            */}
            <div
              ref={primaryImgRef}
              className="relative w-full h-[52vh] sm:h-[64vh] lg:h-[calc(100svh-4rem)] lg:-mr-[max(0px,calc((100vw-1440px)/2))] overflow-hidden rounded-bl-2xl lg:rounded-bl-3xl bg-[var(--surface-2)] select-none"
            >
              {primaryPhoto.publicId.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryPhoto.publicId}
                  alt={primaryPhoto.alt}
                  className="w-full h-full object-cover"
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
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Subtle edge depth tint preserving image recognition while framing border */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[var(--bg)]/40 via-transparent to-transparent lg:hidden"
              />
            </div>

            {/* 
              Optional Secondary Action/Candid Photo:
              Tucked behind the bottom-left corner of the primary photo.
              Rotated -6deg with subtle paper border and shadow.
            */}
            {secondaryPhoto && secondaryPhoto.publicId && (
              <div
                ref={secondaryImgRef}
                className="hidden lg:block absolute -bottom-6 -left-8 xl:-left-12 w-36 h-48 xl:w-44 xl:h-56 rotate-[-6deg] rounded-[var(--r-md)] overflow-hidden border-4 border-[var(--bg)] shadow-[var(--shadow-floating)] z-15 bg-[var(--surface-2)] select-none transition-transform duration-500 hover:rotate-[-2deg] hover:scale-105"
              >
                {secondaryPhoto.publicId.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={secondaryPhoto.publicId}
                    alt={secondaryPhoto.alt || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={cldUrl(secondaryPhoto.publicId, {
                      duotone: true,
                      accent: secondaryPhoto.accentColor,
                    })}
                    alt={secondaryPhoto.alt || ""}
                    fill
                    sizes="180px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            )}

            {/* 
              The Split-Frame Overlap Word:
              Positioned on the photo's left edge on lg+.
              Sits ON TOP of the photo (z-20) via layout overlap.
              Includes a subtle 80% blurred backdrop chip behind the text
              to guarantee WCAG 2.2 AA contrast (>= 4.5:1) in all four themes.
            */}
            {targetOverlapWord && (
              <div
                aria-hidden="true"
                className="hidden lg:flex absolute z-20 bottom-12 xl:bottom-16 -left-6 xl:-left-10 items-center pointer-events-none"
              >
                <span
                  ref={overlapWordRef}
                  className="px-3.5 py-1.5 rounded-[var(--r-sm)] bg-[var(--bg)]/85 backdrop-blur-md border border-[var(--line)]/60 text-[var(--text-display)] font-extrabold tracking-tight text-[var(--ink)] leading-[0.92] whitespace-nowrap shadow-sm"
                  style={{
                    fontVariationSettings: "'wght' 800, 'wdth' 100",
                  }}
                >
                  {targetOverlapWord}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
