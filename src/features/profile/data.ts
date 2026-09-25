export interface SocialLink {
  label: string;
  url: string;
}

export interface ToolboxGroup {
  group: string;
  items: string[];
}

export interface ProfilePhoto {
  publicId: string;
  alt: string;
  mood?: string;
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
  photos: ProfilePhoto[];
  activePhotoId?: string;
}

export const defaultIdentityPhotoSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1220"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <radialGradient id="faceGrad" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="60%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bgGrad)"/>
  <!-- Minimalist Architectural Portrait Silhouette -->
  <!-- Shoulders -->
  <path d="M 150 900 C 150 680 260 620 400 620 C 540 620 650 680 650 900 Z" fill="#0f172a" opacity="0.95"/>
  <!-- Neck -->
  <rect x="350" y="480" width="100" height="180" rx="20" fill="url(#faceGrad)"/>
  <!-- Face Oval -->
  <ellipse cx="400" cy="380" rx="140" ry="180" fill="url(#faceGrad)"/>
  <!-- Minimalist Glasses -->
  <rect x="290" y="340" width="90" height="60" rx="8" fill="none" stroke="#f8fafc" stroke-width="8"/>
  <rect x="420" y="340" width="90" height="60" rx="8" fill="none" stroke="#f8fafc" stroke-width="8"/>
  <line x1="380" y1="370" x2="420" y2="370" stroke="#f8fafc" stroke-width="8"/>
  <!-- Hair Silhouette -->
  <path d="M 260 340 C 260 200 320 180 400 180 C 480 180 540 200 540 340 C 510 240 460 220 400 220 C 340 220 290 240 260 340 Z" fill="#090d16"/>
  <!-- Code Geometry / Design Overlays -->
  <line x1="100" y1="200" x2="700" y2="200" stroke="rgba(56,189,248,0.2)" stroke-width="2" stroke-dasharray="8 8"/>
  <line x1="100" y1="500" x2="700" y2="500" stroke="rgba(56,189,248,0.15)" stroke-width="2" stroke-dasharray="4 4"/>
  <text x="400" y="960" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="24" font-weight="bold" letter-spacing="4">ASFAKUL // DESIGN-DEV</text>
</svg>
`)}`;

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
  photos: [
    {
      publicId: defaultIdentityPhotoSVG,
      alt: "Asfakul in studio lighting with high-contrast architectural silhouette",
      mood: "working",
    },
  ],
  activePhotoId: defaultIdentityPhotoSVG,
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
      items: ["MongoDB Atlas", "Zod Validation", "Custom HMAC Session", "Resend", "Cloudinary SDK"],
    },
    {
      group: "Quality & Testing",
      items: ["Vitest", "Playwright", "@axe-core/playwright", "Lighthouse CI", "GitHub Actions"],
    },
  ],
};
