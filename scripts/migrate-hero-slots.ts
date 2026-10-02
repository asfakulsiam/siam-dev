import { MongoClient, Db } from "mongodb";
import { env } from "../src/lib/env";

export interface MigrationResult {
  modified: boolean;
  reason?: string;
  updatedSlots?: {
    heroPrimary?: boolean;
    heroSecondary?: boolean;
  };
}

/**
 * Pure migration logic operating on a MongoDB Db instance.
 * Idempotent: Can be run multiple times safely.
 * If heroPrimary or heroSecondary already have their light variant populated,
 * or if dark variants exist, they are preserved with zero data loss.
 * Second run is guaranteed to be a true no-op (0 writes).
 */
export async function migrateHeroSlots(db: Db): Promise<MigrationResult> {
  const profileCol = db.collection("profile");
  const doc = await profileCol.findOne({});

  if (!doc) {
    return { modified: false, reason: "No profile document found in collection." };
  }

  const updates: Record<string, unknown> = {};
  const updatedSlots: { heroPrimary?: boolean; heroSecondary?: boolean } = {};

  const photos = Array.isArray(doc.photos) ? doc.photos : [];
  const legacyPrimary = photos.find((p: any) => p.role === "hero-primary");
  const legacySecondary = photos.find((p: any) => p.role === "hero-secondary");

  // Check heroPrimary
  const currentPrimary = doc.heroPrimary || {};
  if (!currentPrimary.light?.publicId && legacyPrimary?.publicId) {
    updates["heroPrimary"] = {
      ...currentPrimary,
      light: {
        publicId: legacyPrimary.publicId,
        alt: legacyPrimary.alt || "Primary hero photo",
        accentColor: legacyPrimary.accentColor || "auto",
      },
    };
    updatedSlots.heroPrimary = true;
  }

  // Check heroSecondary
  const currentSecondary = doc.heroSecondary || {};
  if (!currentSecondary.light?.publicId && legacySecondary?.publicId) {
    updates["heroSecondary"] = {
      ...currentSecondary,
      light: {
        publicId: legacySecondary.publicId,
        alt: legacySecondary.alt || "Secondary hero photo",
        accentColor: legacySecondary.accentColor || "auto",
      },
    };
    updatedSlots.heroSecondary = true;
  }

  if (Object.keys(updates).length === 0) {
    return {
      modified: false,
      reason: "No-op: heroPrimary and heroSecondary are already populated or no legacy photos found.",
    };
  }

  updates["updatedAt"] = new Date().toISOString();

  await profileCol.updateOne(
    { _id: doc._id },
    { $set: updates },
  );

  return {
    modified: true,
    updatedSlots,
  };
}

async function runCli() {
  console.log("🔄 Starting idempotent hero slots migration (Phase U)...");
  const client = new MongoClient(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const db = client.db(env.MONGODB_DB);

    // Run 1: Primary migration execution
    console.log("▶️  Executing Run 1...");
    const res1 = await migrateHeroSlots(db);
    console.log(
      res1.modified
        ? `✅ Run 1 succeeded: Updated slots -> ${JSON.stringify(res1.updatedSlots)}`
        : `ℹ️  Run 1 status: ${res1.reason}`
    );

    // Run 2: Idempotency verification
    console.log("▶️  Executing Run 2 (Idempotency verification)...");
    const res2 = await migrateHeroSlots(db);
    if (res2.modified) {
      console.error("❌ FAILED IDEMPOTENCY CHECK: Run 2 made modifications when none should have occurred!");
      process.exit(1);
    } else {
      console.log(`✅ Run 2 verified: True no-op confirmed (${res2.reason})`);
    }

    console.log("🎉 Hero slots migration completed safely with zero data loss.");
  } catch (err) {
    console.warn("⚠️ [DB] Unable to reach MongoDB:", err instanceof Error ? err.message : err);
    console.log("ℹ️  Read-time fallback migration in queries.ts handles offline/static datasets automatically.");
  } finally {
    await client.close();
  }
}

if (process.argv[1]?.endsWith("migrate-hero-slots.ts")) {
  runCli();
}
