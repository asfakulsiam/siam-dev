"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { getBlurPlaceholderUrl, isCloudinaryUrl } from "@/lib/cloudinary";

export interface PortfolioImageProps extends Omit<ImageProps, "alt"> {
  /**
   * Accessible text describing the image content.
   * Required and must not be empty (WCAG 2.2 AA).
   */
  alt: string;
  /**
   * Optional visible caption rendered below image in a semantic figure tag
   */
  caption?: string;
  /**
   * Custom CSS aspect ratio string (e.g., '16/9', '4/3', '1/1', '21/9')
   */
  aspectRatio?: string;
  /**
   * Optional wrapper container class name
   */
  containerClassName?: string;
  /**
   * Show animated pulse skeleton before image loads
   */
  showSkeleton?: boolean;
}

/**
 * Accessible, optimized portfolio image component wrapping next/image
 * with automatic LQIP blur placeholders, aspect ratio preservation, and fallback handling.
 */
export function PortfolioImage({
  src,
  alt,
  caption,
  aspectRatio = "16/9",
  containerClassName = "",
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  showSkeleton = true,
  fill = false,
  width,
  height,
  ...props
}: PortfolioImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback image source for broken links or network failures
  const effectiveSrc = hasError || !src
    ? "https://picsum.photos/seed/portfolio-fallback/1200/800"
    : src;

  const srcString = typeof effectiveSrc === "string" ? effectiveSrc : "";
  const blurUrl = srcString ? getBlurPlaceholderUrl(srcString) : undefined;
  const isCloudinary = isCloudinaryUrl(srcString);

  const imageElement = (
    <div
      className={`relative overflow-hidden bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line)] ${containerClassName}`}
      style={!fill && aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Loading Skeleton */}
      {showSkeleton && !isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--surface)] to-transparent animate-pulse z-10"
          aria-hidden="true"
        />
      )}

      <Image
        src={effectiveSrc}
        alt={alt || "Portfolio showcase visual"}
        fill={fill || Boolean(aspectRatio)}
        width={fill || aspectRatio ? undefined : width || 1200}
        height={fill || aspectRatio ? undefined : height || 800}
        sizes={sizes}
        priority={priority}
        referrerPolicy="no-referrer"
        placeholder={isCloudinary ? "blur" : "empty"}
        blurDataURL={isCloudinary ? blurUrl : undefined}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`object-cover transition-all duration-500 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
        } ${className}`}
        {...props}
      />
    </div>
  );

  if (caption) {
    return (
      <figure className="space-y-2">
        {imageElement}
        <figcaption className="text-xs sm:text-sm text-[var(--ink-muted)] text-center font-mono">
          {caption}
        </figcaption>
      </figure>
    );
  }

  return imageElement;
}
