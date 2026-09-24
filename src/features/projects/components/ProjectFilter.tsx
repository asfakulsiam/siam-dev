"use client";

import { useTransition } from "react";

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
          <button
            key={category}
            role="tab"
            aria-selected={isSelected}
            onClick={() => {
              startTransition(() => {
                onSelectCategory(category);
              });
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--r-sm)] text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
              isSelected
                ? "bg-[var(--accent)] text-[var(--accent-ink)] font-semibold shadow-sm"
                : "bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] border border-[var(--line)]"
            }`}
          >
            <span>{category}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected
                  ? "bg-[var(--accent-ink)]/20 text-[var(--accent-ink)]"
                  : "bg-[var(--bg)] text-[var(--ink-muted)]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
