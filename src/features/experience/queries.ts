import { getCollection, sanitizeDocuments } from "@/lib/db";
import {
  staticExperience,
  staticPrinciples,
  ExperienceItem,
  PhilosophyPrinciple,
} from "@/features/experience/data";
import { ExperienceDocument } from "@/features/experience/schema";

/**
 * Retrieves career experience items.
 * Falls back to static experience data if database is unreachable.
 */
export async function getExperience(): Promise<ExperienceItem[]> {
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
 * Retrieves the core principles of craft.
 */
export async function getPrinciples(): Promise<PhilosophyPrinciple[]> {
  return staticPrinciples;
}
