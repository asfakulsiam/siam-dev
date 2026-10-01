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
  heroCutout?: {
    light?: { publicId: string; alt: string };
    dark?: { publicId: string; alt: string };
  };
  activePhotoId?: string;
}

export const defaultCutoutLightSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
  <defs>
    <radialGradient id="cutoutLightFace" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="cutoutLightCoat" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
  </defs>
  <!-- Transparent Background Cutout (Light Background Tuning) -->
  <path d="M 120 1100 C 120 740 220 660 400 660 C 580 660 680 740 680 1100 Z" fill="url(#cutoutLightCoat)"/>
  <!-- Lapel & Shirt collar -->
  <polygon points="400,740 370,660 430,660" fill="#f8fafc"/>
  <rect x="350" y="520" width="100" height="160" rx="18" fill="url(#cutoutLightFace)"/>
  <ellipse cx="400" cy="400" rx="140" ry="180" fill="url(#cutoutLightFace)"/>
  <!-- Glasses -->
  <rect x="290" y="360" width="90" height="60" rx="8" fill="none" stroke="#2563eb" stroke-width="7"/>
  <rect x="420" y="360" width="90" height="60" rx="8" fill="none" stroke="#2563eb" stroke-width="7"/>
  <line x1="380" y1="390" x2="420" y2="390" stroke="#2563eb" stroke-width="7"/>
  <!-- Hair Silhouette -->
  <path d="M 260 360 C 260 220 320 200 400 200 C 480 200 540 220 540 360 C 510 260 460 240 400 240 C 340 240 290 260 260 360 Z" fill="#020617"/>
</svg>
`)}`;

export const defaultCutoutDarkSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
  <defs>
    <radialGradient id="cutoutDarkFace" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="60%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </radialGradient>
    <linearGradient id="cutoutDarkCoat" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <!-- Transparent Background Cutout (Dark Background Tuning) -->
  <path d="M 120 1100 C 120 740 220 660 400 660 C 580 660 680 740 680 1100 Z" fill="url(#cutoutDarkCoat)"/>
  <!-- Lapel & Accent Collar -->
  <polygon points="400,740 370,660 430,660" fill="#38bdf8" opacity="0.9"/>
  <rect x="350" y="520" width="100" height="160" rx="18" fill="url(#cutoutDarkFace)"/>
  <ellipse cx="400" cy="400" rx="140" ry="180" fill="url(#cutoutDarkFace)"/>
  <!-- Glasses -->
  <rect x="290" y="360" width="90" height="60" rx="8" fill="none" stroke="#f8fafc" stroke-width="7"/>
  <rect x="420" y="360" width="90" height="60" rx="8" fill="none" stroke="#f8fafc" stroke-width="7"/>
  <line x1="380" y1="390" x2="420" y2="390" stroke="#f8fafc" stroke-width="7"/>
  <!-- Hair Silhouette -->
  <path d="M 260 360 C 260 220 320 200 400 200 C 480 200 540 220 540 360 C 510 260 460 240 400 240 C 340 240 290 260 260 360 Z" fill="#090d16"/>
</svg>
`)}`;

export function getDefaultIdentityPhotoSVG(theme: string = "day-shift"): string {
  let bg1 = "#0b1220";
  let bg2 = "#121a2a";
  let bg3 = "#1e293b";
  let accent1 = "#8aa2ff";
  let accent2 = "#2f4bff";
  let labelBg = "#2f4bff";
  let labelText = "#ffffff";

  if (theme === "blueprint") {
    bg1 = "#1829c4";
    bg2 = "#1f33e6";
    bg3 = "#2b40f2";
    accent1 = "#ffe14d";
    accent2 = "#fde047";
    labelBg = "#ffe14d";
    labelText = "#0b1220";
  } else if (theme === "mono") {
    bg1 = "#000000";
    bg2 = "#18181b";
    bg3 = "#27272a";
    accent1 = "#ffffff";
    accent2 = "#e4e4e7";
    labelBg = "#ffffff";
    labelText = "#000000";
  } else if (theme === "charcoal" || theme === "night-coder-charcoal") {
    bg1 = "#151517";
    bg2 = "#1c1c1f";
    bg3 = "#2c2c30";
    accent1 = "#8aa2ff";
    accent2 = "#8aa2ff";
    labelBg = "#8aa2ff";
    labelText = "#0e0e10";
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="50%" stop-color="${bg2}"/>
      <stop offset="100%" stop-color="${bg3}"/>
    </linearGradient>
    <radialGradient id="faceGrad" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="60%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent1}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${accent2}" stop-opacity="0.9"/>
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
  <line x1="80" y1="200" x2="720" y2="200" stroke="${accent1}" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="6 6"/>
  <line x1="80" y1="520" x2="720" y2="520" stroke="${accent1}" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="4 4"/>
  <rect x="60" y="930" width="680" height="36" rx="6" fill="${labelBg}"/>
  <text x="400" y="954" text-anchor="middle" fill="${labelText}" font-family="monospace" font-size="16" font-weight="bold" letter-spacing="3">ASFAKUL // DESIGN-ENGINEER // PRIMARY</text>
</svg>
`)}`;
}

export function getDefaultSecondaryPhotoSVG(theme: string = "day-shift"): string {
  let secBg1 = "#1a2438";
  let secBg2 = "#0a0f1a";
  let secAccent = "#8aa2ff";

  if (theme === "blueprint") {
    secBg1 = "#2b40f2";
    secBg2 = "#1829c4";
    secAccent = "#ffe14d";
  } else if (theme === "mono") {
    secBg1 = "#27272a";
    secBg2 = "#09090b";
    secAccent = "#ffffff";
  } else if (theme === "charcoal" || theme === "night-coder-charcoal") {
    secBg1 = "#232326";
    secBg2 = "#151517";
    secAccent = "#8aa2ff";
  } else if (theme === "day-shift") {
    secBg1 = "#1e293b";
    secBg2 = "#0f172a";
    secAccent = "#2f4bff";
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 650" width="500" height="650">
  <defs>
    <linearGradient id="secBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${secBg1}"/>
      <stop offset="100%" stop-color="${secBg2}"/>
    </linearGradient>
    <radialGradient id="secFace" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="70%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
  </defs>
  <rect width="500" height="650" fill="url(#secBg)"/>
  <!-- Workspace Candid Silhouette -->
  <rect x="40" y="440" width="420" height="18" rx="4" fill="${secAccent}" opacity="0.8"/>
  <!-- Laptop on desk -->
  <polygon points="170,440 330,440 310,360 190,360" fill="#cbd5e1" opacity="0.9"/>
  <!-- Figure working -->
  <path d="M 120 650 C 120 500 200 450 250 450 C 300 450 380 500 380 650 Z" fill="#0f172a"/>
  <ellipse cx="250" cy="270" rx="75" ry="95" fill="url(#secFace)"/>
  <path d="M 175 250 C 175 160 210 140 250 140 C 290 140 325 160 325 250 C 305 180 280 170 250 170 C 220 170 195 180 175 250 Z" fill="#090d16"/>
  <text x="250" y="615" text-anchor="middle" fill="${secAccent}" font-family="monospace" font-size="12" font-weight="bold" letter-spacing="2">STUDIO / CANDID // 02</text>
</svg>
`)}`;
}

export const defaultIdentityPhotoSVG = getDefaultIdentityPhotoSVG("day-shift");
export const defaultSecondaryPhotoSVG = getDefaultSecondaryPhotoSVG("day-shift");

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
  heroCutout: {
    light: {
      publicId: defaultCutoutLightSVG,
      alt: "Asfakul architectural silhouette portrait (light)",
    },
    dark: {
      publicId: defaultCutoutDarkSVG,
      alt: "Asfakul architectural silhouette portrait (dark)",
    },
  },
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
