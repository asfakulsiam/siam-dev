import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Project | Dev Den Admin",
  description: "Create and publish a new case study.",
};

export default async function NewProjectPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
          Create New Project
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Draft a new case study with architectural breakdown, metrics, and cover assets.
        </p>
      </div>

      <ProjectForm isEdit={false} />
    </div>
  );
}
