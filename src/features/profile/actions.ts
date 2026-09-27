"use server";

import { safeRevalidateTag, safeRevalidatePath } from "@/lib/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { getCollection } from "@/lib/db";
import { profileInputSchema, nowSchema } from "@/features/profile/schema";
import { ActionResponse } from "@/features/projects/actions";

/**
 * Updates full profile data.
 * Requires admin authorization.
 */
export async function updateProfileAction(
  raw: unknown,
): Promise<ActionResponse<{ updated: boolean }>> {
  try {
    await requireAdmin();

    const parsed = profileInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const profileData = { ...parsed.data };

    // Enforce role exclusivity: exactly zero or one photo can hold "hero-primary" or "hero-secondary"
    if (profileData.photos && Array.isArray(profileData.photos)) {
      let foundPrimary = false;
      let foundSecondary = false;

      profileData.photos = profileData.photos.map((photo) => {
        let role = photo.role || "unassigned";
        if (role === "hero-primary") {
          if (foundPrimary) {
            role = "unassigned";
          } else {
            foundPrimary = true;
          }
        } else if (role === "hero-secondary") {
          if (foundSecondary) {
            role = "unassigned";
          } else {
            foundSecondary = true;
          }
        }
        return {
          ...photo,
          role,
        };
      });
    }

    const collection = await getCollection("profile");
    await collection.updateOne(
      {},
      {
        $set: {
          ...profileData,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    safeRevalidateTag("profile");
    safeRevalidatePath("/", "layout");
    return { ok: true, data: { updated: true } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update profile",
    };
  }
}

/**
 * Updates only the "Now" micro-section.
 * Requires admin authorization.
 */
export async function updateNowAction(raw: unknown): Promise<ActionResponse<{ updated: boolean }>> {
  try {
    await requireAdmin();

    const parsed = nowSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const collection = await getCollection("profile");
    await collection.updateOne(
      {},
      {
        $set: {
          now: parsed.data,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    safeRevalidateTag("profile");
    safeRevalidatePath("/", "layout");
    return { ok: true, data: { updated: true } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update now section",
    };
  }
}
