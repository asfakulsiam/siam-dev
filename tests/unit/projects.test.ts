import { describe, it, expect } from "vitest";
import {
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getAdjacentProjects,
} from "@/features/projects/data";

describe("Projects Data Layer", () => {
  it("returns all static projects", () => {
    const projects = getAllProjects();
    expect(projects.length).toBeGreaterThanOrEqual(5);
  });

  it("filters featured projects", () => {
    const featured = getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    featured.forEach((p) => {
      expect(p.featured).toBe(true);
    });
  });

  it("finds project by slug", () => {
    const project = getProjectBySlug("stride-design-system");
    expect(project).toBeDefined();
    expect(project?.title).toBe("Stride Design System");
    expect(project?.category).toBe("Design Systems");
  });

  it("returns undefined for non-existent slug", () => {
    const project = getProjectBySlug("non-existent-project-xyz");
    expect(project).toBeUndefined();
  });

  it("computes adjacent projects accurately", () => {
    const all = getAllProjects();
    const firstSlug = all[0]?.slug;
    expect(firstSlug).toBeDefined();

    if (firstSlug) {
      const { prev, next } = getAdjacentProjects(firstSlug);
      expect(prev).toBeNull();
      expect(next).toBeDefined();
      expect(next?.slug).toBe(all[1]?.slug);
    }
  });

  it("validates all projects have required accessibility and SEO fields", () => {
    const projects = getAllProjects();
    projects.forEach((p) => {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.summary).toBeTruthy();
      expect(p.coverImage.src).toBeTruthy();
      expect(p.coverImage.alt).toBeTruthy();
      expect(p.problem).toBeTruthy();
      expect(p.solution).toBeTruthy();
      expect(p.architecture.stack.length).toBeGreaterThan(0);
    });
  });
});
