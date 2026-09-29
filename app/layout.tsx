import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/motion/Cursor";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { siteConfig } from "@/config/site";
import { generatePersonJsonLd, generateWebSiteJsonLd, JsonLd } from "@/lib/json-ld";
import { getSettings } from "@/features/appearance/queries";
import { getProfile } from "@/features/profile/queries";
import fs from "fs";
import path from "path";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Asfakul — Web Designer & Full-Stack Developer | Dev Den",
    template: "%s | Asfakul — Dev Den",
  },
  description: siteConfig.description,
  keywords: [
    "Asfakul",
    "Web Designer",
    "Full-Stack Developer",
    "Design Engineer",
    "Portfolio",
    "React",
    "Next.js",
    "Tailwind CSS",
    "GSAP",
    "TypeScript",
    "Bangladesh",
  ],
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Asfakul — Web Designer & Full-Stack Developer | Dev Den",
    description: siteConfig.description,
    siteName: "Dev Den — Asfakul Portfolio",
    images: [
      {
        url: "/api/og?title=Asfakul&category=Web+Designer+%26+Full-Stack+Developer&description=Craft%2C+typography%2C+and+considered+web+applications.",
        width: 1200,
        height: 630,
        alt: "Asfakul — Web Designer & Full-Stack Developer Portfolio Card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asfakul — Web Designer & Full-Stack Developer | Dev Den",
    description: siteConfig.description,
    images: [
      "/api/og?title=Asfakul&category=Web+Designer+%26+Full-Stack+Developer&description=Craft%2C+typography%2C+and+considered+web+applications.",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, profile] = await Promise.all([
    getSettings(),
    getProfile(),
  ]);
  const fallbackTheme = settings.defaultTheme || "day-shift";
  const personJsonLd = generatePersonJsonLd(profile);
  const websiteJsonLd = generateWebSiteJsonLd();

  const dynamicThemeScript = `(function() {
  try {
    var stored = localStorage.getItem('devden-theme');
    var theme = stored;
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night-coder' : '${fallbackTheme}';
    }
    document.documentElement.setAttribute('data-theme', theme);
    var themeColors = {
      'day-shift': '#f4f6fa',
      'night-coder': '#0a0f1a',
      'charcoal': '#151517',
      'blueprint': '#1f33e6',
      'mono': '#ffffff'
    };
    var metaTheme = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    if (themeColors[theme]) {
      metaTheme.setAttribute('content', themeColors[theme]);
    }
  } catch (e) {
    document.documentElement.setAttribute('data-theme', '${fallbackTheme}');
  }
})();`;

  let inlineCss = "";
  try {
    const cssPath = path.resolve(process.cwd(), "public/css/globals.css");
    if (fs.existsSync(cssPath)) {
      inlineCss = fs.readFileSync(cssPath, "utf8");
    }
  } catch {
    // Fallback if file read fails
  }

  return (
    <html
      lang="en"
      data-theme={fallbackTheme}
      suppressHydrationWarning
      className={`${bricolage.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: dynamicThemeScript }} />
        <JsonLd data={personJsonLd as unknown as Record<string, unknown>} />
        <JsonLd data={websiteJsonLd as unknown as Record<string, unknown>} />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased flex flex-col min-h-screen">
        {inlineCss && (
          <style
            id="devden-theme-tokens"
            dangerouslySetInnerHTML={{ __html: inlineCss }}
          />
        )}
        <LenisProvider>
          <Cursor />
          <Header profile={profile} />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer profile={profile} />
        </LenisProvider>
      </body>
    </html>
  );
}
