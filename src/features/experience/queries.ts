import { safeUnstableCache } from "@/lib/cache";
import { getCollection, sanitizeDocuments } from "@/lib/db";
import {
  staticExperience,
  staticPrinciples,
  ExperienceItem,
  PhilosophyPrinciple,
} from "@/features/experience/data";
import { ExperienceDocument } from "@/features/experience/schema";

/**
 * Internal cached fetcher for career experience items from MongoDB.
 */
async function fetchExperienceData(): Promise<ExperienceItem[]> {
  try {
    const collection = await getCollection("experience");
    const docs = await collection.find({}).sort({ sortOrder: 1 }).toArray();

    if (docs.length > 0) {
      return sanitizeDocuments<ExperienceDocument>(docs).map((item) => ({
        id: item.id,
        role: item.role,
        organization: item.organization,
        period: item.period,
        location: item.location,
        type: item.type,
        description: item.description,
        achievements: item.achievements || [],
        skills: item.skills,
      }));
    }
  } catch (err) {
    console.warn(
      "⚠️ [DB] Unable to reach MongoDB for getExperience, falling back to static experience:",
      err instanceof Error ? err.message : err,
    );
  }

  return staticExperience;
}

/**
 * Retrieves career experience items.
 * Cached with tags: ["experience"] for instant revalidation upon admin mutation.
 */
export const getExperience = safeUnstableCache(
  fetchExperienceData,
  ["experience-data"],
  { tags: ["experience"] },
);

/**
 * Retrieves the core principles of craft.
 */
export async function getPrinciples(): Promise<PhilosophyPrinciple[]> {
  return staticPrinciples;
}
