"use server";

import { safeRevalidateTag, safeRevalidatePath } from "@/lib/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { getCollection } from "@/lib/db";
import { experienceInputSchema } from "@/features/experience/schema";
import { ActionResponse } from "@/features/projects/actions";

/**
 * Creates an experience milestone.
 * Requires admin authorization.
 */
export async function createExperienceAction(
  raw: unknown,
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = experienceInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const collection = await getCollection("experience");
    const existing = await collection.findOne({ id: parsed.data.id });
    if (existing) {
      return { ok: false, error: `Experience item "${parsed.data.id}" already exists.` };
    }

    const now = new Date().toISOString();
    await collection.insertOne({
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    });

    safeRevalidateTag("experience");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/about");
    return { ok: true, data: { id: parsed.data.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create experience item",
    };
  }
}

/**
 * Updates an experience milestone by ID.
 * Requires admin authorization.
 */
export async function updateExperienceAction(
  id: string,
  raw: unknown,
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = experienceInputSchema.partial().safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const collection = await getCollection("experience");
    const result = await collection.updateOne(
      { id },
      {
        $set: {
          ...parsed.data,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return { ok: false, error: "Experience milestone not found." };
    }

    safeRevalidateTag("experience");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/about");
    return { ok: true, data: { id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update experience item",
    };
  }
}

/**
 * Deletes an experience milestone by ID.
 * Requires admin authorization.
 */
export async function deleteExperienceAction(
  id: string,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    await requireAdmin();

    const collection = await getCollection("experience");
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return { ok: false, error: "Experience item not found." };
    }

    safeRevalidateTag("experience");
    safeRevalidatePath("/", "layout");
    safeRevalidatePath("/about");
    return { ok: true, data: { deleted: true } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete experience item",
    };
  }
}
