"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cldUrl } from "@/lib/cloudinary";
import { useOverlapPosition } from "./useOverlapPosition";
import { useTheme, getThemeAccent } from "@/hooks/useTheme";
import {
  getDefaultIdentityPhotoSVG,
  getDefaultSecondaryPhotoSVG,
} from "@/features/profile/data";
import { FloatingSkillBadges } from "@/components/motion/FloatingSkillBadges";

export interface SplitHeroProps {
  name: string;
  headline: string;
  overlapWord?: string;
  subheadline?: string;
  bio?: string;
  skillBadges?: Array<{ label: string; icon?: string; order?: number }>;
  heroProfiles?: {
    dayShift?: { publicId: string; alt: string; accentColor?: string };
    charcoal?: { publicId: string; alt: string; accentColor?: string };
    nightCoder?: { publicId: string; alt: string; accentColor?: string };
    blueprint?: { publicId: string; alt: string; accentColor?: string };
    mono?: { publicId: string; alt: string; accentColor?: string };
  } | null;
  heroPrimary?: {
    light?: { publicId: string; alt: string; accentColor?: string };
    dark?: { publicId: string; alt: string; accentColor?: string };
  } | null;
  heroSecondary?: {
    light?: { publicId: string; alt: string; accentColor?: string };
    dark?: { publicId: string; alt: string; accentColor?: string };
  } | null;
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
  skillBadges,
  heroProfiles,
  heroPrimary,
  heroSecondary,
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

  // Phase X: 5-Theme Deterministic Photo Resolution
  // 1. Theme-specific entry from heroProfiles (per-theme overrides)
  // 2. Fallback to heroPrimary light / dark slots
  // 3. Fallback to primaryPhoto prop
  // 4. Default identity SVG for current theme
  const { theme, isDark } = useTheme();

  const resolvePrimaryPhoto = () => {
    const hasAssignedPhoto = Boolean(
      heroProfiles?.dayShift?.publicId ||
      heroProfiles?.charcoal?.publicId ||
      heroProfiles?.nightCoder?.publicId ||
      heroProfiles?.blueprint?.publicId ||
      heroProfiles?.mono?.publicId ||
      heroPrimary?.light?.publicId ||
      heroPrimary?.dark?.publicId ||
      primaryPhoto?.publicId
    );

    if (!hasAssignedPhoto) {
      return null;
    }

    if (theme === "day-shift") {
      if (heroProfiles?.dayShift?.publicId) return heroProfiles.dayShift;
      if (heroPrimary?.light?.publicId) return heroPrimary.light;
    } else if (theme === "charcoal") {
      if (heroProfiles?.charcoal?.publicId) return heroProfiles.charcoal;
      if (heroPrimary?.dark?.publicId) return heroPrimary.dark;
      if (heroPrimary?.light?.publicId) return heroPrimary.light;
    } else if (theme === "night-coder") {
      if (heroProfiles?.nightCoder?.publicId) return heroProfiles.nightCoder;
      if (heroPrimary?.dark?.publicId) return heroPrimary.dark;
      if (heroPrimary?.light?.publicId) return heroPrimary.light;
    } else if (theme === "blueprint") {
      if (heroProfiles?.blueprint?.publicId) return heroProfiles.blueprint;
      if (heroPrimary?.dark?.publicId) return heroPrimary.dark;
      if (heroPrimary?.light?.publicId) return heroPrimary.light;
    } else if (theme === "mono") {
      if (heroProfiles?.mono?.publicId) return heroProfiles.mono;
      if (heroPrimary?.light?.publicId) return heroPrimary.light;
      if (heroPrimary?.dark?.publicId) return heroPrimary.dark;
    }

    if (isDark) {
      if (heroPrimary?.dark?.publicId) return heroPrimary.dark;
      if (heroPrimary?.light?.publicId) return heroPrimary.light;
    } else {
      if (heroPrimary?.light?.publicId) return heroPrimary.light;
      if (heroPrimary?.dark?.publicId) return heroPrimary.dark;
    }

    if (primaryPhoto?.publicId) return primaryPhoto;

    return {
      publicId: getDefaultIdentityPhotoSVG(theme),
      alt: `${name} portrait (${theme.replace("-", " ")})`,
      accentColor: "auto",
    };
  };

  const resolvedPrimary = resolvePrimaryPhoto();

  const resolvedSecondary = isDark
    ? heroSecondary?.dark?.publicId
      ? heroSecondary.dark
      : heroSecondary?.light?.publicId
        ? heroSecondary.light
        : secondaryPhoto
    : heroSecondary?.light?.publicId
      ? heroSecondary.light
      : heroSecondary?.dark?.publicId
        ? heroSecondary.dark
        : secondaryPhoto;

  const primaryAccent = getThemeAccent(theme, resolvedPrimary?.accentColor);
  const secondaryAccent = getThemeAccent(theme, resolvedSecondary?.accentColor);

  const hasPhoto = Boolean(resolvedPrimary?.publicId);

  // Extract main phrase and target overlap word from headline
  const { mainPhrase, targetOverlapWord } = useMemo(() => {
    const trimmed = (headline || "").trim();
    if (!hasPhoto) {
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
  }, [headline, overlapWord, hasPhoto]);

  // Measured position for signature overlap word (Phase R)
  const overlapPos = useOverlapPosition(containerRef, headlineRef, primaryImgRef);

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

        // 3. Primary Photo subtle settle (safe initial opacity 1)
        if (primaryImgRef.current) {
          gsap.fromTo(
            primaryImgRef.current,
            { scale: 1.02, y: 10 },
            {
              scale: 1.0,
              y: 0,
              duration: 0.75,
              delay: 0.15,
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

        // 5. ScrollTrigger subtle parallax compression (does NOT fade photo away)
        if (containerRef.current && photoContainerRef.current) {
          gsap.to(photoContainerRef.current, {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
            yPercent: -6,
            ease: "none",
          });
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
          className="relative z-20 flex flex-col justify-end lg:pr-6 xl:pr-10"
        >
          {/* Metadata Row */}
          <div className="mb-2 sm:mb-3">{metaRow}</div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            aria-label={`${name} — ${headline}`}
            className="mb-4 sm:mb-6 text-[clamp(2.5rem,4.8vw,4rem)] font-extrabold tracking-[-0.02em] text-[var(--ink)] leading-[1.04] text-balance transition-colors duration-[var(--duration-base)]"
            style={
              {
                fontVariationSettings: "'wght' 800, 'wdth' 100",
                lineHeight: "1.04",
                willChange: "transform, opacity",
              } as React.CSSProperties
            }
          >
            {/* On desktop lg+ with photo, render mainPhrase. On mobile, render full headline. */}
            {hasPhoto && targetOverlapWord ? (
              <>
                <span className="hidden lg:inline">{mainPhrase}</span>
                <span className="lg:hidden">{headline}</span>
              </>
            ) : (
              headline
            )}
          </h1>

          {/* Subheadline Narrative */}
          {(subheadline || bio) && (
            <p
              ref={subheadRef}
              className="mb-6 sm:mb-8 text-[1.125rem] text-[var(--ink-muted)] max-w-[560px] text-pretty leading-[1.5] font-normal"
              style={{ lineHeight: "1.5" }}
            >
              {subheadline} {bio}
            </p>
          )}

          {/* Action CTAs Row */}
          <div ref={actionsRef} className="pt-1">
            {actions}
          </div>
        </div>

        {/* Right Column: Full-Bleed Photo Panel with Single Soft Corner & Overlap */}
        {hasPhoto && resolvedPrimary && (
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
              {resolvedPrimary.publicId.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getDefaultIdentityPhotoSVG(theme)}
                  alt={resolvedPrimary.alt}
                  className="w-full h-full object-cover object-[50%_25%]"
                />
              ) : (
                <Image
                  src={cldUrl(resolvedPrimary.publicId, {
                    duotone: true,
                    accent: primaryAccent,
                  })}
                  alt={resolvedPrimary.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 47vw"
                  className="object-cover object-[50%_25%]"
                  referrerPolicy="no-referrer"
                />
              )}
              <FloatingSkillBadges badges={skillBadges} />
            </div>

            {/* 
              Optional Secondary Photo Card:
              - Tucked at the photo panel's own bottom-left corner
              - Inside the panel bounds, inset roughly 36px to the left of the panel's edge
              - Absent entirely when no secondary photo is assigned
              - Rotated -4deg with clean paper border
            */}
            {resolvedSecondary && resolvedSecondary.publicId && (
              <div
                ref={secondaryImgRef}
                className="hidden lg:block absolute bottom-6 -left-9 w-36 h-48 xl:w-44 xl:h-56 rotate-[-4deg] rounded-[var(--r-md)] overflow-hidden border-2 border-[var(--bg)] shadow-[var(--shadow-floating)] z-20 bg-[var(--surface-2)] select-none transition-transform duration-300 hover:rotate-0 hover:scale-105"
              >
                {resolvedSecondary.publicId.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getDefaultSecondaryPhotoSVG(theme)}
                    alt={resolvedSecondary.alt || ""}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <Image
                    src={cldUrl(resolvedSecondary.publicId, {
                      duotone: true,
                      accent: secondaryAccent,
                    })}
                    alt={resolvedSecondary.alt || ""}
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

      {/* 
        Phase R: The Measured Signature Overlap Moment (Figma v9/v10 Spec)
        - Rendered as an absolute sibling inside containerRef
        - Measured accurately via useOverlapPosition hook
        - Sits on top of the photo panel's left edge (z-30)
        - Starts invisible until ready to eliminate flash-in-wrong-spot
        - Uses small solid backing chip (bg-[var(--bg)]/80 backdrop-blur-sm) to guarantee WCAG AA contrast against any photo
      */}
      {hasPhoto && targetOverlapWord && (
        <span
          aria-hidden="true"
          className="hidden lg:inline-flex items-center absolute z-30 font-extrabold tracking-[-0.02em] text-[var(--ink)] whitespace-nowrap pointer-events-none transition-opacity duration-200 px-2.5 py-0.5 rounded-[var(--r-sm)] bg-[var(--bg)]/80 backdrop-blur-sm shadow-xs border border-[var(--line)]/50"
          style={{
            top: overlapPos.top,
            left: overlapPos.left,
            fontSize: "clamp(2.5rem, 4.8vw, 4rem)",
            lineHeight: 1.04,
            fontVariationSettings: "'wght' 800, 'wdth' 100",
            opacity: overlapPos.ready ? 1 : 0,
          }}
        >
          {targetOverlapWord}
        </span>
      )}
    </div>
  );
}
