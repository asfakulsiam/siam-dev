"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/hooks/useTheme";
import { getDefaultCutoutPhotoSVG } from "@/features/profile/data";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroAtmosphere } from "./HeroAtmosphere";
import { HeroHotspots } from "./HeroHotspots";
import { HeroRotatingBadge } from "./HeroRotatingBadge";

export interface PortfolioHeroProps {
  name: string;
  headline?: string;
  subheadline?: string;
  bio?: string;
  location?: string;
  availability?: {
    open: boolean;
    text: string;
  };
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

export function PortfolioHero({
  name,
  headline,
  subheadline,
  bio,
  location = "Dhaka, Bangladesh",
  availability,
  heroProfiles,
  cutout,
  cutoutPhoto,
}: PortfolioHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  const { theme, isDark } = useTheme();

  // Dynamic 5-theme deterministic cutout photo resolution
  const getActivePortrait = () => {
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

    return {
      publicId: getDefaultCutoutPhotoSVG(theme),
      alt: `${name} portrait (${theme.replace("-", " ")})`,
    };
  };

  const activePortrait = getActivePortrait();

  // Motion Orchestration with GSAP
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Variable font load animation on headline
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

        // Content entrance
        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: "expo.out" },
          );
        }

        // Portrait settle (photo is initially visible, scale enhances it)
        if (portraitRef.current) {
          gsap.fromTo(
            portraitRef.current,
            { scale: 1.02, y: 14 },
            { scale: 1.0, y: 0, duration: 0.8, delay: 0.1, ease: "expo.out" },
          );
        }

        // Parallax scroll compression (does NOT fade photo away)
        if (containerRef.current && portraitRef.current) {
          gsap.to(portraitRef.current, {
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
        if (contentRef.current) {
          contentRef.current.style.opacity = "1";
          contentRef.current.style.transform = "none";
        }
        if (portraitRef.current) {
          portraitRef.current.style.opacity = "1";
          portraitRef.current.style.transform = "none";
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[min(880px,calc(100svh-4rem))] flex flex-col justify-between pt-16 sm:pt-20 pb-4 sm:pb-6 overflow-hidden"
    >
      {/* 1. Atmospheric Theme Mesh Glow */}
      <HeroAtmosphere />

      <Container className="relative z-10 flex-1 flex flex-col justify-between">
        {/* 2. Top Compact Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--ink-muted)] mb-6 pt-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                availability?.open ?? true
                  ? "bg-[var(--success)] animate-pulse"
                  : "bg-[var(--line)]"
              }`}
              aria-hidden="true"
            />
            <span className="text-[var(--ink)] font-medium">
              {availability?.open ?? true
                ? availability?.text || "Available for select contracts"
                : "Unavailable"}
            </span>
            <span className="text-[var(--line)] select-none">/</span>
            <span>{location.split(",")[0]}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[var(--ink-muted)]">Positioning:</span>
            <span className="text-[var(--ink)] font-semibold">Designer &amp; Full-Stack Engineer</span>
          </div>
        </div>

        {/* 3. Main Centerpiece: Art-Directed Headline + Dynamic Rotating Chip + Centered Portrait */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center flex-1 my-auto">
          {/* Left / Primary Typography Area */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-block">
                <HeroRotatingBadge />
              </div>

              <h1
                ref={headlineRef}
                aria-label={`${name} — ${headline || "I design and build digital experiences that feel considered."}`}
                className="text-[clamp(2.75rem,5.5vw,4.75rem)] font-extrabold tracking-[-0.025em] text-[var(--ink)] leading-[1.0] text-balance transition-colors duration-[var(--duration-base)] drop-shadow-xs"
                style={{
                  fontVariationSettings: "'wght' 800, 'wdth' 100",
                  lineHeight: "1.0",
                }}
              >
                {headline || "I design & craft digital products that feel considered."}
              </h1>
            </div>

            <div ref={contentRef} className="space-y-6 max-w-xl">
              <p
                className="text-base sm:text-lg text-[var(--ink-muted)] leading-[1.5] text-pretty font-normal"
                style={{ lineHeight: "1.5" }}
              >
                {subheadline || bio || (
                  "Bridging high-craft product design with robust full-stack engineering. Focused on fluid variable typography, token architectures, and production performance."
                )}
              </p>

              {/* 2 Focused Hero CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link href="/work">
                  <Button size="lg" variant="primary" data-cursor-text="View">
                    <span>Explore Work</span>
                    <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-80" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" data-cursor-text="Say Hi">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right / Center Portrait Anchor with Floating Craft Biometric Hotspots */}
          <div className="lg:col-span-5 xl:col-span-5 flex items-center justify-center relative">
            <div className="relative w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[520px] aspect-[4/5] flex items-end justify-center select-none">
              {/* Interactive Floating Craft Hotspots around portrait */}
              <HeroHotspots />

              {/* Central Portrait Visual with Theme Mask */}
              <div
                ref={portraitRef}
                className="relative w-full h-full flex items-end justify-center overflow-hidden rounded-[var(--r-md)]"
                style={{
                  maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
                }}
              >
                {activePortrait.publicId.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePortrait.publicId}
                    alt={activePortrait.alt}
                    className="w-full h-full object-contain object-bottom transition-all duration-300"
                  />
                ) : (
                  <Image
                    src={activePortrait.publicId}
                    alt={activePortrait.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 45vw"
                    className="object-contain object-bottom"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Scroll Cue */}
        <div className="pt-4 sm:pt-6 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--ink-muted)] mt-6">
          <div className="flex items-center gap-2 font-mono">
            <ArrowDown
              className="w-3.5 h-3.5 animate-bounce text-[var(--accent)]"
              aria-hidden="true"
            />
            <span>Scroll for selected projects</span>
          </div>
          <span className="font-mono text-[var(--ink-muted)]">Asia/Dhaka</span>
        </div>
      </Container>
    </section>
  );
}
