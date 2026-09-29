"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
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
  const overlapWordRef = useRef<HTMLDivElement>(null);
  const anchorSpanRef = useRef<HTMLSpanElement>(null);

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
      const last = words[words.length - 1];
      const rest = words.slice(0, -1).join(" ");
      return { mainPhrase: rest, targetOverlapWord: last };
    }

    return { mainPhrase: trimmed, targetOverlapWord: "" };
  }, [headline, overlapWord, primaryPhoto]);

  // Non-negotiable: compute the overlap position from real measured layout at runtime
  const updateMeasuredLayout = useCallback(() => {
    if (typeof window === "undefined") return;

    const isDesktop = window.innerWidth >= 1024;
    if (!containerRef.current) return;

    if (!isDesktop) {
      if (overlapWordRef.current) {
        overlapWordRef.current.style.display = "none";
      }
      return;
    }

    if (!photoContainerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const photoRect = photoContainerRef.current.getBoundingClientRect();

    // 1. Horizontal: Starts ~100px before the photo panel's left edge
    // (~40-45% rests on text column, ~55-60% lands on photo)
    const computedLeft = Math.round(photoRect.left - containerRect.left - 100);

    // 2. Vertical: Aligned to the top of the headline's actual last rendered line
    let computedTop = 0;
    if (anchorSpanRef.current) {
      const anchorRect = anchorSpanRef.current.getBoundingClientRect();
      computedTop = Math.round(anchorRect.top - containerRect.top);
    } else if (headlineRef.current) {
      const hRect = headlineRef.current.getBoundingClientRect();
      const computedLineHeight = 66; // 64px * 1.04 line-height
      computedTop = Math.max(0, Math.round(hRect.bottom - containerRect.top - computedLineHeight));
    }

    if (overlapWordRef.current) {
      overlapWordRef.current.style.display = "block";
      overlapWordRef.current.style.top = `${computedTop}px`;
      overlapWordRef.current.style.left = `${computedLeft}px`;
      overlapWordRef.current.style.visibility = "visible";
    }

    // 3. Secondary Photo placement clearance: verify against real CTA row bottom edge
    if (secondaryImgRef.current && actionsRef.current) {
      const actionsRect = actionsRef.current.getBoundingClientRect();
      const clearanceFromCta = Math.max(24, Math.round(photoRect.bottom - actionsRect.bottom));
      const computedBottom = clearanceFromCta > 120 ? 32 : 16;
      secondaryImgRef.current.style.bottom = `${computedBottom}px`;
      secondaryImgRef.current.style.left = `-36px`;
    }
  }, []);

  // Set up measurement observers (ResizeObserver, fonts.ready, and window resize)
  useEffect(() => {
    // Schedule initial layout computation via requestAnimationFrame
    const rafId = requestAnimationFrame(() => {
      updateMeasuredLayout();
    });

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        updateMeasuredLayout();
      });
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateMeasuredLayout();
      });

      if (containerRef.current) resizeObserver.observe(containerRef.current);
      if (headlineRef.current) resizeObserver.observe(headlineRef.current);
      if (photoContainerRef.current) resizeObserver.observe(photoContainerRef.current);
      if (actionsRef.current) resizeObserver.observe(actionsRef.current);
    }

    window.addEventListener("resize", updateMeasuredLayout, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateMeasuredLayout);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [updateMeasuredLayout, headline, subheadline, bio]);

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

        // 3. Primary Photo scale-fade entrance (staggered 180ms after headline start)
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
              onComplete: updateMeasuredLayout,
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

        // 5. Overlap Word entrance (lands cleanly on top of photo)
        if (overlapWordRef.current) {
          gsap.fromTo(
            overlapWordRef.current,
            { opacity: 0, x: -14 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              delay: 0.4,
              ease: "expo.out",
            },
          );
        }

        // 6. ScrollTrigger unified hero parallax compress
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
        if (overlapWordRef.current) {
          overlapWordRef.current.style.opacity = "1";
          overlapWordRef.current.style.transform = "none";
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
        - Right column: ~43% width (full-bleed photo with single bottom-left soft corner)
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
          className="relative z-10 flex flex-col justify-end lg:pr-8 xl:pr-14 space-y-7"
        >
          {/* Metadata Row */}
          <div>{metaRow}</div>

          {/* Headline & Narrative Block */}
          <div className="space-y-[28px]">
            <h1
              ref={headlineRef}
              aria-label={`${name} — ${headline}`}
              className="text-[clamp(2.75rem,5.2vw,4rem)] font-extrabold tracking-[-0.02em] text-[var(--ink)] leading-[1.04] text-balance transition-colors duration-[var(--duration-base)]"
              style={
                {
                  fontVariationSettings: "'wght' 800, 'wdth' 100",
                  lineHeight: "1.04",
                  willChange: "transform, opacity",
                } as React.CSSProperties
              }
            >
              {/* On desktop lg+ with photo, render mainPhrase and keep an invisible measuring anchor span for the last word */}
              {hasPhoto && targetOverlapWord ? (
                <>
                  <span className="hidden lg:inline">
                    {mainPhrase}{" "}
                    <span
                      ref={anchorSpanRef}
                      aria-hidden="true"
                      className="inline-block opacity-0 select-none pointer-events-none"
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
          <div ref={photoContainerRef} className="relative w-full order-first lg:order-last">
            {/* 
              Primary Photo Panel:
              - Bleeds to top and right edges on desktop
              - Exact single soft corner: rounded-bl-3xl (bottom-left only), all other corners sharp (0px)
              - Restraint: no glow, no drop shadow as decoration, no gradient border
            */}
            <div
              ref={primaryImgRef}
              className="relative w-full h-[48vh] sm:h-[58vh] lg:h-[calc(100svh-4rem)] lg:-mr-[max(0px,calc((100vw-1440px)/2))] overflow-hidden rounded-bl-2xl lg:rounded-bl-3xl bg-[var(--surface-2)] select-none border-b border-l lg:border-t-0 lg:border-r-0 border-[var(--line)]"
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
                  sizes="(max-width: 1024px) 100vw, 43vw"
                  className="object-cover"
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
                style={{
                  bottom: "24px",
                  left: "-36px",
                }}
                className="hidden lg:block absolute w-36 h-48 xl:w-42 xl:h-54 rotate-[-4deg] rounded-[var(--r-md)] overflow-hidden border-2 border-[var(--bg)] shadow-[var(--shadow-floating)] z-15 bg-[var(--surface-2)] select-none transition-transform duration-300 hover:rotate-0 hover:scale-105"
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
                    sizes="170px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 
        The Signature Overlap Moment (Figma v9 Spec):
        - Same size and weight as headline: 64px display / Extra Bold / -2% tracking / 104% line-height
        - Sits ON TOP of the photo (z-20), photo stays completely visible underneath
        - Position is dynamically computed at runtime relative to containerRef (top & left)
        - Rendered only on desktop lg+ when photo is present
      */}
      {hasPhoto && targetOverlapWord && (
        <div
          ref={overlapWordRef}
          aria-hidden="true"
          style={{
            lineHeight: "1.04",
          }}
          className="hidden lg:block absolute z-20 pointer-events-none select-none invisible"
        >
          <span
            className="text-[clamp(2.75rem,5.2vw,4rem)] font-extrabold tracking-[-0.02em] text-[var(--ink)] whitespace-nowrap"
            style={{
              fontVariationSettings: "'wght' 800, 'wdth' 100",
              lineHeight: "1.04",
            }}
          >
            {targetOverlapWord}
          </span>
        </div>
      )}
    </div>
  );
}

