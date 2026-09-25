import type { Metadata } from "next";
import Link from "next/link";
import { Download, ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getProfile } from "@/features/profile/queries";
import { getExperience, getPrinciples } from "@/features/experience/queries";
import { ExperienceTimeline } from "@/features/about/components/ExperienceTimeline";
import { ToolboxGrid } from "@/features/about/components/ToolboxGrid";
import { NowCard } from "@/features/about/components/NowCard";
import { DuotoneBackdrop } from "@/components/motion/DuotoneBackdrop";
import { siteConfig } from "@/config/site";
import { generateProfilePageJsonLd, JsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "About & Philosophy",
  description:
    "Background, experience, engineering philosophy, and technical toolbox of Asfakul, full-stack developer and web designer based in Bangladesh.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Asfakul — Web Designer & Full-Stack Developer",
    description:
      "Background, experience, engineering philosophy, and technical toolbox of Asfakul, full-stack developer and web designer.",
    url: `${siteConfig.url}/about`,
    type: "profile",
    images: [
      {
        url: "/api/og?title=About+Asfakul&category=Background+%26+Philosophy&description=Designer+who+codes.+Developer+who+designs.+Building+considered+web+applications.",
        width: 1200,
        height: 630,
        alt: "About Asfakul OpenGraph Card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Asfakul — Web Designer & Full-Stack Developer",
    description:
      "Background, experience, engineering philosophy, and technical toolbox of Asfakul, full-stack developer and web designer.",
    images: [
      "/api/og?title=About+Asfakul&category=Background+%26+Philosophy&description=Designer+who+codes.+Developer+who+designs.+Building+considered+web+applications.",
    ],
  },
};

export default async function AboutPage() {
  const [profile, experience, principles] = await Promise.all([
    getProfile(),
    getExperience(),
    getPrinciples(),
  ]);

  const profileJsonLd = generateProfilePageJsonLd();

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-20">
      {/* Schema.org ProfilePage Structured Data */}
      <JsonLd data={profileJsonLd as unknown as Record<string, unknown>} />

      {/* 1. Profile Header with subtle ambient duotone identity backdrop */}
      <Section spacing="compact" className="relative">
        <DuotoneBackdrop photoUrl={profile.activePhotoId} />
        <Container size="narrow" className="space-y-8 relative z-10">
          <div className="space-y-4 border-b border-[var(--line)] pb-8 bg-[var(--surface)]/90 backdrop-blur-xs p-6 sm:p-8 rounded-[var(--r-md)] border border-[var(--line)]">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">Profile & Craft</Badge>
              <span className="text-xs text-[var(--ink-muted)] font-mono">{profile.location}</span>
            </div>
            <Heading as="h1" size="display" className="tracking-tight text-[var(--ink)]">
              Designer who codes. Developer who designs.
            </Heading>
            <Text size="xl" variant="muted" className="leading-relaxed text-pretty">
              {profile.bio}
            </Text>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href={profile.resume.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center"
              >
                <Button variant="primary" size="md">
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>Download Resume</span>
                </Button>
              </a>
              <Link href="/contact">
                <Button variant="outline" size="md">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. Now Focus Card */}
      <Section spacing="compact">
        <Container size="narrow">
          <NowCard now={profile.now} location={profile.location} />
        </Container>
      </Section>

      {/* 3. Principles of Craft */}
      <Section spacing="compact">
        <Container size="narrow" className="space-y-8">
          <div className="space-y-2 border-b border-[var(--line)] pb-4">
            <Badge variant="outline">Philosophy</Badge>
            <Heading as="h2" size="3xl">
              Principles of Craft
            </Heading>
            <Text size="base" variant="muted">
              Non-negotiable standards applied to every codebase, layout, and user interaction.
            </Text>
          </div>
          <div className="space-y-6">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="p-6 sm:p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-2"
              >
                <h3 className="text-lg font-bold text-[var(--ink)]">{principle.title}</h3>
                <p className="text-sm font-semibold text-[var(--accent)]">{principle.statement}</p>
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed pt-1">
                  {principle.details}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. Career Experience Timeline */}
      <Section spacing="compact">
        <Container size="narrow" className="space-y-8">
          <div className="space-y-2 border-b border-[var(--line)] pb-4">
            <Badge variant="outline">Career</Badge>
            <Heading as="h2" size="3xl">
              Experience & Roles
            </Heading>
            <Text size="base" variant="muted">
              Track record building production web architectures and client solutions.
            </Text>
          </div>
          <ExperienceTimeline items={experience} />
        </Container>
      </Section>

      {/* 5. Categorized Toolbox */}
      <Section spacing="compact">
        <Container size="narrow" className="space-y-8">
          <div className="space-y-2 border-b border-[var(--line)] pb-4">
            <Badge variant="outline">Capabilities</Badge>
            <Heading as="h2" size="3xl">
              Toolbox & Stack
            </Heading>
            <Text size="base" variant="muted">
              Languages, libraries, design standards, and operational tools used day to day.
            </Text>
          </div>
          <ToolboxGrid groups={profile.toolbox} />
        </Container>
      </Section>

      {/* 6. Footer Navigation to Work */}
      <Section spacing="compact" className="border-t border-[var(--line)] mt-8">
        <Container
          size="narrow"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--ink)]">See the work in action</h3>
            <p className="text-sm text-[var(--ink-muted)]">
              Explore documented case studies and technical breakdowns.
            </p>
          </div>
          <Link href="/work">
            <Button variant="primary" size="md">
              <span>View Case Studies</span>
              <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-80" aria-hidden="true" />
            </Button>
          </Link>
        </Container>
      </Section>
    </main>
  );
}
