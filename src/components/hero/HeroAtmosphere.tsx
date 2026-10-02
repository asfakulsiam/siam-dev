"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";

export function HeroAtmosphere() {
  const { theme } = useTheme();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
    >
      {/* 1. Day Shift Atmosphere: Clean, soft, radiant daylight glow */}
      {theme === "day-shift" && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] sm:w-[900px] sm:h-[700px] rounded-full bg-gradient-to-tr from-[#2F4BFF]/15 via-[#8AA2FF]/20 to-transparent blur-[110px] opacity-80 animate-pulse transition-all duration-700" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-[#2F4BFF]/10 blur-[80px]" />
        </>
      )}

      {/* 2. Charcoal Atmosphere: Studio rim light with restrained dark zinc contour */}
      {theme === "charcoal" && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[550px] sm:w-[850px] sm:h-[650px] rounded-full bg-gradient-to-tr from-[#8AA2FF]/10 via-[#2C2C30]/40 to-transparent blur-[120px] opacity-70" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full bg-[#8AA2FF]/10 blur-[90px]" />
        </>
      )}

      {/* 3. Night Coder Atmosphere: Deep navy technical aura with glowing cyan/indigo core */}
      {theme === "night-coder" && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] sm:w-[950px] sm:h-[750px] rounded-full bg-gradient-to-tr from-[#8AA2FF]/20 via-[#1F33E6]/25 to-transparent blur-[130px] opacity-90" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[350px] rounded-full bg-[#8AA2FF]/15 blur-[80px]" />
          {/* Subtle tech grid watermark */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#24304a15_1px,transparent_1px),linear-gradient(to_bottom,#24304a15_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
        </>
      )}

      {/* 4. Blueprint Atmosphere: Architectural grid, concentric radar arcs, yellow focus rings */}
      {theme === "blueprint" && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[650px] rounded-full bg-gradient-to-tr from-[#FFE14D]/15 via-[#2B40F2]/40 to-transparent blur-[120px] opacity-80" />
          {/* Blueprint precision grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4a5bf025_1px,transparent_1px),linear-gradient(to_bottom,#4a5bf025_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-60" />
          {/* Subtle concentric rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#FFE14D]/20 [mask-image:radial-gradient(circle,#000_60%,transparent_100%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-[#FFE14D]/10" />
        </>
      )}

      {/* 5. Mono Atmosphere: High-contrast brutalist framing & clean vignette */}
      {theme === "mono" && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-gradient-to-tr from-black/5 via-black/10 to-transparent blur-[100px] opacity-60" />
          {/* Minimalist crop corner marks */}
          <div className="hidden sm:block absolute top-24 left-8 w-6 h-6 border-t-2 border-l-2 border-black/30" />
          <div className="hidden sm:block absolute top-24 right-8 w-6 h-6 border-t-2 border-r-2 border-black/30" />
          <div className="hidden sm:block absolute bottom-12 left-8 w-6 h-6 border-b-2 border-l-2 border-black/30" />
          <div className="hidden sm:block absolute bottom-12 right-8 w-6 h-6 border-b-2 border-r-2 border-black/30" />
        </>
      )}
    </div>
  );
}
