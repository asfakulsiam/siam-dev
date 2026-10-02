"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/hooks/useTheme";
import { getDefaultCutoutPhotoSVG } from "@/features/profile/data";

export interface CutoutHeroProps {
  name: string;
  headline: string;
  subheadline?: string;
  bio?: string;
  metaRow: React.ReactNode;
  actions: React.ReactNode;
  heroProfiles?: {
    dayShift?: { publicId: string; alt: string; accentColor?: string };
    charcoal?: { publicId: string; alt: string; accentColor?: string };
    nightCoder?: { publicId: string; alt: string; accentColor?: string };
    blueprint?: { publicId: string; alt: string; accentColor?: string };
    mono?: { publicId: string; alt: string; accentColor?: string };
  } | null;
  cutout?: {
    light?: { publicId: string; alt: string };
    dark?: { publicId: string; alt: string };
  } | null;
  cutoutPhoto?: { publicId: string; alt: string } | null;
}

export function CutoutHero({
  name,
  headline,
  subheadline,
  bio,
  metaRow,
  actions,
  heroProfiles,
  cutout,
  cutoutPhoto,
}: CutoutHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  const { theme, isDark } = useTheme();

  // Dynamic 5-theme deterministic cutout photo resolution
  // 1. Theme-specific entry from heroProfiles
  // 2. Fallback to cutout.light / cutout.dark
  // 3. Fallback to cutoutPhoto / default SVG for the current theme
  const getActiveCutoutPhoto = () => {
    if (theme === "day-shift") {
      if (heroProfiles?.dayShift?.publicId) return heroProfiles.dayShift;
      if (cutout?.light?.publicId) return cutout.light;
    } else if (theme === "charcoal") {
      if (heroProfiles?.charcoal?.publicId) return heroProfiles.charcoal;
      if (cutout?.dark?.publicId) return cutout.dark;
      if (cutout?.light?.publicId) return cutout.light;
    } else if (theme === "night-coder") {
      if (heroProfiles?.nightCoder?.publicId) return heroProfiles.nightCoder;
      if (cutout?.dark?.publicId) return cutout.dark;
      if (cutout?.light?.publicId) return cutout.light;
    } else if (theme === "blueprint") {
      if (heroProfiles?.blueprint?.publicId) return heroProfiles.blueprint;
      if (cutout?.dark?.publicId) return cutout.dark;
      if (cutout?.light?.publicId) return cutout.light;
    } else if (theme === "mono") {
      if (heroProfiles?.mono?.publicId) return heroProfiles.mono;
      if (cutout?.light?.publicId) return cutout.light;
      if (cutout?.dark?.publicId) return cutout.dark;
    }

    // Secondary fallback based on dark/light
    if (isDark) {
      if (cutout?.dark?.publicId) return cutout.dark;
      if (cutout?.light?.publicId) return cutout.light;
    } else {
      if (cutout?.light?.publicId) return cutout.light;
      if (cutout?.dark?.publicId) return cutout.dark;
    }

    if (cutoutPhoto?.publicId) return cutoutPhoto;

    // Guaranteed theme-specific default fallback so hero is never broken
    return {
      publicId: getDefaultCutoutPhotoSVG(theme),
      alt: `${name} portrait (${theme.replace("-", " ")})`,
    };
  };

  const activePhoto = getActiveCutoutPhoto();
  const hasPhoto = Boolean(activePhoto?.publicId);

  // Motion Orchestration with GSAP
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. Variable font load animation (M3)
        const fontProxy = { wght: 300, wdth: 80, opacity: 0, y: 12 };

        gsap.to(fontProxy, {
          wght: 800,
          wdth: 100,
          opacity: 1,
          y: 0,
          duration: 0.8,
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
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: "expo.out" },
          );
        }

        // 3. Cutout Photo subtle settle (safe initial opacity remains 1; enhance scale/pos)
        if (photoRef.current) {
          gsap.fromTo(
            photoRef.current,
            { scale: 1.02, y: 14 },
            {
              scale: 1.0,
              y: 0,
              duration: 0.8,
              delay: 0.1,
              ease: "expo.out",
            },
          );
        }

        // 4. Subtle Parallax scroll compression (does NOT fade photo away)
        if (containerRef.current && photoRef.current) {
          gsap.to(photoRef.current, {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
            yPercent: -6,
            ease: "none",
          });
        }
      });

      // Accessible reduced motion
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
        if (photoRef.current) {
          photoRef.current.style.opacity = "1";
          photoRef.current.style.transform = "none";
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="w-full relative flex flex-col justify-between pt-2 sm:pt-4 pb-2"
    >
      {/* 1. Metadata Top Row */}
      <div className="relative z-20 mb-3 sm:mb-4">{metaRow}</div>

      {/* 2. Full-bleed Cutout Portrait Layer (Behind typography on mobile, Center-Right anchor on desktop) */}
      {hasPhoto && activePhoto && (
        <div className="absolute inset-0 pointer-events-none select-none flex items-end justify-center lg:justify-end lg:pr-6 xl:pr-14 z-10 overflow-hidden">
          <div
            ref={photoRef}
            className="relative w-full max-w-[440px] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[740px] xl:max-w-[840px] h-[55vh] sm:h-[65vh] lg:h-[78vh] xl:h-[84vh] -mb-4 sm:-mb-6 lg:-mb-10 opacity-90 lg:opacity-100 transition-opacity duration-300"
            style={{
              maskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 72%, transparent 100%)",
            }}
          >
            {activePhoto.publicId.startsWith("data:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activePhoto.publicId}
                alt={activePhoto.alt}
                className="w-full h-full object-contain object-bottom"
              />
            ) : (
              <Image
                src={activePhoto.publicId}
                alt={activePhoto.alt}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 55vw"
                className="object-contain object-bottom"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      )}

      {/* 3. Foreground Narrative Content Grid */}
      <div className="relative z-20 mt-auto pt-6 sm:pt-10 lg:pt-16 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
          {/* Headline (Dominant personal text anchor) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3">
            <h1
              ref={headlineRef}
              aria-label={`${name} — ${headline}`}
              className="text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold tracking-[-0.02em] text-[var(--ink)] leading-[1.04] text-balance transition-colors duration-[var(--duration-base)] drop-shadow-xs"
              style={
                {
                  fontVariationSettings: "'wght' 800, 'wdth' 100",
                  lineHeight: "1.04",
                  willChange: "transform, opacity",
                } as React.CSSProperties
              }
            >
              {headline}
            </h1>
          </div>

          {/* Subheadline Narrative & Action CTAs */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-end space-y-4 lg:pb-1">
            {(subheadline || bio) && (
              <p
                ref={subheadRef}
                className="text-[1.0625rem] text-[var(--ink-muted)] text-pretty leading-[1.45] font-normal backdrop-blur-[2px] rounded-[var(--r-sm)] p-1 -m-1"
                style={{ lineHeight: "1.45" }}
              >
                {subheadline} {bio}
              </p>
            )}

            <div ref={actionsRef} className="pt-0.5">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
