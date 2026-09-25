import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Heading, Text } from "@/components/ui/Heading";
import { Badge } from "@/components/ui/Badge";
import { PortfolioImage } from "@/components/ui/PortfolioImage";
import {
  getProjectBySlug,
  getAllProjectSlugs,
  getAdjacentProjects,
} from "@/features/projects/queries";
import { ProjectMetrics } from "@/features/projects/components/ProjectMetrics";
import { siteConfig } from "@/config/site";
import { generateProjectJsonLd, JsonLd } from "@/lib/json-ld";

interface CaseStudyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested case study could not be found.",
    };
  }

  const ogUrl = `/api/og?title=${encodeURIComponent(project.title)}&category=${encodeURIComponent(project.category)}&description=${encodeURIComponent(project.tagline || project.summary)}`;

  return {
    title: `${project.title} — ${project.category} Case Study`,
    description: project.summary,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
    openGraph: {
      title: `${project.title} — Case Study | Asfakul`,
      description: project.summary,
      url: `${siteConfig.url}/work/${project.slug}`,
      type: "article",
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `${project.title} Case Study Card`,
        },
        {
          url: project.coverImage.src,
          alt: project.coverImage.alt || project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Case Study | Asfakul`,
      description: project.summary,
      images: [ogUrl],
    },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { prev, next } = await getAdjacentProjects(slug);
  const projectJsonLd = generateProjectJsonLd(project);

  return (
    <main id="main-content" className="flex-1 py-12 md:py-20 space-y-16 sm:space-y-24">
      {/* Schema.org JSON-LD Structured Data */}
      <JsonLd data={projectJsonLd as unknown as Record<string, unknown>} />

      {/* 1. Header & Hero Meta */}
      <Section spacing="compact">
        <Container className="space-y-8 sm:space-y-12">
          {/* Back Navigation */}
          <div>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors focus:outline-none focus-visible:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all projects</span>
            </Link>
          </div>

          {/* Project Title and Tagline */}
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{project.category}</Badge>
              <span className="text-xs font-mono text-[var(--ink-muted)]">
                {project.year} · {project.timeline}
              </span>
            </div>

            <Heading as="h1" size="4xl" className="tracking-tight text-[var(--ink)]">
              {project.title}
            </Heading>

            <Text size="xl" variant="muted" className="leading-relaxed">
              {project.tagline}
            </Text>
          </div>

          {/* Meta Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                Role
              </span>
              <p className="text-sm font-semibold text-[var(--ink)]">{project.role}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                Client / Team
              </span>
              <p className="text-sm font-semibold text-[var(--ink)]">{project.client}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                Timeline
              </span>
              <p className="text-sm font-semibold text-[var(--ink)]">{project.timeline}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                Links
              </span>
              <div className="flex items-center gap-3 pt-0.5">
                {project.links?.live && (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {project.links?.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[var(--ink-muted)] hover:text-[var(--ink)] inline-flex items-center gap-1"
                  >
                    <Github className="w-3 h-3" />
                    <span>Code</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. Hero Visual Showcase */}
      <Section spacing="compact">
        <Container>
          <PortfolioImage
            src={project.coverImage.src}
            alt={project.coverImage.alt || `${project.title} Hero visual`}
            aspectRatio="21/9"
            priority={true}
            sizes="(max-width: 1200px) 100vw, 1280px"
            containerClassName="shadow-xs"
          />
        </Container>
      </Section>

      {/* Project Impact Metrics */}
      {project.metrics && project.metrics.length > 0 && (
        <Section spacing="compact">
          <Container>
            <ProjectMetrics metrics={project.metrics} />
          </Container>
        </Section>
      )}

      {/* 3. The Challenge & The Solution */}
      <Section spacing="compact">
        <Container className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* The Problem */}
          <div className="space-y-4 p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <Badge variant="warning">The Challenge</Badge>
            </div>
            <Heading as="h2" size="2xl">
              Problem & Constraints
            </Heading>
            <Text size="base" variant="muted" className="leading-relaxed">
              {project.problem}
            </Text>
          </div>

          {/* The Solution */}
          <div className="space-y-4 p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <Badge variant="success">The Solution</Badge>
            </div>
            <Heading as="h2" size="2xl">
              Architectural Approach
            </Heading>
            <Text size="base" variant="muted" className="leading-relaxed">
              {project.solution}
            </Text>
          </div>
        </Container>
      </Section>

      {/* 4. Architecture & Technical Decisions */}
      <Section spacing="compact">
        <Container className="space-y-8">
          <div className="space-y-2 border-b border-[var(--line)] pb-4">
            <Badge variant="outline">Engineering Stack</Badge>
            <Heading as="h2" size="2xl">
              System Architecture
            </Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tech Stack List */}
            <div className="p-6 sm:p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                Technologies &amp; Tools
              </span>
              <div className="flex flex-wrap gap-2">
                {project.architecture.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs sm:text-sm font-mono text-[var(--ink)] bg-[var(--bg)] px-3 py-1.5 rounded-[var(--r-sm)] border border-[var(--line)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Architectural Decisions */}
            <div className="p-6 sm:p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
              <span className="text-xs font-semibold text-[var(--ink-muted)]">
                Key Architectural Decisions
              </span>
              <ul className="space-y-3 text-sm text-[var(--ink-muted)]">
                {project.architecture.decisions.map((decision) => (
                  <li key={decision} className="flex items-start gap-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. Deep-Dive Subsections */}
      {project.sections && project.sections.length > 0 && (
        <Section spacing="compact">
          <Container size="narrow" className="space-y-12">
            {project.sections.map((section) => (
              <div
                key={section.title}
                className="space-y-6 p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
              >
                <div className="space-y-1">
                  <Heading as="h3" size="2xl">
                    {section.title}
                  </Heading>
                  {section.subtitle && (
                    <Text size="base" variant="accent" className="font-medium">
                      {section.subtitle}
                    </Text>
                  )}
                </div>
                <div className="space-y-4 text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
                {section.takeaways && section.takeaways.length > 0 && (
                  <div className="pt-4 border-t border-[var(--line)] space-y-2">
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      Key Takeaways
                    </span>
                    <ul className="space-y-1.5">
                      {section.takeaways.map((takeaway, tIdx) => (
                        <li
                          key={tIdx}
                          className="text-xs sm:text-sm text-[var(--ink-muted)] flex items-start gap-2"
                        >
                          <span className="text-[var(--accent)] font-bold">✓</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </Container>
        </Section>
      )}

      {/* 6. Deliverables */}
      {project.deliverables && project.deliverables.length > 0 && (
        <Section spacing="compact">
          <Container className="space-y-8">
            <div className="space-y-2 border-b border-[var(--line)] pb-4">
              <Badge variant="outline">Outcomes</Badge>
              <Heading as="h2" size="2xl">
                Deliverables & Assets
              </Heading>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {project.deliverables.map((del) => (
                <div
                  key={del.title}
                  className="p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-2"
                >
                  <h4 className="text-base font-bold text-[var(--ink)]">{del.title}</h4>
                  <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
                    {del.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* 7. Next / Prev Project Navigation Footer */}
      <Section spacing="compact" className="border-t border-[var(--line)] mt-12">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {prev ? (
              <Link
                href={`/work/${prev.slug}`}
                className="group p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors space-y-2 text-left"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Previous Project</span>
                </div>
                <div className="text-lg font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                  {prev.title}
                </div>
                <p className="text-xs text-[var(--ink-muted)] line-clamp-1">{prev.tagline}</p>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {next ? (
              <Link
                href={`/work/${next.slug}`}
                className="group p-6 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors space-y-2 text-right"
              >
                <div className="flex items-center justify-end gap-2 text-xs font-mono text-[var(--ink-muted)]">
                  <span>Next Project</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="text-lg font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                  {next.title}
                </div>
                <p className="text-xs text-[var(--ink-muted)] line-clamp-1">{next.tagline}</p>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
