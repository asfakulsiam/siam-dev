import { safeUnstableCache } from "@/lib/cache";
import { getCollection, sanitizeDocuments } from "@/lib/db";
import { staticTestimonials } from "./data";
import { Testimonial } from "./schema";

/**
 * Internal cached fetcher for testimonials from MongoDB.
 */
async function fetchAllTestimonialsData(): Promise<Testimonial[]> {
  try {
    const collection = await getCollection("testimonials");
    const docs = await collection.find({}).sort({ order: 1, createdAt: -1 }).toArray();

    if (docs.length > 0) {
      return sanitizeDocuments<Testimonial>(docs);
    }
  } catch (err) {
    console.warn(
      "⚠️ [DB] Unable to reach MongoDB for getTestimonials, falling back to static dataset:",
      err instanceof Error ? err.message : err,
    );
  }

  return staticTestimonials;
}

/**
 * Retrieves all testimonials cached with tags: ["testimonials"].
 */
const getAllTestimonialsRaw = safeUnstableCache(
  fetchAllTestimonialsData,
  ["all-testimonials-data"],
  { tags: ["testimonials"] },
);

/**
 * Retrieves testimonials from the database or cache.
 * If onlyPublished is true, filters for published: true.
 * Revalidates instantly when admin mutates testimonials.
 */
export async function getTestimonials(onlyPublished = true): Promise<Testimonial[]> {
  const all = await getAllTestimonialsRaw();
  return onlyPublished
    ? all.filter((t) => t.published)
    : all;
}
