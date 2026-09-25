"use server";

import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { getCollection } from "@/lib/db";
import { settingsInputSchema, SettingsInput } from "@/features/appearance/schema";
import { ActionResponse } from "@/features/projects/actions";

/**
 * Updates site appearance and meme configurations.
 * Requires admin authorization.
 */
export async function updateSettingsAction(
  raw: unknown,
): Promise<ActionResponse<{ updated: boolean }>> {
  try {
    await requireAdmin();

    const parsed = settingsInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Validation failed. All meme assets must contain valid alt text and asset IDs.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const collection = await getCollection("settings");
    await collection.updateOne(
      {},
      {
        $set: {
          defaultTheme: parsed.data.defaultTheme,
          memes: parsed.data.memes,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    revalidateTag("settings");
    return { ok: true, data: { updated: true } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update settings.",
    };
  }
}
