import { getCollection, sanitizeDocuments } from "@/lib/db";
import { staticTestimonials } from "./data";
import { Testimonial } from "./schema";

/**
 * Retrieves testimonials from the database.
 * If onlyPublished is true, filters for published: true.
 * Sorts by order ascending, then by creation date descending.
 * Follows the standardized portfolio data-layer resilience pattern (ADR-008 & ADR-015):
 * Gracefully degrades to static dataset during offline build/pre-rendering, while
 * all admin mutations (actions.ts) strictly require a live MongoDB instance.
 */
export async function getTestimonials(onlyPublished = true): Promise<Testimonial[]> {
  try {
    const collection = await getCollection("testimonials");
    const query = onlyPublished ? { published: true } : {};
    const docs = await collection.find(query).sort({ order: 1, createdAt: -1 }).toArray();

    if (docs.length > 0) {
      return sanitizeDocuments<Testimonial>(docs);
    }
  } catch (err) {
    console.warn(
      "⚠️ [DB] Unable to reach MongoDB for getTestimonials, falling back to static dataset:",
      err instanceof Error ? err.message : err,
    );
  }

  return onlyPublished
    ? staticTestimonials.filter((t) => t.published)
    : staticTestimonials;
}
