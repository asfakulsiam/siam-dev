import { getDb } from "@/lib/db";

/**
 * Initializes required database indexes idempotently.
 * Can be called during application boot or via `npm run seed`.
 */
export async function initializeDbIndexes() {
  const db = await getDb();

  // Projects indexes
  const projects = db.collection("projects");
  await projects.createIndex({ slug: 1 }, { unique: true });
  await projects.createIndex({ featured: 1, sortOrder: 1 });
  await projects.createIndex({ category: 1, published: 1 });
  await projects.createIndex({ published: 1, sortOrder: 1 });

  // Experience indexes
  const experience = db.collection("experience");
  await experience.createIndex({ id: 1 }, { unique: true });
  await experience.createIndex({ sortOrder: 1 });

  // Messages (Contact) indexes
  const messages = db.collection("messages");
  await messages.createIndex({ createdAt: -1 });
  await messages.createIndex({ status: 1 });
  await messages.createIndex({ ipHash: 1 });

  // Rate Limits TTL index
  const rateLimits = db.collection("rate_limits");
  await rateLimits.createIndex({ key: 1 }, { unique: true });
  await rateLimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  return { success: true };
}
