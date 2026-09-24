"use client";

import { useState, useMemo } from "react";
import type { Project } from "../types";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilter, type ProjectCategoryFilter } from "./ProjectFilter";
import { Text } from "@/components/ui/Heading";

interface WorkGalleryProps {
  initialProjects: Project[];
}

const CATEGORIES: ProjectCategoryFilter[] = [
  "All",
  "Design Systems",
  "Full-Stack",
  "Web Applications",
  "Open Source",
];

export function WorkGallery({ initialProjects }: WorkGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategoryFilter>("All");

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: initialProjects.length };
    for (const project of initialProjects) {
      map[project.category] = (map[project.category] || 0) + 1;
    }
    return map;
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return initialProjects;
    return initialProjects.filter((p) => p.category === activeCategory);
  }, [initialProjects, activeCategory]);

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <ProjectFilter
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        counts={counts}
      />

      {/* Grid or Empty State */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <ProjectCard key={project.slug} project={project} priority={idx < 2} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-3">
          <p className="text-lg font-bold text-[var(--ink)]">No projects in this category yet</p>
          <Text size="sm" variant="muted">
            Try switching to another category or view All projects.
          </Text>
        </div>
      )}
    </div>
  );
}
