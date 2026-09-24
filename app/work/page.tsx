import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Badge } from "@/components/ui/Badge";
import { getProjects } from "@/features/projects/queries";
import { WorkGallery } from "@/features/projects/components/WorkGallery";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Selected Work & Case Studies",
  description:
    "Selected design systems, full-stack web applications, and open-source tooling case studies by Asfakul.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Selected Work & Case Studies | Asfakul — Dev Den",
    description:
      "Selected design systems, full-stack web applications, and open-source tooling case studies by Asfakul.",
    url: `${siteConfig.url}/work`,
    type: "website",
    images: [
      {
        url: "/api/og?title=Selected+Work+%26+Case+Studies&category=Portfolio+Archive&description=In-depth+engineering+and+design+breakdowns+with+verified+production+metrics.",
        width: 1200,
        height: 630,
        alt: "Asfakul Work Showcase OpenGraph Card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selected Work & Case Studies | Asfakul — Dev Den",
    description:
      "Selected design systems, full-stack web applications, and open-source tooling case studies by Asfakul.",
    images: [
      "/api/og?title=Selected+Work+%26+Case+Studies&category=Portfolio+Archive&description=In-depth+engineering+and+design+breakdowns+with+verified+production+metrics.",
    ],
  },
};

export default async function WorkPage() {
  const projects = await getProjects({ publishedOnly: true });

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20">
      <Section spacing="compact">
        <Container className="space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-[var(--line)] pb-8">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Case Studies</Badge>
              <span className="text-xs text-[var(--ink-muted)] font-mono">
                {projects.length} Published Projects
              </span>
            </div>
            <Heading as="h1" size="4xl" className="tracking-tight">
              Selected Work
            </Heading>
            <Text size="lg" variant="muted" className="max-w-2xl text-pretty leading-relaxed">
              In-depth engineering and design breakdowns. Each case study documents the
              architectural constraints, token implementations, trade-offs, and verified production
              metrics.
            </Text>
          </div>

          {/* Interactive Project Gallery */}
          <WorkGallery initialProjects={projects} />
        </Container>
      </Section>
    </main>
  );
}
