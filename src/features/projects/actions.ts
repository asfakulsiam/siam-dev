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
