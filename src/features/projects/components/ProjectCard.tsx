import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../types";
import { Badge } from "@/components/ui/Badge";
import { PortfolioImage } from "@/components/ui/PortfolioImage";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const primaryMetric = project.metrics[0];

  return (
    <article className="group relative flex flex-col justify-between rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] transition-all duration-200 hover:border-[var(--ink-muted)] hover:bg-[var(--surface-2)]">
      {/* Visual Preview */}
      <div className="relative w-full overflow-hidden rounded-t-[calc(var(--r-md)-1px)] bg-[var(--bg)] border-b border-[var(--line)]">
        <PortfolioImage
          src={project.coverImage.src}
          alt={project.coverImage.alt || `${project.title} project showcase visual`}
          aspectRatio="16/9"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-105"
          containerClassName="rounded-b-none border-none"
        />

        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
          <Badge variant="outline" className="bg-[var(--surface)]/90 backdrop-blur-sm">
            {project.category}
          </Badge>
          <span className="rounded-full bg-[var(--surface)]/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-mono text-[var(--ink-muted)] border border-[var(--line)]">
            {project.year}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              <Link
                href={`/work/${project.slug}`}
                className="focus:outline-none focus-visible:underline"
                data-cursor-text="View"
              >
                <span className="absolute inset-0 z-0" aria-hidden="true" />
                {project.title}
              </Link>
            </h3>
            <div className="rounded-full p-2 text-[var(--ink-muted)] group-hover:text-[var(--ink)] group-hover:bg-[var(--surface)] border border-transparent group-hover:border-[var(--line)] transition-all">
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
          <p className="text-sm sm:text-base text-[var(--ink-muted)] line-clamp-2 leading-relaxed">
            {project.summary}
          </p>
        </div>

        {/* Tags & Metric Footer */}
        <div className="space-y-4 pt-4 border-t border-[var(--line)]">
          {primaryMetric && (
            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="text-[var(--ink-muted)]">{primaryMetric.label}</span>
              <span className="font-semibold text-[var(--accent)]">{primaryMetric.value}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs text-[var(--ink-muted)] font-mono bg-[var(--bg)] px-2 py-0.5 rounded-[var(--r-sm)] border border-[var(--line)]"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span className="text-xs text-[var(--ink-muted)] font-mono px-1">
                +{project.tags.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
