/**
 * Motion constants matching tokens.css and AGENTS.md §4.6 & §19
 * Durations: 120 · 200 · 400 · 700 · 1100 ms
 * Easings: expo.out / cubic-bezier(0.16,1,0.3,1) · power3.inOut / cubic-bezier(0.65,0,0.35,1)
 */
export const MOTION = {
  duration: {
    instant: 0.12,
    fast: 0.2,
    base: 0.4,
    slow: 0.7,
    epic: 1.1,
  },
  ease: {
    outExpo: [0.16, 1, 0.3, 1] as const,
    inOutPower3: [0.65, 0, 0.35, 1] as const,
  },
} as const;
