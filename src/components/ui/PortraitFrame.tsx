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
  const clipId = useId();
  const [imageError, setImageError] = useState(false);

  const publicId = photo?.publicId?.trim();
  const isDefaultAvatar = !publicId || publicId === DEFAULT_AVATAR_PUBLIC_ID;
  const accentColor = photo?.accentColor || "var(--accent)";
  const altText = photo?.alt || "Asfakul — Designer & Full-Stack Developer";

  // Three organic irregular blob clip-paths in normalized objectBoundingBox (0..1)
  const clipPaths = {
    1: "M 0.18,0.06 C 0.48,-0.04 0.78,0.02 0.90,0.18 C 1.02,0.36 1.00,0.68 0.88,0.86 C 0.74,1.02 0.38,1.03 0.18,0.92 C -0.02,0.80 -0.04,0.48 0.05,0.26 C 0.10,0.14 0.12,0.08 0.18,0.06 Z",
    2: "M 0.14,0.14 C 0.35,-0.02 0.72,-0.02 0.88,0.12 C 1.04,0.26 1.02,0.66 0.90,0.84 C 0.78,0.98 0.44,1.04 0.22,0.94 C 0.02,0.84 -0.04,0.56 0.02,0.32 C 0.06,0.20 0.08,0.16 0.14,0.14 Z",
    3: "M 0.20,0.06 C 0.52,-0.04 0.82,0.04 0.92,0.22 C 1.02,0.42 1.00,0.72 0.84,0.88 C 0.68,1.03 0.30,1.01 0.14,0.88 C -0.02,0.74 -0.02,0.44 0.05,0.24 C 0.10,0.12 0.14,0.08 0.20,0.06 Z",
  };

  const selectedPath = clipPaths[variant] || clipPaths[1];

  const sizeClasses = {
    sm: "w-28 h-32 sm:w-36 sm:h-40",
    md: "w-44 h-52 sm:w-52 sm:h-60",
    lg: "w-56 h-64 sm:w-64 sm:h-72",
    hero: "w-52 h-60 sm:w-64 sm:h-72 md:w-76 md:h-88 lg:w-84 lg:h-96",
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
          <clipPath id={`portrait-blob-${clipId}`} clipPathUnits="objectBoundingBox">
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
            clipPath: `url(#portrait-blob-${clipId})`,
            backgroundColor: "var(--frame-accent, var(--accent))",
          }}
        />

        {/* Organic Cropped Media Container */}
        <div
          className="relative w-full h-full bg-[var(--surface-2)] overflow-hidden"
          style={{
            clipPath: `url(#portrait-blob-${clipId})`,
          }}
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
              clipPath: `url(#portrait-blob-${clipId})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
