export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  location: string;
  type: "Full-Time" | "Contract" | "Open Source" | "Advisory";
  description: string;
  achievements: string[];
  skills: string[];
}

export interface PhilosophyPrinciple {
  title: string;
  statement: string;
  details: string;
}

export const staticExperience: ExperienceItem[] = [
  {
    id: "exp-1",
    role: "Senior Design Engineer",
    organization: "Independent Consultant",
    period: "2024 — Present",
    location: "Dhaka, Bangladesh · Remote",
    type: "Contract",
    description:
      "Partnering with growth-stage tech companies and founders to architect high-contrast design systems, rebuild slow web apps, and eliminate accessibility debt.",
    achievements: [
      "Engineered multi-brand token pipelines for 3 enterprise clients, cutting UI regression bugs by 70%.",
      "Mentored frontend engineering teams on semantic HTML, WCAG 2.2 AA audits, and zero-layout-shift web performance.",
      "Achieved sub-1s LCP and perfect 100/100 Lighthouse audits across client public web properties.",
    ],
    skills: ["Design Tokens", "Next.js", "TypeScript", "Tailwind CSS v4", "WCAG 2.2 AA", "GSAP"],
  },
  {
    id: "exp-2",
    role: "Full-Stack Engineer & UI Specialist",
    organization: "Nexora Systems",
    period: "2022 — 2024",
    location: "Dhaka, Bangladesh",
    type: "Full-Time",
    description:
      "Led the frontend architecture team for internal developer platforms and high-throughput real-time telemetry dashboards.",
    achievements: [
      "Spearheaded migration from legacy monolithic React SPA to Next.js App Router, decreasing first-load JavaScript by 65%.",
      "Designed and authored company-wide UI component library adhering strictly to a 4px mathematical grid.",
      "Built automated CI pipeline with Vitest and Playwright to catch accessibility and visual regressions before deployment.",
    ],
    skills: ["React", "Next.js", "Node.js", "PostgreSQL", "Docker", "Playwright"],
  },
  {
    id: "exp-3",
    role: "Web Designer & Frontend Developer",
    organization: "Studio Craft Digital",
    period: "2020 — 2022",
    location: "Dhaka, Bangladesh",
    type: "Full-Time",
    description:
      "Crafted bespoke editorial websites, digital publications, and brand identities for international clients.",
    achievements: [
      "Designed and developed 18+ custom responsive websites with high-fidelity typography and micro-interactions.",
      "Pioneered early adoption of CSS Custom Properties and fluid typography math, replacing bulky CSS frameworks.",
    ],
    skills: ["Web Design", "Typography", "CSS Grid & Flexbox", "JavaScript", "Figma"],
  },
];

export const staticPrinciples: PhilosophyPrinciple[] = [
  {
    title: "The Site is the Proof",
    statement:
      "Every pixel, transition, and touch target testifies to the engineer's respect for craft.",
    details:
      "A portfolio is not a place for sloppy spacing, arbitrary hex values, or janky animations. We earn credibility through unwavering attention to detail, tactile feedback, and flawless execution.",
  },
  {
    title: "Typography Before Decoration",
    statement:
      "Structure hierarchy with variable weight, width, and optical size rather than decorative clutter.",
    details:
      "We avoid generic AI tropes: no unnecessary badge pills, no decorative numbering, no random gradient blobs. One considered variable typeface (Bricolage Grotesque) does the heavy lifting.",
  },
  {
    title: "Performance is an Ethical Choice",
    statement: "Fast websites respect the user's battery, mobile data, and cognitive load.",
    details:
      "Zero layout thrash (CLS ≤ 0.05), sub-2 second Largest Contentful Paint on mobile connections, and minimal client-side JavaScript. Keep server code on the server.",
  },
  {
    title: "Uncompromising Accessibility",
    statement: "Digital experiences must be welcoming, navigable, and legible to every human.",
    details:
      "Contrast ratios rigorously meeting WCAG 2.2 AA standards across all themes, robust keyboard navigation, visible focus rings, logical tab order, and full respect for prefers-reduced-motion.",
  },
];
