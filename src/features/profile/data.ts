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
  accentColor?: string;
  role: "hero-primary" | "hero-secondary" | "unassigned";
}

export const DEFAULT_AVATAR_ID = "default-avatar";

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
      <stop offset="50%" stop-color="#121a2a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <radialGradient id="faceGrad" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="60%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8aa2ff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#2f4bff" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bgGrad)"/>
  <!-- Minimalist Architectural Studio Portrait -->
  <path d="M 140 1000 C 140 700 240 640 400 640 C 560 640 660 700 660 1000 Z" fill="#0f172a" opacity="0.95"/>
  <rect x="350" y="490" width="100" height="170" rx="20" fill="url(#faceGrad)"/>
  <ellipse cx="400" cy="380" rx="135" ry="175" fill="url(#faceGrad)"/>
  <rect x="290" y="340" width="90" height="60" rx="8" fill="none" stroke="#f8fafc" stroke-width="7"/>
  <rect x="420" y="340" width="90" height="60" rx="8" fill="none" stroke="#f8fafc" stroke-width="7"/>
  <line x1="380" y1="370" x2="420" y2="370" stroke="#f8fafc" stroke-width="7"/>
  <path d="M 265 340 C 265 200 320 180 400 180 C 480 180 535 200 535 340 C 505 240 455 220 400 220 C 345 220 295 240 265 340 Z" fill="#090d16"/>
  <line x1="80" y1="200" x2="720" y2="200" stroke="#8aa2ff" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 6"/>
  <line x1="80" y1="520" x2="720" y2="520" stroke="#8aa2ff" stroke-width="1.5" stroke-opacity="0.2" stroke-dasharray="4 4"/>
  <rect x="60" y="930" width="680" height="36" rx="6" fill="url(#accentGrad)"/>
  <text x="400" y="954" text-anchor="middle" fill="#0a0f1a" font-family="monospace" font-size="16" font-weight="bold" letter-spacing="3">ASFAKUL // DESIGN-ENGINEER // PRIMARY</text>
</svg>
`)}`;

export const defaultSecondaryPhotoSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 650" width="500" height="650">
  <defs>
    <linearGradient id="secBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a2438"/>
      <stop offset="100%" stop-color="#0a0f1a"/>
    </linearGradient>
    <radialGradient id="secFace" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="70%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
  </defs>
  <rect width="500" height="650" fill="url(#secBg)"/>
  <!-- Workspace Candid Silhouette -->
  <rect x="40" y="440" width="420" height="18" rx="4" fill="#8aa2ff" opacity="0.7"/>
  <!-- Laptop on desk -->
  <polygon points="170,440 330,440 310,360 190,360" fill="#cbd5e1" opacity="0.9"/>
  <!-- Figure working -->
  <path d="M 120 650 C 120 500 200 450 250 450 C 300 450 380 500 380 650 Z" fill="#0f172a"/>
  <ellipse cx="250" cy="270" rx="75" ry="95" fill="url(#secFace)"/>
  <path d="M 175 250 C 175 160 210 140 250 140 C 290 140 325 160 325 250 C 305 180 280 170 250 170 C 220 170 195 180 175 250 Z" fill="#090d16"/>
  <text x="250" y="615" text-anchor="middle" fill="#8aa2ff" font-family="monospace" font-size="12" font-weight="bold" letter-spacing="2">STUDIO / CANDID // 02</text>
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
    text: "Open for contracts (Q4 2026)",
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
      accentColor: "#2F4BFF",
      role: "hero-primary",
    },
    {
      publicId: defaultSecondaryPhotoSVG,
      alt: "Asfakul candid at design workstation",
      mood: "candid",
      accentColor: "#8AA2FF",
      role: "hero-secondary",
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
