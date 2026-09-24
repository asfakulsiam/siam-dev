import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { getExperience, getPrinciples } from "@/features/experience/queries";
import { ExperienceManager } from "@/components/admin/ExperienceManager";
import { staticExperience, staticPrinciples } from "@/features/experience/data";
import { ExperienceDocument } from "@/features/experience/schema";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Experience & Principles | Dev Den Admin",
  description: "Manage career roles, milestones, and principles of craft.",
};

export default async function AdminExperiencePage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const items = await getExperience().catch(() => staticExperience);
  const principles = await getPrinciples().catch(() => staticPrinciples);

  const formattedItems: ExperienceDocument[] = items.map((item, idx) => ({
    id: item.id || `exp-${idx}`,
    role: item.role,
    organization: item.organization,
    period: item.period,
    location: item.location,
    type: item.type,
    description: item.description,
    achievements: item.achievements,
    skills: item.skills,
    sortOrder: idx,
  }));

  return (
    <ExperienceManager
      initialItems={formattedItems}
      initialPrinciples={principles}
    />
  );
}
