import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Colophon & System Architecture",
  description:
    "Design tokens, typography specifications, color themes, technology stack, and engineering choices behind Dev Den.",
  alternates: {
    canonical: "/colophon",
  },
  openGraph: {
    title: "Colophon & Architecture | Asfakul — Dev Den",
    description:
      "Design tokens, typography specifications, color themes, and technical choices behind Dev Den.",
    url: `${siteConfig.url}/colophon`,
    type: "website",
    images: [
      {
        url: "/api/og?title=Colophon+%26+System+Architecture&category=Specifications&description=Design+tokens%2C+typography+scales%2C+color+themes%2C+and+performance+budgets.",
        width: 1200,
        height: 630,
        alt: "Colophon OpenGraph Card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colophon & Architecture | Asfakul — Dev Den",
    description:
      "Design tokens, typography specifications, color themes, and technical choices behind Dev Den.",
    images: [
      "/api/og?title=Colophon+%26+System+Architecture&category=Specifications&description=Design+tokens%2C+typography+scales%2C+color+themes%2C+and+performance+budgets.",
    ],
  },
};

const THEMES_INFO = [
  {
    id: "day-shift",
    name: "Day Shift",
    desc: "Crisp cool paper canvas with deep ink and rich cobalt accent.",
    bg: "#f4f6fa",
    surface: "#ffffff",
    ink: "#0b1220",
    accent: "#2f4bff",
  },
  {
    id: "night-coder",
    name: "Night Coder",
    desc: "Deep ink-navy with high legibility and periwinkle focus ring.",
    bg: "#0a0f1a",
    surface: "#121a2a",
    ink: "#e8edf7",
    accent: "#8aa2ff",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    desc: "Full-bleed cobalt background with crisp white typography and yellow focus.",
    bg: "#1f33e6",
    surface: "#1829c4",
    ink: "#ffffff",
    accent: "#ffe14d",
  },
  {
    id: "mono",
    name: "Mono (High Contrast)",
    desc: "Pure black and white with strong border geometry and blue link accent.",
    bg: "#ffffff",
    surface: "#ffffff",
    ink: "#000000",
    accent: "#0033ff",
  },
];

const STACK_ITEMS = [
  { category: "Framework", item: "Next.js 15 (App Router, Server Actions, Dynamic OG)" },
  { category: "Language", item: "TypeScript 5 (Strict mode, zero any)" },
  { category: "Styling", item: "Tailwind CSS v4 (Pure PostCSS, semantic tokens)" },
  { category: "Animation", item: "GSAP 3 + ScrollTrigger, Motion (LazyMotion), Lenis" },
  { category: "Database", item: "MongoDB Atlas (Cached client, typed collections)" },
  { category: "Security", item: "HMAC-SHA256 Signed Sessions, bcryptjs, Salted IP Hashing" },
  { category: "Media", item: "Cloudinary SDK (Signed uploads, dynamic duotone transforms)" },
  { category: "Typography", item: "Bricolage Grotesque (Variable weight/width/opsz via next/font)" },
  { category: "Quality", item: "Vitest (99 Unit tests), Playwright (@axe-core/playwright)" },
];

export default function ColophonPage() {
  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20">
      <Section spacing="compact">
        <Container size="narrow" className="space-y-16">
          {/* Header */}
          <div className="space-y-4 border-b border-[var(--line)] pb-8">
            <div className="flex items-center gap-3">
              <Badge variant="outline">System Spec</Badge>
              <span className="text-xs text-[var(--ink-muted)] font-mono">
                Version 1.0.0 · 2026
              </span>
            </div>
            <Heading as="h1" size="4xl" className="tracking-tight">
              Colophon &amp; System Architecture
            </Heading>
            <Text size="lg" variant="muted" className="text-pretty leading-relaxed">
              The Dev Den portfolio is built with typographic restraint, fluid spatial tokens,
              and strict accessibility gates. Every token, animation, and data flow is intentional.
            </Text>
          </div>

          {/* 1. Typography Spec */}
          <section className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                Typography System: Bricolage Grotesque
              </h2>
              <p className="text-sm text-[var(--ink-muted)]">
                One typeface family spanning weight (200–800), width (75–100), and optical size
                (12–96). Hierarchy is achieved through axis variation rather than competing fonts.
              </p>
            </div>

            <div className="space-y-6 p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]">
              <div>
                <span className="text-xs font-mono text-[var(--ink-muted)] block mb-1">
                  --text-display (Fluid 3.5rem → 10rem)
                </span>
                <div className="text-[clamp(2rem,6vw,5rem)] font-extrabold tracking-[-0.04em] leading-[0.92] text-[var(--ink)]">
                  Considered Web
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)]">
                <span className="text-xs font-mono text-[var(--ink-muted)] block mb-1">
                  --text-4xl (Fluid 3rem → 5.5rem)
                </span>
                <div className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] leading-[1.0] text-[var(--ink)]">
                  Architectural Precision
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)]">
                <span className="text-xs font-mono text-[var(--ink-muted)] block mb-1">
                  --text-xl Lead (1.375rem → 1.75rem)
                </span>
                <p className="text-lg sm:text-xl text-[var(--ink)] leading-relaxed">
                  Every interaction communicates feedback, continuity, state change, or focus. No
                  superfluous movement.
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--line)]">
                <span className="text-xs font-mono text-[var(--ink-muted)] block mb-1">
                  Monospace &amp; Tabular Figures (real code &amp; metrics only)
                </span>
                <div className="font-mono text-xs sm:text-sm text-[var(--ink-muted)] tabular-nums space-y-1">
                  <div>LATENCY: 12ms · LCP: 1.1s · CLS: 0.00 · TBT: 0ms</div>
                  <div>SHA-256: e80yvEa3Rk97o8Q65ZqeeP1kC8gO1i8w5M4gE0V8c0Z1z6Vq4G</div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Color Themes */}
          <section className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                The Four Contrast-Audited Themes
              </h2>
              <p className="text-sm text-[var(--ink-muted)]">
                All themes provide identical semantic tokens. Tested to surpass WCAG 2.2 AA (4.5:1
                text, 3:1 UI).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEMES_INFO.map((theme) => (
                <div
                  key={theme.id}
                  className="p-5 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--ink)]">{theme.name}</span>
                    <span className="text-xs font-mono text-[var(--ink-muted)]">
                      {theme.id}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)]">{theme.desc}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span
                      className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: theme.bg }}
                      title={`Canvas: ${theme.bg}`}
                    />
                    <span
                      className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: theme.surface }}
                      title={`Surface: ${theme.surface}`}
                    />
                    <span
                      className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: theme.ink }}
                      title={`Ink: ${theme.ink}`}
                    />
                    <span
                      className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: theme.accent }}
                      title={`Accent: ${theme.accent}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Tech Stack */}
          <section className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                Engineered Technology Stack
              </h2>
              <p className="text-sm text-[var(--ink-muted)]">
                Built with deliberate, stable dependencies and swappable service boundaries.
              </p>
            </div>

            <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]">
                    <th className="py-3 px-4 font-mono font-medium text-[var(--ink-muted)]">
                      Area
                    </th>
                    <th className="py-3 px-4 font-mono font-medium text-[var(--ink-muted)]">
                      Tool &amp; Strategy
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {STACK_ITEMS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="py-3 px-4 font-medium text-[var(--ink)] whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-[var(--ink-muted)]">{item.item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Performance & Quality Gates */}
          <section className="space-y-4 p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]">
            <h3 className="text-lg font-bold text-[var(--ink)]">
              Performance &amp; Accessibility Targets
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--ink-muted)]">
                  Target LCP
                </div>
                <div className="text-xl font-bold font-mono text-[var(--ink)]">≤ 2.0s</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--ink-muted)]">
                  Target INP
                </div>
                <div className="text-xl font-bold font-mono text-[var(--ink)]">≤ 200ms</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--ink-muted)]">
                  Target CLS
                </div>
                <div className="text-xl font-bold font-mono text-[var(--ink)]">≤ 0.05</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-[var(--ink-muted)]">
                  Bundle Budget
                </div>
                <div className="text-xl font-bold font-mono text-[var(--ink)]">≤ 180KB gz</div>
              </div>
            </div>
          </section>
        </Container>
      </Section>
    </main>
  );
}
