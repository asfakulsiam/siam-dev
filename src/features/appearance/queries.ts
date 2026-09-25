import { getCollection, sanitizeDocument } from "@/lib/db";
import { staticSettings } from "@/features/appearance/data";
import { SettingsDocument, MemeAsset } from "@/features/appearance/schema";

/**
 * Retrieves the global site appearance and meme settings.
 * Falls back safely to staticSettings if database is unreachable.
 */
export async function getSettings(): Promise<SettingsDocument> {
  try {
    const collection = await getCollection("settings");
    const doc = await collection.findOne({});

    if (doc) {
      const sanitized = sanitizeDocument<SettingsDocument>(doc);
      if (sanitized) {
        return {
          defaultTheme: sanitized.defaultTheme || staticSettings.defaultTheme,
          memes: {
            waiting: sanitized.memes?.waiting || staticSettings.memes.waiting,
            sending: sanitized.memes?.sending || staticSettings.memes.sending,
            success: sanitized.memes?.success || staticSettings.memes.success,
            error: sanitized.memes?.error || staticSettings.memes.error,
            notFound: sanitized.memes?.notFound || staticSettings.memes.notFound,
            loading: sanitized.memes?.loading || staticSettings.memes.loading,
          },
          updatedAt: sanitized.updatedAt,
        };
      }
    }
  } catch (err) {
    console.warn(
      "⚠️ [DB] Unable to reach MongoDB for getSettings, falling back to staticSettings:",
      err instanceof Error ? err.message : err,
    );
  }

  return staticSettings;
}

/**
 * Retrieves a specific meme asset for a given state.
 */
export async function getMeme(
  state: keyof SettingsDocument["memes"],
): Promise<MemeAsset> {
  const settings = await getSettings();
  return settings.memes[state] || staticSettings.memes[state];
}
