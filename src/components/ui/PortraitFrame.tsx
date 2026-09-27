"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { cldUrl } from "@/lib/cloudinary";

export interface PortraitFrameProps {
  photo?: {
    publicId?: string;
    alt?: string;
    accentColor?: string;
  } | null;
  variant?: 1 | 2 | 3;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  showBackgroundTint?: boolean;
}

export const DEFAULT_AVATAR_PUBLIC_ID = "default-avatar";

/**
 * On-Brand Default Geometric Avatar
 * Dignified, architectural silhouette using system design tokens (--line, --surface, --ink, --accent)
 */
export function DefaultAvatarSVG({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="defaultAvatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--surface-2)" />
          <stop offset="100%" stopColor="var(--surface)" />
        </linearGradient>
        <linearGradient id="defaultAvatarGlow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Surface Base */}
      <rect width="400" height="480" fill="url(#defaultAvatarBg)" />
      <rect width="400" height="480" fill="url(#defaultAvatarGlow)" />

      {/* Background Architectural Grid Lines */}
      <g stroke="var(--line)" strokeWidth="1" strokeDasharray="4 6" opacity="0.4">
        <line x1="60" y1="0" x2="60" y2="480" />
        <line x1="200" y1="0" x2="200" y2="480" />
        <line x1="340" y1="0" x2="340" y2="480" />
        <line x1="0" y1="120" x2="400" y2="120" />
        <line x1="0" y1="260" x2="400" y2="260" />
        <line x1="0" y1="380" x2="400" y2="380" />
      </g>

      {/* Torso & Shoulders Silhouette */}
      <path
        d="M 60 480 C 60 360 120 330 200 330 C 280 330 340 360 340 480 Z"
        fill="var(--ink)"
        opacity="0.88"
      />
      <path
        d="M 120 480 C 130 380 160 360 200 360 C 240 360 270 380 280 480 Z"
        fill="var(--surface)"
        opacity="0.12"
      />

      {/* Neck Column */}
      <rect
        x="172"
        y="250"
        width="56"
        height="90"
        rx="8"
        fill="var(--ink)"
        opacity="0.8"
      />

      {/* Head Form */}
      <ellipse
        cx="200"
        cy="195"
        rx="68"
        ry="86"
        fill="var(--surface-2)"
        stroke="var(--line)"
        strokeWidth="1.5"
      />

      {/* Hair & Crown Contour */}
      <path
        d="M 132 190 C 132 110 160 95 200 95 C 240 95 268 110 268 190 C 255 135 230 120 200 120 C 170 120 145 135 132 190 Z"
        fill="var(--ink)"
      />

      {/* Eyewear / Modern Designer Frames */}
      <rect
        x="146"
        y="175"
        width="44"
        height="30"
        rx="6"
        fill="var(--surface)"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
      <rect
        x="210"
        y="175"
        width="44"
        height="30"
        rx="6"
        fill="var(--surface)"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
      <line
        x1="190"
        y1="190"
        x2="210"
        y2="190"
        stroke="var(--accent)"
        strokeWidth="2.5"
      />

      {/* Subtle Coordinate / Craft Marker */}
      <circle cx="200" cy="190" r="2" fill="var(--accent)" />
      <text
        x="200"
        y="450"
        textAnchor="middle"
        fill="var(--ink-muted)"
        fontFamily="monospace"
        fontSize="10"
        letterSpacing="2"
      >
        DEV // PORTFOLIO AVATAR
      </text>
    </svg>
  );
}

export function PortraitFrame({
  photo,
  variant = 1,
  size = "hero",
  className = "",
  showBackgroundTint = true,
}: PortraitFrameProps) {
  const rawId = useId();
  const clipId = `portrait-blob-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [imageError, setImageError] = useState(false);

  const publicId = photo?.publicId?.trim();
  const isDefaultAvatar = !publicId || publicId === DEFAULT_AVATAR_PUBLIC_ID;
  const accentColor = photo?.accentColor || "var(--accent)";
  const altText = photo?.alt || "Asfakul — Designer & Full-Stack Developer";

  // Three organic irregular blob clip-paths in normalized objectBoundingBox strictly bounded within 0.02..0.98
  const clipPaths = {
    1: "M 0.20,0.06 C 0.48,0.02 0.76,0.04 0.88,0.18 C 0.98,0.34 0.97,0.66 0.88,0.84 C 0.74,0.97 0.40,0.98 0.20,0.90 C 0.04,0.80 0.03,0.50 0.06,0.28 C 0.09,0.16 0.12,0.09 0.20,0.06 Z",
    2: "M 0.16,0.14 C 0.36,0.03 0.70,0.03 0.86,0.14 C 0.98,0.26 0.97,0.64 0.88,0.82 C 0.76,0.96 0.46,0.98 0.24,0.92 C 0.05,0.83 0.03,0.56 0.05,0.34 C 0.07,0.22 0.10,0.16 0.16,0.14 Z",
    3: "M 0.20,0.07 C 0.50,0.02 0.78,0.05 0.88,0.22 C 0.97,0.40 0.96,0.70 0.84,0.86 C 0.70,0.97 0.34,0.97 0.16,0.86 C 0.04,0.73 0.03,0.46 0.06,0.26 C 0.10,0.14 0.14,0.09 0.20,0.07 Z",
  };

  const selectedPath = clipPaths[variant] || clipPaths[1];

  const sizeClasses = {
    sm: "w-28 h-32 sm:w-36 sm:h-40",
    md: "w-44 h-52 sm:w-52 sm:h-60",
    lg: "w-56 h-64 sm:w-64 sm:h-72",
    hero: "w-52 h-60 sm:w-64 sm:h-72 md:w-72 md:h-80 lg:w-80 lg:h-96",
  }[size];

  const imageUrl = !isDefaultAvatar ? cldUrl(publicId) : null;
  const isSvgDataUri = publicId?.startsWith("data:image/svg+xml");

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}
      style={
        {
          "--frame-accent": accentColor,
        } as React.CSSProperties
      }
    >
      {/* SVG ClipPath Definition */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={selectedPath} />
          </clipPath>
        </defs>
      </svg>

      {/* P.2: Background-adopts-photo-color aesthetic */}
      {showBackgroundTint && (
        <div
          aria-hidden="true"
          className="absolute -inset-8 sm:-inset-16 pointer-events-none rounded-full blur-3xl opacity-30 dark:opacity-20 transition-colors duration-700"
          style={{
            background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Glowing Outer Border wrapper */}
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out hover:scale-[1.02]"
        style={{
          filter: "drop-shadow(0 0 16px var(--frame-accent, var(--accent)))",
        }}
      >
        {/* Soft Accent Border Contour */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 sm:-inset-1.5 opacity-80"
          style={{
            clipPath: `url(#${clipId})`,
            backgroundColor: "var(--frame-accent, var(--accent))",
          }}
        />

        {/* Organic Cropped Media Container */}
        <div
          className="relative w-full h-full bg-[var(--surface-2)] overflow-hidden"
          style={{
            clipPath: `url(#${clipId})`,
          }}
          role={isDefaultAvatar || imageError || !imageUrl ? "img" : undefined}
          aria-label={isDefaultAvatar || imageError || !imageUrl ? altText : undefined}
        >
          {isDefaultAvatar || imageError || !imageUrl ? (
            <DefaultAvatarSVG />
          ) : isSvgDataUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={altText}
              className="w-full h-full object-cover select-none"
              onError={() => setImageError(true)}
            />
          ) : (
            <Image
              src={imageUrl}
              alt={altText}
              fill
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 400px"
              priority={size === "hero"}
              className="object-cover select-none"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          )}

          {/* Hairline Inner Highlight Rim */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none border border-white/20 dark:border-white/10"
            style={{
              clipPath: `url(#${clipId})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
