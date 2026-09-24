import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { getProjectBySlug, getProjects } from "@/features/projects/queries";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Edit Project (${id}) | Dev Den Admin`,
  };
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const { id } = await params;

  let project = await getProjectBySlug(id).catch(() => null);

  // If not found by slug directly, look in all projects by id or slug
  if (!project) {
    const all = await getProjects().catch(() => []);
    project = all.find((p) => p.id === id || p.slug === id) || null;
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
          Edit: {project.title}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1 font-mono text-xs">
          slug: /{project.slug} • status: {project.published !== false ? "published" : "draft"}
        </p>
      </div>

      <ProjectForm initialData={project} isEdit={true} />
    </div>
  );
}
