"use server";

import { safeRevalidateTag, safeRevalidatePath } from "@/lib/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { getCollection } from "@/lib/db";
import { testimonialInputSchema } from "./schema";
import { ActionResponse } from "@/features/projects/actions";

/**
 * Creates a new testimonial.
 * Requires admin authorization.
 */
export async function createTestimonialAction(
  raw: unknown,
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = testimonialInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed. Please check the testimonial fields.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const collection = await getCollection("testimonials");
    const existing = await collection.findOne({ id: parsed.data.id });
    if (existing) {
      return { ok: false, error: `Testimonial with ID "${parsed.data.id}" already exists.` };
    }

    const now = new Date().toISOString();
    await collection.insertOne({
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    });

    safeRevalidateTag("testimonials");
    safeRevalidatePath("/", "layout");
    return { ok: true, data: { id: parsed.data.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create testimonial.",
    };
  }
}

/**
 * Updates an existing testimonial.
 * Requires admin authorization.
 */
export async function updateTestimonialAction(
  id: string,
  raw: unknown,
): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireAdmin();

    const parsed = testimonialInputSchema.partial().safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed. Please check the testimonial fields.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const collection = await getCollection("testimonials");
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
      return { ok: false, error: "Testimonial not found." };
    }

    safeRevalidateTag("testimonials");
    safeRevalidatePath("/", "layout");
    return { ok: true, data: { id } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update testimonial.",
    };
  }
}

/**
 * Deletes a testimonial by ID.
 * Requires admin authorization.
 */
export async function deleteTestimonialAction(
  id: string,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    await requireAdmin();

    const collection = await getCollection("testimonials");
    const result = await collection.deleteOne({ id });

    if (result.deletedCount === 0) {
      return { ok: false, error: "Testimonial not found." };
    }

    safeRevalidateTag("testimonials");
    safeRevalidatePath("/", "layout");
    return { ok: true, data: { deleted: true } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete testimonial.",
    };
  }
}

/**
 * Toggles the published state of a testimonial.
 * Requires admin authorization.
 */
export async function togglePublishTestimonialAction(
  id: string,
  published: boolean,
): Promise<ActionResponse<{ id: string; published: boolean }>> {
  try {
    await requireAdmin();

    const collection = await getCollection("testimonials");
    const result = await collection.updateOne(
      { id },
      {
        $set: {
          published,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return { ok: false, error: "Testimonial not found." };
    }

    safeRevalidateTag("testimonials");
    safeRevalidatePath("/", "layout");
    return { ok: true, data: { id, published } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update publish state.",
    };
  }
}

/**
 * Reorders testimonials in batch.
 * Requires admin authorization.
 */
export async function reorderTestimonialsAction(
  orders: { id: string; order: number }[],
): Promise<ActionResponse<{ updated: number }>> {
  try {
    await requireAdmin();

    const collection = await getCollection("testimonials");
    let count = 0;

    for (const item of orders) {
      const res = await collection.updateOne(
        { id: item.id },
        {
          $set: {
            order: item.order,
            updatedAt: new Date().toISOString(),
          },
        },
      );
      if (res.modifiedCount > 0) count++;
    }

    safeRevalidateTag("testimonials");
    safeRevalidatePath("/", "layout");
    return { ok: true, data: { updated: count } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reorder testimonials.",
    };
  }
}
