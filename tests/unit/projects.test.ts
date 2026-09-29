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

  it("parseGitHubUrl correctly parses valid and invalid GitHub repository URLs", async () => {
    const { parseGitHubUrl } = await import("@/features/projects/lib/github");

    expect(parseGitHubUrl("https://github.com/facebook/react")).toEqual({
      owner: "facebook",
      repo: "react",
    });

    expect(parseGitHubUrl("https://github.com/vercel/next.js/")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });

    expect(parseGitHubUrl("github.com/tailwindlabs/tailwindcss.git")).toEqual({
      owner: "tailwindlabs",
      repo: "tailwindcss",
    });

    expect(parseGitHubUrl("shadcn-ui/ui")).toEqual({
      owner: "shadcn-ui",
      repo: "ui",
    });

    expect(parseGitHubUrl("https://invalid-domain.com/owner/repo")).toBeNull();
    expect(parseGitHubUrl("")).toBeNull();
  });

  it("ensures mock AI project output strictly conforms to projectInputSchema", async () => {
    const { projectInputSchema } = await import("@/features/projects/schema");

    const mockAiOutput = {
      slug: "gemini-cli-tool",
      title: "Gemini CLI Tool",
      tagline: "High-performance developer CLI for generative reasoning workflows.",
      category: "Open Source" as const,
      featured: false,
      published: true,
      sortOrder: 0,
      year: "2026",
      timeline: "6 weeks",
      role: "Lead Developer",
      client: "Open Source",
      summary: "A robust command-line utility built in TypeScript.",
      coverImage: {
        src: "https://picsum.photos/seed/gemini/1200/800",
        alt: "Gemini CLI Tool Architecture Screenshot",
        aspectRatio: "16/9",
      },
      tags: ["TypeScript", "Node.js", "CLI"],
      problem: "Developers needed a lightweight terminal workflow for structured AI outputs without bloated runtimes.",
      solution: "Engineered a zero-dependency CLI utilizing streaming HTTP responses.",
      architecture: {
        stack: ["TypeScript", "Node.js"],
        decisions: ["Chose native fetch over third-party HTTP clients to minimize bundle size."],
      },
      metrics: [
        { label: "Install Size", value: "< 2MB", description: "Near-zero runtime dependencies" },
        { label: "Star Count", value: "1.2k★", description: "Active open-source community" },
      ],
      deliverables: [
        { title: "NPM Package", description: "Published binary executable" },
        { title: "Documentation", description: "Comprehensive man pages and guide" },
      ],
      links: {
        github: "https://github.com/example/gemini-cli-tool",
        live: "https://gemini-cli.dev",
      },
      sections: [],
    };

    const parseResult = projectInputSchema.safeParse(mockAiOutput);
    expect(parseResult.success).toBe(true);
  });

  it("validates Performance Metrics schema with Lighthouse audit scores and conversion funnel", async () => {
    const { projectPerformanceDataSchema, projectInputSchema } = await import(
      "@/features/projects/schema"
    );

    const perfData = {
      lighthouse: {
        performance: 98,
        accessibility: 100,
        bestPractices: 100,
        seo: 98,
        fcp: "0.8s",
        lcp: "1.2s",
        cls: "0.01",
        tbt: "20ms",
      },
      conversions: [
        { step: "Visitor", rate: 100, count: 1000 },
        { step: "Documentation View", rate: 65.5, count: 655 },
        { step: "Demo Playground", rate: 38.2, count: 382 },
        { step: "Conversion / Signup", rate: 14.8, count: 148 },
      ],
      summary: "98+ Lighthouse scores across mobile 4G network throttling.",
    };

    const parsedPerf = projectPerformanceDataSchema.safeParse(perfData);
    expect(parsedPerf.success).toBe(true);

    // Full project input with performance data
    const fullProject = {
      slug: "perf-tested-app",
      title: "Performance Tested App",
      tagline: "High throughput web application",
      category: "Full-Stack" as const,
      featured: true,
      published: true,
      sortOrder: 1,
      year: "2026",
      timeline: "4 weeks",
      role: "Architect",
      client: "Benchmark Labs",
      summary: "Detailed case study testing high-frequency rendering and Lighthouse scores.",
      coverImage: {
        src: "https://example.com/cover.png",
        alt: "Performance overview",
        aspectRatio: "16/9",
      },
      tags: ["Performance", "D3.js", "Lighthouse"],
      metrics: [{ label: "Velocity", value: "60fps" }],
      problem: "Heavy client-side bundles delayed initial interactive paint beyond 3.5 seconds.",
      solution: "Refactored rendering into progressive server components with zero-overhead D3 SVGs.",
      architecture: {
        stack: ["Next.js", "D3.js", "Tailwind CSS"],
        decisions: ["Static SVG generation with interactive D3 bindings."],
      },
      performanceData: perfData,
    };

    const fullResult = projectInputSchema.safeParse(fullProject);
    expect(fullResult.success).toBe(true);
  });
});
