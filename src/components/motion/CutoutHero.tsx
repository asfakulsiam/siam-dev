"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/hooks/useTheme";

export interface CutoutHeroProps {
  name: string;
  headline: string;
  subheadline?: string;
  bio?: string;
  metaRow: React.ReactNode;
  actions: React.ReactNode;
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
  cutout,
  cutoutPhoto,
}: CutoutHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  const { isDark } = useTheme();

  // Dynamic theme-aware cutout selection
  // In dark themes, prioritize dark-tuned cutout; in light themes, prioritize light-tuned cutout
  const activePhoto = isDark
    ? cutout?.dark?.publicId
      ? cutout.dark
      : cutout?.light?.publicId
        ? cutout.light
        : cutoutPhoto
    : cutout?.light?.publicId
      ? cutout.light
      : cutout?.dark?.publicId
        ? cutout.dark
        : cutoutPhoto;

  const hasPhoto = Boolean(activePhoto?.publicId);

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

        // 3. Cutout Photo scale-fade settle (1.03 -> 1.0)
        if (photoRef.current) {
          gsap.fromTo(
            photoRef.current,
            { opacity: 0, scale: 1.03, y: 20 },
            {
              opacity: 1,
              scale: 1.0,
              y: 0,
              duration: 0.85,
              delay: 0.15,
              ease: "expo.out",
            },
          );
        }

        // 4. Parallax scroll compression
        if (containerRef.current && photoRef.current) {
          gsap.to(photoRef.current, {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
            yPercent: -10,
            opacity: 0.4,
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
      className="w-full relative min-h-[calc(100svh-8rem)] flex flex-col justify-between pt-6 pb-2"
    >
      {/* 1. Metadata Top Row */}
      <div className="relative z-20 mb-6">{metaRow}</div>

      {/* 2. Full-bleed Cutout Portrait Layer (Behind / Center-Right) */}
      {hasPhoto && activePhoto && (
        <div className="absolute inset-0 pointer-events-none select-none flex items-end justify-center lg:justify-end lg:pr-8 xl:pr-20 z-10 overflow-hidden">
          <div
            ref={photoRef}
            className="relative w-full max-w-[520px] sm:max-w-[620px] lg:max-w-[700px] xl:max-w-[800px] h-[65vh] sm:h-[75vh] lg:h-[85vh] xl:h-[90vh] -mb-8 lg:-mb-14"
            style={{
              maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
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
      <div className="relative z-20 mt-auto pt-16 lg:pt-28 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Headline (Lower-Left overlaid over lower portion of cutout) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <h1
              ref={headlineRef}
              aria-label={`${name} — ${headline}`}
              className="text-[clamp(2.75rem,5.2vw,4.5rem)] font-extrabold tracking-[-0.02em] text-[var(--ink)] leading-[1.04] text-balance transition-colors duration-[var(--duration-base)] drop-shadow-xs"
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

          {/* Subheadline Narrative & Action CTAs (Right-aligned / Lower Right) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-end space-y-6 lg:pb-2">
            {(subheadline || bio) && (
              <p
                ref={subheadRef}
                className="text-[1.125rem] text-[var(--ink-muted)] text-pretty leading-[1.5] font-normal backdrop-blur-[2px] rounded-[var(--r-sm)] p-1 -m-1"
                style={{ lineHeight: "1.5" }}
              >
                {subheadline} {bio}
              </p>
            )}

            <div ref={actionsRef} className="pt-1">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
