"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export type ProjectCategoryFilter =
  "All" | "Design Systems" | "Full-Stack" | "Web Applications" | "Open Source";

interface ProjectFilterProps {
  categories: ProjectCategoryFilter[];
  activeCategory: ProjectCategoryFilter;
  onSelectCategory: (category: ProjectCategoryFilter) => void;
  counts: Record<string, number>;
}

export function ProjectFilter({
  categories,
  activeCategory,
  onSelectCategory,
  counts,
}: ProjectFilterProps) {
  const [, startTransition] = useTransition();

  return (
    <div
      role="tablist"
      aria-label="Filter projects by category"
      className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-4"
    >
      {categories.map((category) => {
        const isSelected = activeCategory === category;
        const count = counts[category] ?? 0;

        return (
          <Button
            key={category}
            role="tab"
            aria-selected={isSelected}
            size="sm"
            variant={isSelected ? "primary" : "outline"}
            onClick={() => {
              startTransition(() => {
                onSelectCategory(category);
              });
            }}
          >
            <span>{category}</span>
            <Badge
              size="xs"
              variant={isSelected ? "default" : "outline"}
              className={
                isSelected
                  ? "bg-[var(--accent-ink)]/20 text-[var(--accent-ink)] border-transparent"
                  : "bg-[var(--bg)] text-[var(--ink-muted)] border-[var(--line)]"
              }
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
