"use server";

import { safeRevalidateTag, safeRevalidatePath } from "@/lib/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { getCollection } from "@/lib/db";
import { projectInputSchema } from "@/features/projects/schema";

export type ActionResponse<T = unknown> =
  { ok: true; data: T } | { ok: false; error: string; errors?: Record<string, string[]> };

/**
 * Creates a new project in the database.
 * Requires admin authorization.
 */
export async function createProjectAction(raw: unknown): Promise<ActionResponse<{ slug: string }>> {
  try {
    await requireAdmin();

    const parsed = projectInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed. Please correct the highlighted errors.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const collection = await getCollection("projects");

    // Check if slug is already taken
    const existing = await collection.findOne({ slug: parsed.data.slug });
    if (existing) {
      return {
        ok: false,
        error: `A project with slug "${parsed.data.slug}" already exists.`,
      };
    }

    const now = new Date().toISOString();
    await collection.insertOne({
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    });

    safeRevalidateTag("projects");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/work");
    return { ok: true, data: { slug: parsed.data.slug } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create project",
    };
  }
}

/**
 * Updates an existing project by slug.
 * Requires admin authorization.
 */
export async function updateProjectAction(
  slug: string,
  raw: unknown,
): Promise<ActionResponse<{ slug: string }>> {
  try {
    await requireAdmin();

    const parsed = projectInputSchema.partial().safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const collection = await getCollection("projects");
    const result = await collection.updateOne(
      { slug },
      {
        $set: {
          ...parsed.data,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return { ok: false, error: "Project not found." };
    }

    safeRevalidateTag("projects");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/work");
    safeRevalidatePath(`/work/${slug}`);
    return { ok: true, data: { slug } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update project",
    };
  }
}

/**
 * Deletes a project by slug.
 * Requires admin authorization.
 */
export async function deleteProjectAction(
  slug: string,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    await requireAdmin();

    const collection = await getCollection("projects");
    const result = await collection.deleteOne({ slug });

    if (result.deletedCount === 0) {
      return { ok: false, error: "Project not found or already deleted." };
    }

    safeRevalidateTag("projects");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/work");
    return { ok: true, data: { deleted: true } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete project",
    };
  }
}

/**
 * Toggles a project's published visibility.
 * Requires admin authorization.
 */
export async function togglePublishAction(
  slug: string,
  published: boolean,
): Promise<ActionResponse<{ published: boolean }>> {
  try {
    await requireAdmin();

    const collection = await getCollection("projects");
    await collection.updateOne(
      { slug },
      {
        $set: {
          published,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    safeRevalidateTag("projects");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/work");
    safeRevalidatePath(`/work/${slug}`);
    return { ok: true, data: { published } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to toggle publish status",
    };
  }
}

/**
 * Optional AI-Powered GitHub Repository Importer.
 * Inspects a GitHub repo and uses Gemini 2.5 Flash to populate existing project form fields.
 * Strictly requires admin authorization and applies server-side rate-limiting.
 */
export async function importProjectFromGitHubAction(
  githubUrl: string,
  instructions?: string,
): Promise<ActionResponse<import("./lib/ai-importer").GeneratedProjectFormFields>> {
  try {
    // 1. Enforce admin authentication
    const session = await requireAdmin();

    // 2. Validate GitHub URL
    const { parseGitHubUrl, fetchGitHubRepoDetails } = await import("./lib/github");
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      return {
        ok: false,
        error: "Invalid GitHub repository URL. Expected format: https://github.com/owner/repo",
      };
    }

    // 3. Simple server-side rate limit (10 AI imports per 15 minutes per admin user)
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const adminKey = `ai_import_${session?.user?.email || "admin"}`;
    const rateCheck = await checkRateLimit(adminKey, 10, 900);
    if (!rateCheck.success) {
      return {
        ok: false,
        error: "Too many AI analysis requests. Please wait a few minutes before trying again.",
      };
    }

    // 4. Fetch repository metadata and relevant configuration files
    const repoDetails = await fetchGitHubRepoDetails(parsed.owner, parsed.repo);

    // 5. Synthesize project details using Gemini 2.5 Flash adhering strictly to ProjectInput schema
    const { generateProjectFromGitHub } = await import("./lib/ai-importer");
    const generatedFields = await generateProjectFromGitHub(repoDetails, instructions);

    return {
      ok: true,
      data: generatedFields,
    };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    const message = err instanceof Error ? err.message : "Failed to import and analyze GitHub repository.";
    return {
      ok: false,
      error: message,
    };
  }
}

/**
 * Automated GitHub Synchronization Server Action.
 * Fetches the latest README, dependency trees, and repository metadata directly from GitHub,
 * uses Gemini 2.5 Flash to synthesize updated case study drafts, and automatically updates
 * or inserts the project in the CMS database.
 */
export async function syncProjectFromGitHubAction(
  slugOrUrl: string,
  options?: { autoPublish?: boolean; instructions?: string },
): Promise<ActionResponse<{ slug: string; title: string; syncedAt: string }>> {
  try {
    await requireAdmin();

    const collection = await getCollection("projects");

    // 1. Check if slugOrUrl matches an existing project by slug or by links.github
    let existingProject = await collection.findOne({ slug: slugOrUrl });
    let githubUrlToUse = "";

    if (existingProject && existingProject.links?.github) {
      githubUrlToUse = existingProject.links.github;
    } else if (slugOrUrl.includes("github.com") || slugOrUrl.includes("/")) {
      githubUrlToUse = slugOrUrl;
      if (!existingProject) {
        existingProject = await collection.findOne({ "links.github": slugOrUrl });
      }
    }

    if (!githubUrlToUse) {
      return {
        ok: false,
        error: "No GitHub repository URL associated with this project. Please provide a valid GitHub URL.",
      };
    }

    // 2. Parse GitHub repository URL
    const { parseGitHubUrl, fetchGitHubRepoDetails } = await import("./lib/github");
    const parsed = parseGitHubUrl(githubUrlToUse);
    if (!parsed) {
      return {
        ok: false,
        error: `Could not parse repository coordinates from URL "${githubUrlToUse}".`,
      };
    }

    // 3. Fetch latest README, package config, and metadata from GitHub
    const repoDetails = await fetchGitHubRepoDetails(parsed.owner, parsed.repo);

    // 4. Synthesize updated case study draft with Gemini 2.5 Flash
    const { generateProjectFromGitHub } = await import("./lib/ai-importer");
    const generated = await generateProjectFromGitHub(repoDetails, options?.instructions);

    const now = new Date().toISOString();
    const finalSlug = existingProject?.slug || generated.slug;

    // 5. Construct full validated project document
    const updatedDocument: Record<string, unknown> = {
      slug: finalSlug,
      title: generated.title,
      tagline: generated.tagline,
      category: generated.category,
      featured: existingProject?.featured ?? generated.featured,
      published: options?.autoPublish !== undefined ? options.autoPublish : (existingProject?.published ?? false),
      sortOrder: existingProject?.sortOrder ?? 0,
      year: generated.year,
      timeline: generated.timeline,
      role: generated.role,
      client: generated.client,
      summary: generated.summary,
      coverImage: existingProject?.coverImage || {
        src: "https://picsum.photos/seed/project/1200/800",
        alt: generated.coverImageAlt,
        aspectRatio: "16/9",
      },
      tags: generated.tags,
      problem: generated.problem,
      solution: generated.solution,
      architecture: {
        stack: generated.techStack,
        decisions: generated.architectureDecisions,
      },
      metrics: generated.metrics,
      deliverables: generated.deliverables,
      performanceData: existingProject?.performanceData || undefined,
      sections: existingProject?.sections || [],
      links: {
        github: repoDetails.htmlUrl,
        live: generated.liveUrl || existingProject?.links?.live || "",
      },
      updatedAt: now,
    };

    if (!existingProject) {
      updatedDocument.createdAt = now;
    }

    await collection.updateOne(
      { slug: finalSlug },
      { $set: updatedDocument },
      { upsert: true },
    );

    safeRevalidateTag("projects");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/work");
    safeRevalidatePath(`/work/${finalSlug}`);

    return {
      ok: true,
      data: {
        slug: finalSlug,
        title: generated.title,
        syncedAt: now,
      },
    };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to sync project from GitHub.",
    };
  }
}

export interface BatchSyncResult {
  totalEligible: number;
  syncedCount: number;
  failedCount: number;
  results: Array<{
    slug: string;
    title: string;
    status: "success" | "failed" | "skipped";
    message?: string;
  }>;
}

/**
 * Triggers automated GitHub repository synchronization for all active projects
 * that have an associated GitHub repository URL configured.
 */
export async function syncAllProjectsFromGitHubAction(): Promise<ActionResponse<BatchSyncResult>> {
  try {
    await requireAdmin();

    const collection = await getCollection("projects");
    const activeProjects = await collection
      .find({
        "links.github": { $exists: true, $ne: "" },
      })
      .toArray();

    if (!activeProjects || activeProjects.length === 0) {
      return {
        ok: true,
        data: {
          totalEligible: 0,
          syncedCount: 0,
          failedCount: 0,
          results: [],
        },
      };
    }

    const results: BatchSyncResult["results"] = [];
    let syncedCount = 0;
    let failedCount = 0;

    for (const project of activeProjects) {
      const githubUrl = project.links?.github;
      if (!githubUrl || !githubUrl.trim()) {
        results.push({
          slug: project.slug,
          title: project.title,
          status: "skipped",
          message: "No GitHub repository URL specified.",
        });
        continue;
      }

      try {
        const syncRes = await syncProjectFromGitHubAction(project.slug, {
          autoPublish: project.published !== false,
        });

        if (syncRes.ok) {
          syncedCount++;
          results.push({
            slug: project.slug,
            title: syncRes.data.title || project.title,
            status: "success",
            message: "Successfully synchronized metadata and README.",
          });
        } else {
          failedCount++;
          results.push({
            slug: project.slug,
            title: project.title,
            status: "failed",
            message: syncRes.error || "Failed to synchronize.",
          });
        }
      } catch (itemErr) {
        failedCount++;
        results.push({
          slug: project.slug,
          title: project.title,
          status: "failed",
          message: itemErr instanceof Error ? itemErr.message : "Unknown error during sync",
        });
      }
    }

    safeRevalidateTag("projects");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/work");

    return {
      ok: true,
      data: {
        totalEligible: activeProjects.length,
        syncedCount,
        failedCount,
        results,
      },
    };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to execute batch GitHub synchronization.",
    };
  }
}



