import type { Project } from "./types";

export const staticProjects: Project[] = [
  {
    slug: "stride-design-system",
    title: "Stride Design System",
    tagline: "A multi-brand tokenized design architecture for scale.",
    category: "Design Systems",
    featured: true,
    year: "2025–2026",
    timeline: "6 months",
    role: "Lead Design Engineer",
    client: "Stride Tech Labs",
    summary:
      "Engineered an enterprise-grade multi-brand token system spanning Figma variables and CSS custom properties, achieving 100% WCAG 2.2 AA contrast compliance across light, dark, and high-contrast themes.",
    coverImage: {
      src: "https://picsum.photos/seed/stride-system/1200/675",
      alt: "Stride Design System typography tokens and component library preview",
      aspectRatio: "16/9",
    },
    tags: ["Design Tokens", "TypeScript", "Tailwind CSS", "WCAG 2.2 AA", "React"],
    metrics: [
      {
        label: "Contrast Compliance",
        value: "100%",
        description: "Zero AA violations across 4 multi-brand themes",
      },
      {
        label: "Engineering Adoption",
        value: "14 Teams",
        description: "Standardized across 8 web products and 3 internal tools",
      },
      {
        label: "Handoff Velocity",
        value: "-65%",
        description: "Reduction in design-to-code iteration cycles",
      },
    ],
    deliverables: [
      {
        title: "Semantic Token Taxonomy",
        description:
          "Three-tier token structure: primitive, semantic, and component-scoped variables.",
      },
      {
        title: "Accessible Primitive Library",
        description:
          "32 unstyled and accessible UI primitives with keyboard navigation traps and live regions.",
      },
      {
        title: "Automated Contrast Validator",
        description:
          "CI linter calculating WCAG 2.2 contrast ratios for any pull request modifying token values.",
      },
    ],
    problem:
      "Stride operated multiple enterprise products across banking and logistics, resulting in fractured user experiences, redundant CSS bundles totaling over 400KB per page, and persistent contrast regressions that failed federal accessibility audits.",
    solution:
      "Constructed a unified token pipeline where token changes originate in Figma and sync directly via GitHub Actions into CSS variables and TypeScript constants. Enforced zero-pill discipline and strict semantic color roles.",
    architecture: {
      stack: ["Next.js", "TypeScript", "Tailwind CSS v4", "Radix UI", "Vitest", "Playwright"],
      decisions: [
        "Used CSS custom properties instead of runtime CSS-in-JS to guarantee zero runtime overhead and instant theme switching.",
        "Employed fluid typography math with CSS clamp() rather than per-breakpoint font classes.",
        "Separated layout structural containers from presentational components to prevent unexpected horizontal overflow.",
      ],
    },
    sections: [
      {
        title: "The Token Architecture",
        subtitle: "Bridging mathematical precision and visual restraint",
        content: [
          "Tokens are organized into three distinct tiers: Global Primitives (raw scales), Semantic Roles (bg, surface, line, ink, accent), and Component Variables. Developers only reference semantic tokens, preventing hardcoded hex strings.",
          "Every color pair was run through automated contrast checks to verify a minimum 4.5:1 ratio for body copy and 3:1 for large text and interactive focus rings across all active themes.",
        ],
        takeaways: [
          "Zero runtime overhead via pure CSS custom properties.",
          "Mathematical typography scale using fluid clamp() functions.",
        ],
      },
      {
        title: "Accessible Primitives",
        subtitle: "Keyboard navigation and screen reader parity",
        content: [
          "Every interactive component underwent manual keyboard testing and automated axe-core scanning. Dialogs enforce focus traps with immediate Escape closure, and state transitions respect prefers-reduced-motion unconditionally.",
          "Interactive touch targets were enforced to meet or exceed 44×44px with 8px buffer margins.",
        ],
        takeaways: [
          "Tested with VoiceOver and NVDA across Chrome, Firefox, and Safari.",
          "Full focus retention on dialog mount and unmount.",
        ],
      },
    ],
    links: {
      live: "https://example.com/stride",
      github: "https://github.com/example/stride-design-system",
    },
  },
  {
    slug: "pulse-analytics",
    title: "Pulse Analytics Platform",
    tagline: "High-throughput real-time telemetry with sub-second insights.",
    category: "Full-Stack",
    featured: true,
    year: "2025",
    timeline: "4 months",
    role: "Full-Stack Architect",
    client: "Pulse Telemetry Inc",
    summary:
      "Architected and deployed a privacy-first web telemetry dashboard handling over 2M events daily with sub-second aggregations, zero cookie banners, and an ultra-lean 12KB client snippet.",
    coverImage: {
      src: "https://picsum.photos/seed/pulse-telemetry/1200/675",
      alt: "Pulse Analytics dashboard charts and realtime event counters",
      aspectRatio: "16/9",
    },
    tags: ["Next.js 15", "TypeScript", "TimescaleDB", "Server Components", "Tailwind CSS"],
    metrics: [
      {
        label: "Client Snippet Size",
        value: "1.8 KB",
        description: "Gzipped, zero third-party dependencies",
      },
      {
        label: "Query Latency",
        value: "< 45ms",
        description: "p95 time for 30-day analytics aggregation",
      },
      {
        label: "Lighthouse Score",
        value: "100 / 100",
        description: "Performance, Accessibility, Best Practices, and SEO",
      },
    ],
    deliverables: [
      {
        title: "Collector Micro-Service",
        description:
          "Lightweight ingestion endpoint processing buffered beacon requests with salted IP hashing.",
      },
      {
        title: "Streaming Server Component Dashboard",
        description: "Next.js App Router dashboard streaming telemetry queries via React Suspense.",
      },
      {
        title: "Custom SVG Chart Engine",
        description:
          "Lightweight, zero-library SVG charts rendering line and bar metrics with accessible ARIA tables.",
      },
    ],
    problem:
      "Legacy analytics tools loaded 150KB+ tracking scripts, required invasive consent banners, and suffered from 4-second dashboard load times that frustrated enterprise operations teams.",
    solution:
      "Built a custom privacy-friendly telemetry engine with salted hash IP anonymization and Next.js React Server Components. Aggregated charts render on the server and stream to clients with zero client-side charting libraries.",
    architecture: {
      stack: ["Next.js App Router", "TypeScript", "PostgreSQL", "Tailwind CSS v4", "Docker"],
      decisions: [
        "Eliminated client-side charting libraries (saved 280KB bundle size) by generating pure SVG markup on the server.",
        "Used salted cryptographic hashes for IP storage to guarantee zero personally identifiable information is stored.",
        "Employed streaming React Server Components to render the app shell instantly while historical data resolves.",
      ],
    },
    sections: [
      {
        title: "Server-Authoritative Rendering",
        subtitle: "Reducing bundle weight while preserving interactivity",
        content: [
          "Traditional web dashboards ship megabytes of client graphing libraries. Pulse computes SVG coordinate paths directly on the server, streaming lightweight SVG markup with inline data attributes.",
          "Client interaction is limited to a lightweight hover tooltip component under 3KB.",
        ],
        takeaways: [
          "First Load JS dropped from 320KB to 42KB.",
          "Sub-100ms dashboard paint on 3G network connections.",
        ],
      },
    ],
    links: {
      live: "https://example.com/pulse",
    },
  },
  {
    slug: "kanso-editorial",
    title: "Kanso Editorial Engine",
    tagline: "Distraction-free publishing platform powered by variable typography.",
    category: "Web Applications",
    featured: true,
    year: "2024–2025",
    timeline: "3 months",
    role: "Product Designer & Frontend Engineer",
    client: "Kanso Media",
    summary:
      "Designed and built an editorial publication focused on deep reading. Employs fluid optical-size variable typography, sub-1s LCP, and a distraction-free reader mode.",
    coverImage: {
      src: "https://picsum.photos/seed/kanso-editorial/1200/675",
      alt: "Kanso publication article view with large variable serif typography and clean margins",
      aspectRatio: "16/9",
    },
    tags: ["Typography", "Next.js", "Contentlayer", "Tailwind CSS", "Motion"],
    metrics: [
      {
        label: "Average Reading Time",
        value: "+42%",
        description: "Reader retention on long-form technical essays",
      },
      {
        label: "Largest Contentful Paint",
        value: "0.7s",
        description: "Measured on simulated 4G mobile devices",
      },
      {
        label: "Cumulative Layout Shift",
        value: "0.00",
        description: "Zero font flash or shifts during variable font load",
      },
    ],
    deliverables: [
      {
        title: "Variable Font Mechanics",
        description:
          "Dynamic optical size tuning adjusting font contrast and stem width based on viewport size.",
      },
      {
        title: "Progressive Markdown Parser",
        description:
          "Syntax-highlighted code blocks with copy confirmations and accessible line numbering.",
      },
      {
        title: "Adaptive Theme Engine",
        description:
          "High-contrast reading themes (Paper, Sepia, Charcoal, Deep Blue) with local preference persistence.",
      },
    ],
    problem:
      "Modern editorial sites are bogged down with popups, shifting ads, poor typographic measure, and illegible font sizes on small mobile screens.",
    solution:
      "Engineered an essay platform capped at 62 characters per line, utilizing Bricolage Grotesque variable axes to maintain optimal contrast across mobile and 4K displays.",
    architecture: {
      stack: ["Next.js", "React 19", "Tailwind CSS", "TypeScript", "Bricolage Grotesque"],
      decisions: [
        "Enforced 62ch max reading width with balanced text-wrap for comfortable eye tracking.",
        "Embedded self-hosted font subsets to eliminate third-party font network round-trips.",
        "Used CSS scroll-driven animations for minimal reading progress indicators.",
      ],
    },
    sections: [
      {
        title: "Typographic Rigor",
        subtitle: "62ch line lengths and fluid optical sizing",
        content: [
          "Line measure was constrained strictly between 50 and 65 characters. As screen widths expand, the optical size axis adjusts subtly to retain legibility without line-length bloat.",
          "Headings utilize text-wrap: balance, while body paragraphs use text-wrap: pretty to prevent orphan words.",
        ],
      },
    ],
    links: {
      live: "https://example.com/kanso",
      github: "https://github.com/example/kanso-editorial",
    },
  },
  {
    slug: "aurora-commerce",
    title: "Aurora Minimal Storefront",
    tagline: "Headless e-commerce with instantaneous page transitions.",
    category: "Full-Stack",
    featured: false,
    year: "2024",
    timeline: "5 months",
    role: "Full-Stack Developer",
    client: "Aurora Objects",
    summary:
      "Created an artisanal design store with instantaneous page navigation, optimistic cart mutations, and server-side payment processing.",
    coverImage: {
      src: "https://picsum.photos/seed/aurora-objects/1200/675",
      alt: "Aurora objects minimalist product detail page and clean cart sheet",
      aspectRatio: "16/9",
    },
    tags: ["Next.js", "Stripe API", "Zod", "Server Actions", "Tailwind CSS"],
    metrics: [
      {
        label: "Checkout Conversion",
        value: "+28%",
        description: "Improvement over previous monolithic storefront",
      },
      {
        label: "Cart Interaction Latency",
        value: "0ms",
        description: "Optimistic UI updates with server reconciliation",
      },
      {
        label: "Bundle Size",
        value: "68 KB",
        description: "Total gzipped JavaScript on product landing pages",
      },
    ],
    deliverables: [
      {
        title: "Optimistic Cart Architecture",
        description:
          "React 19 useOptimistic cart mutations ensuring immediate tactile feedback on mobile devices.",
      },
      {
        title: "Server Action Checkout Flow",
        description:
          "Cryptographically verified Stripe checkout sessions created entirely on the server with Zod validation.",
      },
      {
        title: "Responsive Product Media Grid",
        description:
          "Aspect-ratio locked responsive image gallery with zero layout shift during progressive image load.",
      },
    ],
    problem:
      "Client's existing e-commerce platform took 4.5 seconds to load and frequently lost cart states during spotty mobile network connections.",
    solution:
      "Rebuilt the entire purchasing funnel with Next.js Server Actions and optimistic local updates, ensuring cart operations work reliably even under slow 3G conditions.",
    architecture: {
      stack: ["Next.js App Router", "Stripe", "Tailwind CSS", "TypeScript", "Zod"],
      decisions: [
        "Handled all checkout pricing computations strictly server-side to prevent client price tampering.",
        "Used optimistic UI for add-to-cart actions with automatic rollback on network failure.",
      ],
    },
    sections: [
      {
        title: "Resilient Cart System",
        subtitle: "Zero-latency feedback on mobile connections",
        content: [
          "Users expect instantaneous feedback when adding items to their basket. Aurora uses optimistic updates so the UI responds in 0ms while the server action commits in the background.",
        ],
      },
    ],
    links: {
      live: "https://example.com/aurora",
    },
  },
  {
    slug: "bricolage-inspector",
    title: "Bricolage Variable Inspector",
    tagline: "Open-source variable typography testing playground.",
    category: "Open Source",
    featured: false,
    year: "2024",
    timeline: "1 month",
    role: "Creator & Maintainer",
    client: "Open Source Community",
    summary:
      "An open-source interactive playground allowing web designers to manipulate variable font axes (weight, width, optical size, slant) and export production-ready CSS custom properties.",
    coverImage: {
      src: "https://picsum.photos/seed/font-inspector/1200/675",
      alt: "Variable typography inspector sliders and real-time font specimen rendering",
      aspectRatio: "16/9",
    },
    tags: ["Open Source", "TypeScript", "Variable Fonts", "CSS Houdini", "Tooling"],
    metrics: [
      {
        label: "GitHub Stars",
        value: "850+",
        description: "Community adoption among frontend design engineers",
      },
      {
        label: "CSS Snippet Copies",
        value: "12,000+",
        description: "Production token configurations exported",
      },
    ],
    deliverables: [
      {
        title: "Real-time Axis Controller",
        description:
          "Zero-lag slider interfaces controlling font-variation-settings directly in the DOM.",
      },
      {
        title: "CSS Token Exporter",
        description:
          "One-click copy generator for CSS @font-face rules, token variables, and fluid clamp() utilities.",
      },
    ],
    problem:
      "Visualizing multi-axis variable fonts in developer tools is clunky and lacks one-click translation to clean Tailwind or CSS token configurations.",
    solution:
      "Built a focused web tool with keyboard shortcuts, preset comparisons, and instantaneous code generation.",
    architecture: {
      stack: ["React 19", "TypeScript", "Tailwind CSS", "Vite"],
      decisions: [
        "Manipulates CSS custom properties on root containers to avoid rerendering the React component tree on slider scrub.",
      ],
    },
    sections: [
      {
        title: "Performance Under Rapid Scrubbing",
        subtitle: "Bypassing React state for 120fps slider response",
        content: [
          "Slider events update CSS variables directly on DOM elements via style.setProperty(), allowing buttery smooth 120fps axis scrubbing without triggering React re-renders.",
        ],
      },
    ],
    links: {
      live: "https://example.com/inspector",
      github: "https://github.com/example/bricolage-inspector",
    },
  },
];

export function getAllProjects(): Project[] {
  return staticProjects;
}

export function getFeaturedProjects(): Project[] {
  return staticProjects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return staticProjects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const index = staticProjects.findIndex((p) => p.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  const prev = index > 0 ? (staticProjects[index - 1] ?? null) : null;
  const next = index < staticProjects.length - 1 ? (staticProjects[index + 1] ?? null) : null;
  return { prev, next };
}
