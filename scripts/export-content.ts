import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
import { env } from "../src/lib/env";
import { staticProjects } from "../src/features/projects/data";
import { staticProfile } from "../src/features/profile/data";
import { staticExperience } from "../src/features/experience/data";

async function exportContent() {
  console.log("📦 Exporting Dev Den content snapshot...");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const exportsDir = path.resolve(process.cwd(), "exports");

  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const exportData: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    environment: env.NODE_ENV,
    projects: [],
    profile: null,
    experience: [],
  };

  const client = new MongoClient(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
  });

  try {
    await client.connect();
    const db = client.db(env.MONGODB_DB);

    const projects = await db.collection("projects").find({}).toArray();
    const profile = await db.collection("profile").findOne({});
    const experience = await db.collection("experience").find({}).toArray();

    exportData.projects = projects.length > 0 ? projects : staticProjects;
    exportData.profile = profile || staticProfile;
    exportData.experience = experience.length > 0 ? experience : staticExperience;
    console.log("📥 Retrieved live collections from MongoDB.");
  } catch (err) {
    console.warn(
      "⚠️ [Export] Database unreachable, exporting static baseline dataset:",
      err instanceof Error ? err.message : err,
    );
    exportData.projects = staticProjects;
    exportData.profile = staticProfile;
    exportData.experience = staticExperience;
  } finally {
    try {
      await client.close();
    } catch {
      // Ignore close error
    }
  }

  const filePath = path.join(exportsDir, `content-snapshot-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), "utf-8");

  console.log(`✅ Snapshot successfully created:`);
  console.log(`📁 File: ${filePath}`);
  console.log(`📊 Projects: ${(exportData.projects as unknown[]).length}`);
  console.log(`📊 Experience Milestones: ${(exportData.experience as unknown[]).length}`);
  console.log(`📊 Profile: ${(exportData.profile as { name?: string })?.name || "Ready"}`);
}

exportContent();
