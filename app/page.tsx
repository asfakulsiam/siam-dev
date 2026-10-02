import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getFeaturedProjects } from "@/features/projects/queries";
import { getPrinciples } from "@/features/experience/queries";
import { getProfile } from "@/features/profile/queries";
import { getTestimonials } from "@/features/testimonials/queries";
import { getSettings } from "@/features/appearance/queries";
import { NowCard } from "@/features/about/components/NowCard";
import { SplitHero } from "@/components/motion/SplitHero";
import { CutoutHero } from "@/components/motion/CutoutHero";
import { PinnedWorkStack } from "@/components/motion/PinnedWorkStack";
import { ScrubbedStatement } from "@/components/motion/ScrubbedStatement";
import { TestimonialScroll } from "@/components/motion/TestimonialScroll";

export default async function HomePage() {
  const [featuredProjects, profile, principles, testimonials, settings] = await Promise.all([
    getFeaturedProjects(),
    getProfile(),
    getPrinciples(),
    getTestimonials(true),
    getSettings(),
  ]);

  const heroStyle = settings.heroStyle || "cutout";

  // Resolve hero photos strictly by role (hero-primary and hero-secondary)
  // If zero photos hold hero-primary, fallback to activePhoto if valid, or null for clean text-only layout
  const primaryPhoto =
    profile.photos?.find((p) => p.role === "hero-primary") ||
    (profile.photos?.find((p) => p.publicId === profile.activePhotoId && p.publicId !== "default-avatar") ??
      null);

  const secondaryPhoto =
    profile.photos?.find((p) => p.role === "hero-secondary") ?? null;

  const heroMetaRow = (
    <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-[var(--ink-muted)]">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            profile.availability?.open ?? true
              ? "bg-[var(--success)] animate-pulse"
              : "bg-[var(--line)]"
          }`}
          aria-hidden="true"
        />
        <span className="text-[var(--ink)] font-medium">
          {profile.availability?.open ?? true
            ? profile.availability?.text && profile.availability.text.length <= 32
              ? profile.availability.text
              : "Available for contracts"
            : "Unavailable"}
        </span>
      </div>
      <span className="text-[var(--line)] select-none">/</span>
      <span>{profile.location ? profile.location.split(",")[0] : "Dhaka"}</span>
      <span className="text-[var(--line)] select-none">/</span>
      <span>Design &amp; Engineering</span>
    </div>
  );

  const heroActions = (
    <div className="flex flex-wrap items-center gap-3.5 pt-1">
      <Link href="/work">
        <Button size="lg" variant="primary" data-cursor-text="View">
          <span>Explore Work</span>
          <ArrowUpRight className="w-4 h-4 ml-1 opacity-70" aria-hidden="true" />
        </Button>
      </Link>
      <Link href="/contact">
        <Button size="lg" variant="outline" data-cursor-text="Say Hi">
          Get in Touch
        </Button>
      </Link>
    </div>
  );

  return (
    <main id="main-content" className="flex-1 flex flex-col">
      {/* 1. Hero Section (100svh) — Admin-Switchable Presentation (Cutout vs Split Frame) */}
      <section className="min-h-[100svh] flex flex-col justify-between pt-16 sm:pt-20 pb-4 sm:pb-6 relative overflow-hidden">
        <Container className="flex-1 flex flex-col justify-center pb-2 sm:pb-4 relative z-10">
          {heroStyle === "cutout" ? (
            <CutoutHero
              name={profile.name}
              headline={profile.headline}
              subheadline={profile.subheadline}
              bio={profile.bio}
              heroProfiles={profile.heroProfiles}
              cutout={profile.heroCutout}
              cutoutPhoto={profile.heroCutout?.light ?? null}
              metaRow={heroMetaRow}
              actions={heroActions}
            />
          ) : (
            <SplitHero
              name={profile.name}
              headline={profile.headline}
              subheadline={profile.subheadline}
              bio={profile.bio}
              heroPrimary={profile.heroPrimary}
              heroSecondary={profile.heroSecondary}
              primaryPhoto={primaryPhoto}
              secondaryPhoto={secondaryPhoto}
              metaRow={heroMetaRow}
              actions={heroActions}
            />
          )}
        </Container>

        {/* Scroll Cue */}
        <Container className="pt-4 sm:pt-6 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--ink-muted)]">
          <div className="flex items-center gap-2 font-mono">
            <ArrowDown
              className="w-3.5 h-3.5 animate-bounce text-[var(--accent)]"
              aria-hidden="true"
            />
            <span>Scroll for selected projects</span>
          </div>
          <span className="font-mono text-[var(--ink-muted)]">Asia/Dhaka</span>
        </Container>
      </section>

      {/* 2. Featured Projects Section */}
      <Section spacing="default" className="border-t border-[var(--line)] bg-[var(--surface)]">
        <Container className="space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[var(--line)] pb-8">
            <div className="space-y-2">
              <Badge variant="outline">Selected Work</Badge>
              <Heading as="h2" size="3xl">
                Featured Case Studies
              </Heading>
            </div>
            <div className="flex items-center gap-4">
              <Text size="sm" variant="muted" className="max-w-md">
                Detailed breakdowns of problems, design decisions, token architecture, and
                measurable impact.
              </Text>
              <Link href="/work" className="shrink-0">
                <Button variant="outline" size="sm">
                  View All ({featuredProjects.length + 2})
                </Button>
              </Link>
            </div>
          </div>

          {/* Featured Work Pinned Stack (M4) */}
          <PinnedWorkStack projects={featuredProjects} />
        </Container>
      </Section>

      {/* 3. Principles of Craft */}
      <Section spacing="default" className="border-t border-[var(--line)]">
        <Container className="space-y-12">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="outline">Philosophy</Badge>
            <Heading as="h2" size="3xl">
              Principles of Craft
            </Heading>
            <Text size="lg" variant="muted">
              Rules and design tenets developed across six years of engineering production web
              applications.
            </Text>
          </div>

          {/* Scrubbed Philosophy Statement (M5) */}
          <div className="p-8 sm:p-12 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]">
            <ScrubbedStatement
              text="Craft is the feature. In an ecosystem inundated with generic AI templates, meticulous typographic rhythm, token discipline, and uncompromising performance are the definitive proof of engineering excellence."
              statementClassName="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] leading-snug tracking-tight"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4 hover:border-[var(--ink-muted)] transition-colors"
              >
                <h3 className="text-xl font-bold text-[var(--ink)]">{principle.title}</h3>
                <p className="text-sm font-semibold text-[var(--accent)]">{principle.statement}</p>
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                  {principle.details}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. Endorsements & Testimonials (Scroll scrub reveal Phase I) */}
      <TestimonialScroll testimonials={testimonials} />

      {/* 5. Currently / Now & Availability */}
      <Section spacing="default" className="border-t border-[var(--line)] bg-[var(--surface)]">
        <Container className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="outline">Status & Exploration</Badge>
              <Heading as="h2" size="2xl">
                Active Focus
              </Heading>
            </div>
            <Link href="/about">
              <Button variant="ghost" size="sm">
                Full Profile & Toolbox
              </Button>
            </Link>
          </div>

          <NowCard now={profile.now} location={profile.location} />
        </Container>
      </Section>

      {/* 5. Contact Callout Banner */}
      <Section spacing="default" className="border-t border-[var(--line)]">
        <Container>
          <div className="p-8 sm:p-12 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <Heading as="h2" size="2xl">
                Let&apos;s build something considered.
              </Heading>
              <Text size="base" variant="muted">
                Available for full-stack engineering contracts, design system architecture, and
                performance audits.
              </Text>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/contact">
                <Button size="lg" variant="primary">
                  Get in Touch
                </Button>
              </Link>
              <a href={`mailto:${profile.email}`}>
                <Button size="lg" variant="outline">
                  {profile.email}
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
