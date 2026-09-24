export interface SocialLink {
  label: string;
  url: string;
}

export interface ToolboxGroup {
  group: string;
  items: string[];
}

export interface ProfileData {
  name: string;
  headline: string;
  subheadline: string;
  bio: string;
  location: string;
  timezone: string;
  availability: {
    open: boolean;
    text: string;
  };
  email: string;
  phone?: string;
  socials: SocialLink[];
  resume: {
    url: string;
    updatedAt: string;
  };
  now: {
    title: string;
    body: string;
    links?: SocialLink[];
    updatedAt: string;
  };
  toolbox: ToolboxGroup[];
}

export const staticProfile: ProfileData = {
  name: "Asfakul",
  headline: "I design and build websites that feel considered.",
  subheadline: "Web designer and full-stack developer in Bangladesh.",
  bio: "I craft digital products that sit comfortably at the intersection of intentional typography, disciplined engineering, and high-contrast usability. With hands-on experience across both design systems and production full-stack architectures, I build applications that prioritize correctness, speed, and lasting visual weight.",
  location: "Dhaka, Bangladesh",
  timezone: "Asia/Dhaka",
  availability: {
    open: true,
    text: "Open for full-stack engineering & design system contracts (Q4 2026)",
  },
  email: "hello@asfakul.com",
  socials: [
    { label: "GitHub", url: "https://github.com" },
    { label: "LinkedIn", url: "https://linkedin.com" },
  ],
  resume: {
    url: "https://drive.google.com",
    updatedAt: "September 2026",
  },
  now: {
    title: "Variable Typography & Next-Gen Micro-Interactions",
    body: "Refining fluid optical-size font mechanics and high-performance scroll storytelling. Exploring zero-runtime animation techniques that honor battery and accessibility limits.",
    updatedAt: "September 2026",
    links: [{ label: "View Colophon Specimen", url: "/colophon" }],
  },
  toolbox: [
    {
      group: "Design & Systems",
      items: ["Design Tokens", "Bricolage Variable Type", "Figma", "WCAG 2.2 AA", "Grid Math"],
    },
    {
      group: "Frontend Architecture",
      items: [
        "Next.js 15 (App Router)",
        "React 19",
        "TypeScript",
        "Tailwind CSS v4",
        "GSAP + ScrollTrigger",
        "Lenis",
      ],
    },
    {
      group: "Backend & Data",
      items: ["MongoDB Atlas", "Zod Validation", "Auth.js (NextAuth)", "Resend", "Cloudinary SDK"],
    },
    {
      group: "Quality & Testing",
      items: ["Vitest", "Playwright", "@axe-core/playwright", "Lighthouse CI", "GitHub Actions"],
    },
  ],
};
