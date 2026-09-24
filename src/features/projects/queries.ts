import { getCollection, sanitizeDocuments, sanitizeDocument } from "@/lib/db";
import { staticProjects } from "@/features/projects/data";
import { ProjectDocument } from "@/features/projects/schema";
import { Project } from "@/features/projects/types";

interface GetProjectsOptions {
  category?: string;
  featured?: boolean;
  publishedOnly?: boolean;
}

/**
 * Normalizes a database or static project to the standard Project presentation interface.
 */
function normalizeProject(doc: unknown): Project {
  const p = doc as ProjectDocument;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    category: p.category,
    featured: Boolean(p.featured),
    published: p.published !== false,
    sortOrder: p.sortOrder ?? 0,
    year: p.year,
    timeline: p.timeline,
    role: p.role,
    client: p.client,
    summary: p.summary,
    coverImage: p.coverImage,
    tags: p.tags,
    metrics: p.metrics,
    deliverables: p.deliverables || [],
    problem: p.problem,
    solution: p.solution,
    architecture: p.architecture,
    sections: p.sections || [],
    links: p.links,
  };
}

/**
 * Retrieves projects with optional filtering by category, featured flag, and publish status.
 * Seamlessly falls back to static seed data if the database is offline or unreachable.
 */
export async function getProjects(options: GetProjectsOptions = {}): Promise<Project[]> {
  const { category, featured, publishedOnly = true } = options;

  try {
    const collection = await getCollection("projects");
    const query: Record<string, unknown> = {};

    if (publishedOnly) {
      query.published = { $ne: false };
    }
    if (category && category !== "All") {
      query.category = category;
    }
    if (typeof featured === "boolean") {
      query.featured = featured;
    }

    const docs = await collection.find(query).sort({ sortOrder: 1, year: -1 }).toArray();

    if (docs.length > 0) {
      return sanitizeDocuments<ProjectDocument>(docs).map(normalizeProject);
    }
  } catch (err) {
    console.warn(
      "⚠️ [DB] Unable to reach MongoDB for getProjects, falling back to static dataset:",
      err instanceof Error ? err.message : err,
    );
  }

  // Graceful fallback to curated static data
  let filtered = [...staticProjects];
  if (category && category !== "All") {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (typeof featured === "boolean") {
    filtered = filtered.filter((p) => p.featured === featured);
  }

  return filtered;
}

/**
 * Retrieves the featured projects for the hero showcase.
 */
export async function getFeaturedProjects(): Promise<Project[]> {
  return getProjects({ featured: true, publishedOnly: true });
}

/**
 * Retrieves a single project by its unique slug.
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const collection = await getCollection("projects");
    const doc = await collection.findOne({ slug });

    if (doc) {
      const sanitized = sanitizeDocument<ProjectDocument>(doc);
      return sanitized ? normalizeProject(sanitized) : null;
    }
  } catch (err) {
    console.warn(
      `⚠️ [DB] Unable to reach MongoDB for getProjectBySlug (${slug}), falling back to static dataset:`,
      err instanceof Error ? err.message : err,
    );
  }

  // Graceful fallback to static data
  const staticFound = staticProjects.find((p) => p.slug === slug);
  return staticFound || null;
}

/**
 * Retrieves all project slugs for static route generation and sitemaps.
 */
export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const collection = await getCollection("projects");
    const docs = await collection
      .find({ published: { $ne: false } }, { projection: { slug: 1 } })
      .toArray();

    if (docs.length > 0) {
      return docs.map((d) => String(d.slug));
    }
  } catch {
    // Quiet fallback
  }

  return staticProjects.map((p) => p.slug);
}

/**
 * Retrieves the adjacent (previous and next) projects for sequential navigation.
 */
export async function getAdjacentProjects(slug: string): Promise<{
  prev: Project | null;
  next: Project | null;
}> {
  const projects = await getProjects({ publishedOnly: true });
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  const prev = index > 0 ? (projects[index - 1] ?? null) : null;
  const next = index < projects.length - 1 ? (projects[index + 1] ?? null) : null;
  return { prev, next };
}
