import { MongoClient } from "mongodb";
import { env } from "../src/lib/env";
import { staticProjects } from "../src/features/projects/data";
import { staticProfile } from "../src/features/profile/data";
import { staticExperience } from "../src/features/experience/data";

async function runSeed() {
  console.log("🌱 Starting Dev Den idempotent database seed...");
  console.log(`🔌 Target database: ${env.MONGODB_DB}`);

  const client = new MongoClient(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const db = client.db(env.MONGODB_DB);

    // 1. Initialize Indexes
    console.log("📑 Ensuring collection indexes...");
    await db.collection("projects").createIndex({ slug: 1 }, { unique: true });
    await db.collection("projects").createIndex({ featured: 1, sortOrder: 1 });
    await db.collection("projects").createIndex({ category: 1, published: 1 });
    await db.collection("experience").createIndex({ id: 1 }, { unique: true });
    await db.collection("messages").createIndex({ createdAt: -1 });
    await db.collection("messages").createIndex({ ipHash: 1 });
    await db.collection("rate_limits").createIndex({ key: 1 }, { unique: true });
    await db.collection("rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // 2. Upsert Projects
    console.log(`🚀 Seeding ${staticProjects.length} projects...`);
    const projectsCol = db.collection("projects");
    let projectsUpserted = 0;

    for (const [i, project] of staticProjects.entries()) {
      const now = new Date().toISOString();
      await projectsCol.updateOne(
        { slug: project.slug },
        {
          $set: {
            ...project,
            published: true,
            sortOrder: i,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      );
      projectsUpserted++;
    }
    console.log(`✅ Upserted ${projectsUpserted} projects.`);

    // 3. Upsert Profile
    console.log("👤 Seeding profile and 'Now' status...");
    const profileCol = db.collection("profile");
    await profileCol.updateOne(
      {},
      {
        $set: {
          ...staticProfile,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );
    console.log("✅ Profile information updated.");

    // 4. Upsert Experience
    console.log(`💼 Seeding ${staticExperience.length} career milestones...`);
    const expCol = db.collection("experience");
    let expUpserted = 0;

    for (const [i, exp] of staticExperience.entries()) {
      const now = new Date().toISOString();
      await expCol.updateOne(
        { id: exp.id },
        {
          $set: {
            ...exp,
            sortOrder: i,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      );
      expUpserted++;
    }
    console.log(`✅ Upserted ${expUpserted} experience items.`);

    console.log("🎉 Seed finished successfully without data loss.");
  } catch (err) {
    console.error("❌ Seed encountered an error:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runSeed();
