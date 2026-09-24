import type { Metadata } from "next";
import "./globals.css"; // Global styles

export const metadata: Metadata = {
  title: "Asfakul — Web Designer & Full-Stack Developer | Dev Den",
  description:
    "Personal portfolio of Asfakul, a web designer and full-stack developer based in Bangladesh. Craft, typography, and considered web applications.",
  openGraph: {
    title: "Asfakul — Web Designer & Full-Stack Developer | Dev Den",
    description:
      "Personal portfolio of Asfakul, a web designer and full-stack developer based in Bangladesh. Craft, typography, and considered web applications.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asfakul — Web Designer & Full-Stack Developer | Dev Den",
    description:
      "Personal portfolio of Asfakul, a web designer and full-stack developer based in Bangladesh. Craft, typography, and considered web applications.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
