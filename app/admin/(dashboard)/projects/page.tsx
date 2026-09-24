import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { getProjects } from "@/features/projects/queries";
import { ProjectsManager } from "@/components/admin/ProjectsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects Manager | Dev Den Admin",
  description: "Create, edit, toggle visibility, and reorder case studies.",
};

export default async function AdminProjectsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const projects = await getProjects().catch(() => []);

  return <ProjectsManager initialProjects={projects} />;
}
