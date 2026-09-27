"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, Archive } from "lucide-react";
import type { Project } from "../types";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Heading";

interface ProjectArchiveProps {
  projects: Project[];
  title?: string;
  description?: string;
}

export function ProjectArchive({
  projects,
  title = "Project Archive",
  description = "Earlier case studies, client experiments, and open-source utilities that are no longer actively featured on the main showcase.",
}: ProjectArchiveProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (projects.length === 0) return null;

  return (
    <section
      aria-label="Project Archive"
      className="mt-16 pt-12 border-t border-[var(--line)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
              {title}
            </h2>
            <Badge variant="outline" className="font-mono text-xs">
              {projects.length}
            </Badge>
          </div>
          <Text size="sm" variant="muted" className="max-w-xl text-pretty">
            {description}
          </Text>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="project-archive-content"
          className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2 text-sm font-medium rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus)] cursor-pointer select-none"
        >
          <span>{isOpen ? "Collapse Archive" : "Expand Archive"}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[var(--ink-muted)]" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--ink-muted)]" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          id="project-archive-content"
          className="overflow-x-auto rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
        >
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-muted)] font-mono text-xs">
                <th scope="col" className="py-3 px-4 sm:px-6 font-medium">
                  Year
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 font-medium">
                  Project
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 font-medium hidden md:table-cell">
                  Category
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 font-medium hidden lg:table-cell">
                  Role / Client
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 font-medium hidden sm:table-cell">
                  Built With
                </th>
                <th scope="col" className="py-3 px-4 sm:px-6 font-medium text-right">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {projects.map((project) => (
                <tr
                  key={project.slug}
                  className="group hover:bg-[var(--surface-2)] transition-colors"
                >
                  {/* Year */}
                  <td className="py-4 px-4 sm:px-6 font-mono text-xs text-[var(--ink-muted)] whitespace-nowrap tabular-nums">
                    {project.year}
                  </td>

                  {/* Project Title + Tagline */}
                  <td className="py-4 px-4 sm:px-6 font-medium text-[var(--ink)]">
                    <Link
                      href={`/work/${project.slug}`}
                      className="group-hover:text-[var(--accent)] transition-colors focus-visible:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>{project.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <p className="text-xs text-[var(--ink-muted)] line-clamp-1 mt-0.5 max-w-sm">
                      {project.tagline || project.summary}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 sm:px-6 hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {project.category}
                    </Badge>
                  </td>

                  {/* Role / Client */}
                  <td className="py-4 px-4 sm:px-6 hidden lg:table-cell text-xs text-[var(--ink-muted)]">
                    <div>{project.role}</div>
                    <div className="font-mono text-[var(--ink)]">{project.client}</div>
                  </td>

                  {/* Built With Tags */}
                  <td className="py-4 px-4 sm:px-6 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {(project.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[11px] font-mono rounded-[var(--r-sm)] bg-[var(--surface-2)] text-[var(--ink-muted)] border border-[var(--line)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Links */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      {project.links?.live && (
                        <a
                          href={project.links.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
                          aria-label={`Open live site for ${project.title}`}
                        >
                          Live
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                      <Link
                        href={`/work/${project.slug}`}
                        className="font-mono text-[var(--ink-muted)] hover:text-[var(--ink)] hover:underline ml-2"
                      >
                        Study
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
