"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  PlusCircle,
  ExternalLink,
  Trash2,
  Edit3,
  Loader2,
  AlertTriangle,
  Star,
} from "lucide-react";
import { Project } from "@/features/projects/types";
import { togglePublishAction, deleteProjectAction } from "@/features/projects/actions";

interface ProjectsManagerProps {
  initialProjects: Project[];
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "published" | "draft">("All");

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglePendingSlug, setTogglePendingSlug] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "published" && project.published !== false) ||
      (selectedStatus === "draft" && project.published === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleTogglePublish = async (slug: string, currentPublished: boolean) => {
    setTogglePendingSlug(slug);
    const newPublished = !currentPublished;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, published: newPublished } : p)),
    );

    try {
      const res = await togglePublishAction(slug, newPublished);
      if (res.ok) {
        setNotification({
          message: `Project "${slug}" is now ${newPublished ? "published" : "draft"}.`,
          type: "success",
        });
      } else {
        // Revert
        setProjects((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, published: currentPublished } : p)),
        );
        setNotification({
          message: res.error || "Failed to update project status.",
          type: "error",
        });
      }
    } catch {
      setProjects((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, published: currentPublished } : p)),
      );
      setNotification({
        message: "Network error updating project status.",
        type: "error",
      });
    } finally {
      setTogglePendingSlug(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await deleteProjectAction(deleteTarget.slug);
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.slug !== deleteTarget.slug));
        setNotification({
          message: `Project "${deleteTarget.title}" deleted successfully.`,
          type: "success",
        });
        setDeleteTarget(null);
      } else {
        setNotification({
          message: res.error || "Failed to delete project.",
          type: "error",
        });
      }
    } catch {
      setNotification({
        message: "Unexpected error during project deletion.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Projects &amp; Case Studies
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Manage, publish, and curate your work showcase.
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
        >
          <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 rounded-[var(--r-sm)] text-xs font-medium border flex items-center justify-between transition-all ${
            notification.type === "success"
              ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
              : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30"
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--surface)] border border-[var(--line)] p-3 rounded-[var(--r-md)] shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Design Systems">Design Systems</option>
            <option value="Full-Stack">Full-Stack</option>
            <option value="Web Applications">Web Applications</option>
            <option value="Open Source">Open Source</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "All" | "published" | "draft")}
            aria-label="Filter by status"
            className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] overflow-hidden shadow-xs">
        {filteredProjects.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-medium text-[var(--ink-muted)]">
              No projects found matching criteria.
            </p>
            {(searchQuery || selectedCategory !== "All" || selectedStatus !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedStatus("All");
                }}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-muted)] font-semibold uppercase tracking-wider text-[11px]">
                  <th scope="col" className="py-3 px-4">Project</th>
                  <th scope="col" className="py-3 px-4">Category</th>
                  <th scope="col" className="py-3 px-4">Year</th>
                  <th scope="col" className="py-3 px-4">Featured</th>
                  <th scope="col" className="py-3 px-4">Visibility</th>
                  <th scope="col" className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredProjects.map((project) => {
                  const isPublished = project.published !== false;
                  const isPending = togglePendingSlug === project.slug;

                  return (
                    <tr
                      key={project.slug}
                      className="hover:bg-[var(--surface-2)]/40 transition-colors"
                    >
                      {/* Title & Cover */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[var(--r-sm)] overflow-hidden bg-[var(--surface-2)] border border-[var(--line)] relative shrink-0">
                            {project.coverImage?.src ? (
                              <Image
                                src={project.coverImage.src}
                                alt={project.coverImage.alt || project.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--ink-muted)] font-mono">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/projects/${project.slug}`}
                              className="font-semibold text-sm text-[var(--ink)] hover:text-[var(--accent)] transition-colors block truncate"
                            >
                              {project.title}
                            </Link>
                            <span className="font-mono text-[11px] text-[var(--ink-muted)]">
                              /{project.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-[var(--ink-muted)]">
                        <span className="px-2 py-0.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[11px]">
                          {project.category}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="py-3 px-4 font-mono text-[var(--ink-muted)]">
                        {project.year}
                      </td>

                      {/* Featured Star */}
                      <td className="py-3 px-4">
                        {project.featured ? (
                          <span
                            title="Featured on homepage"
                            className="inline-flex items-center gap-1 text-[var(--accent)] font-medium text-[11px]"
                          >
                            <Star className="w-3.5 h-3.5 fill-[var(--accent)]" aria-hidden="true" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="text-[var(--ink-muted)]/50 text-[11px]">&mdash;</span>
                        )}
                      </td>

                      {/* Visibility Toggle Switch */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isPublished}
                          disabled={isPending}
                          onClick={() => handleTogglePublish(project.slug, isPublished)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                            isPublished
                              ? "bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30 hover:bg-[var(--success)]/25"
                              : "bg-[var(--ink-muted)]/15 text-[var(--ink-muted)] border border-[var(--line)] hover:bg-[var(--ink-muted)]/25"
                          }`}
                        >
                          {isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                          ) : (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPublished ? "bg-[var(--success)]" : "bg-[var(--ink-muted)]"
                              }`}
                              aria-hidden="true"
                            />
                          )}
                          <span>{isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isPublished && (
                            <Link
                              href={`/work/${project.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on live site"
                              aria-label={`View ${project.title} on site`}
                              className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                            </Link>
                          )}

                          <Link
                            href={`/admin/projects/${project.slug}`}
                            title="Edit project details"
                            aria-label={`Edit ${project.title}`}
                            className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] text-[var(--ink)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(project)}
                            title="Delete project"
                            aria-label={`Delete ${project.title}`}
                            className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--danger)] hover:border-[var(--danger)]/50 hover:bg-[var(--danger)]/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <div className="w-9 h-9 rounded-[var(--r-sm)] bg-[var(--danger)]/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 id="delete-dialog-title" className="text-base font-bold text-[var(--ink)]">
                Delete Project
              </h2>
            </div>

            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[var(--ink)] font-semibold">&ldquo;{deleteTarget.title}&rdquo;</strong> (
              <span className="font-mono">/{deleteTarget.slug}</span>)? This action cannot be
              undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--danger)] text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
