"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { cldUrl } from "@/lib/cloudinary";
import { MemeAsset } from "@/features/appearance/schema";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

interface MemeStateProps {
  asset: MemeAsset;
  maxLoops?: number;
  className?: string;
}

export function MemeState({
  asset,
  maxLoops = 3,
  className = "",
}: MemeStateProps) {
  const [loops, setLoops] = useState(0);
  const [playing, setPlaying] = useState(true);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  const mediaSource = cldUrl(asset.publicId);
  const posterSource = asset.posterPublicId
    ? cldUrl(asset.posterPublicId)
    : undefined;

  // Render Image / SVG asset or static still under reduced motion
  if (asset.type === "image" || prefersReducedMotion) {
    const isSvgDataUri = mediaSource.startsWith("data:image/svg+xml");

    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xs transition-transform duration-300 hover:scale-[1.02] ${className}`}
      >
        {isSvgDataUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSource}
            alt={asset.alt}
            className="w-full max-w-[220px] aspect-square object-contain"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full max-w-[220px] aspect-square">
            <Image
              src={posterSource || mediaSource}
              alt={asset.alt}
              fill
              className="object-cover rounded-[var(--r-sm)]"
              referrerPolicy="no-referrer"
              sizes="(max-width: 640px) 200px, 240px"
            />
          </div>
        )}
        <p className="mt-2 text-center text-xs font-mono text-[var(--muted)] line-clamp-1 px-1">
          {asset.alt}
        </p>
      </div>
    );
  }

  // Render Video loop with loop limits and click-to-replay
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xs ${className}`}
    >
      <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center">
        <video
          ref={videoRef}
          src={mediaSource}
          poster={posterSource}
          aria-label={asset.alt}
          muted
          playsInline
          autoPlay={playing}
          onEnded={() => {
            const next = loops + 1;
            setLoops(next);
            if (next < maxLoops) {
              videoRef.current?.play().catch(() => {});
            } else {
              setPlaying(false);
            }
          }}
          onClick={() => {
            setLoops(0);
            setPlaying(true);
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(() => {});
            }
          }}
          className="w-full h-full object-cover rounded-[var(--r-sm)] cursor-pointer"
        />

        {!playing && (
          <button
            type="button"
            onClick={() => {
              setLoops(0);
              setPlaying(true);
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => {});
              }
            }}
            className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs hover:bg-black/80 transition-colors"
            aria-label="Replay meme video"
          >
            ▶
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-xs font-mono text-[var(--muted)] line-clamp-1 px-1">
        {asset.alt}
      </p>
    </div>
  );
}
