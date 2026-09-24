import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FolderKanban,
  Mail,
  Briefcase,
  Database,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth-guard";
import { getProjects } from "@/features/projects/queries";
import { getContactMessages } from "@/features/contact/queries";
import { getProfile } from "@/features/profile/queries";
import { getExperience } from "@/features/experience/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Overview | Dev Den Admin",
  description: "Dev Den Admin Overview and System Health",
};

export default async function AdminOverviewPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  // Load live data from queries
  const [projects, messages, profile, experience] = await Promise.all([
    getProjects().catch(() => []),
    getContactMessages().catch(() => []),
    getProfile().catch(() => null),
    getExperience().catch(() => []),
  ]);

  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.published !== false).length;
  const draftProjects = totalProjects - publishedProjects;
  const unreadMessages = messages.filter((m) => m.status === "unread").length;
  const totalExperience = experience.length;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authenticated Session
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">{currentDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Admin Overview
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Manage your case studies, narrative, career history, and inbound inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="w-4 h-4" />
            New Project
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Live Site
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Card */}
        <div className="p-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] relative overflow-hidden group">
          <div className="flex items-center justify-between text-[var(--muted)] mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Projects</span>
            <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)] mb-2 font-mono">
            {totalProjects}
          </div>
          <div className="text-xs text-[var(--muted)] flex items-center gap-2">
            <span className="text-emerald-500 font-medium">{publishedProjects} published</span>
            <span>•</span>
            <span>{draftProjects} draft</span>
          </div>
          <Link
            href="/admin/projects"
            className="mt-4 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-medium"
          >
            Manage projects <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Messages Card */}
        <div className="p-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] relative overflow-hidden group">
          <div className="flex items-center justify-between text-[var(--muted)] mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Messages</span>
            <Mail className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)] mb-2 font-mono">
            {messages.length}
          </div>
          <div className="text-xs text-[var(--muted)] flex items-center gap-2">
            {unreadMessages > 0 ? (
              <span className="text-amber-500 font-medium">{unreadMessages} unread</span>
            ) : (
              <span className="text-emerald-500">All caught up</span>
            )}
            <span>•</span>
            <span>{messages.length - unreadMessages} read</span>
          </div>
          <Link
            href="/admin/messages"
            className="mt-4 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-medium"
          >
            Review messages <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Experience Milestones Card */}
        <div className="p-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] relative overflow-hidden group">
          <div className="flex items-center justify-between text-[var(--muted)] mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Experience</span>
            <Briefcase className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)] mb-2 font-mono">
            {totalExperience}
          </div>
          <div className="text-xs text-[var(--muted)]">
            <span>Milestones in career timeline</span>
          </div>
          <Link
            href="/admin/experience"
            className="mt-4 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-medium"
          >
            Update timeline <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* System & Availability Card */}
        <div className="p-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] relative overflow-hidden group">
          <div className="flex items-center justify-between text-[var(--muted)] mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Availability</span>
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-base font-semibold text-[var(--ink)] mb-2 truncate">
            {profile?.availability?.open ? "Open for Work" : "Booked"}
          </div>
          <div className="text-xs text-[var(--muted)] truncate">
            {profile?.availability?.text || "Accepting engagements"}
          </div>
          <Link
            href="/admin/profile"
            className="mt-4 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline font-medium"
          >
            Edit profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Messages & Quick Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="font-semibold text-sm text-[var(--ink)]">Recent Inquiries</h2>
            </div>
            <Link
              href="/admin/messages"
              className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            >
              View all ({messages.length})
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {messages.slice(0, 4).map((msg) => (
              <div key={msg.id} className="p-4 hover:bg-[var(--surface-hover)] transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-[var(--ink)]">{msg.name}</span>
                  <span className="text-xs text-[var(--muted)] font-mono">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted)] mb-2">{msg.email}</div>
                <p className="text-xs text-[var(--ink-muted)] line-clamp-2">{msg.message}</p>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="p-8 text-center text-sm text-[var(--muted)]">
                No inquiries received yet.
              </div>
            )}
          </div>
        </div>

        {/* Published Projects Quick List */}
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="font-semibold text-sm text-[var(--ink)]">Recent Projects</h2>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            >
              View all ({projects.length})
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p.slug}
                className="p-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--ink)]">{p.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[var(--border)] text-[var(--muted)]">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">{p.tagline}</p>
                </div>
                <Link
                  href={`/admin/projects/${p.slug}`}
                  className="px-2.5 py-1 text-xs border border-[var(--border)] rounded-[var(--radius-sm)] hover:bg-[var(--bg)] transition-colors text-[var(--ink)]"
                >
                  Edit
                </Link>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="p-8 text-center text-sm text-[var(--muted)]">
                No projects found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
