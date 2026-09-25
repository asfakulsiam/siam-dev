"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Project } from "@/features/projects/types";
import { createProjectAction, updateProjectAction } from "@/features/projects/actions";

interface ProjectFormProps {
  initialData?: Project;
  isEdit?: boolean;
}

export function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [category, setCategory] = useState<Project["category"]>(
    initialData?.category || "Design Systems",
  );
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [published, setPublished] = useState(initialData?.published !== false);
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear().toString());
  const [timeline, setTimeline] = useState(initialData?.timeline || "8 weeks");
  const [role, setRole] = useState(initialData?.role || "Lead Designer & Developer");
  const [client, setClient] = useState(initialData?.client || "Self-directed");
  const [summary, setSummary] = useState(initialData?.summary || "");

  // Media
  const [coverSrc, setCoverSrc] = useState(
    initialData?.coverImage?.src || "https://picsum.photos/seed/project/1200/800",
  );
  const [coverAlt, setCoverAlt] = useState(
    initialData?.coverImage?.alt || "Project showcase screenshot",
  );
  const [isUploading, setIsUploading] = useState(false);

  // Details
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "Next.js, TypeScript, Tailwind");
  const [problem, setProblem] = useState(initialData?.problem || "");
  const [solution, setSolution] = useState(initialData?.solution || "");

  // Stack & Architecture Decisions
  const [techStackInput, setTechStackInput] = useState(
    initialData?.architecture?.stack?.join(", ") || "Next.js 15, React 19, TypeScript, Tailwind CSS",
  );
  const [decisions, setDecisions] = useState<string[]>(
    initialData?.architecture?.decisions && initialData.architecture.decisions.length > 0
      ? initialData.architecture.decisions
      : ["Implemented server components by default to ensure near-zero client JS footprint."],
  );

  // Metrics
  const [metrics, setMetrics] = useState<Array<{ label: string; value: string; description?: string }>>(
    initialData?.metrics && initialData.metrics.length > 0
      ? initialData.metrics
      : [
          { label: "Core Web Vitals", value: "100%", description: "LCP under 1.2s" },
          { label: "Design Adoption", value: "+84%", description: "Across cross-functional squads" },
        ],
  );

  // Deliverables
  const [deliverables, setDeliverables] = useState<Array<{ title: string; description: string }>>(
    initialData?.deliverables && initialData.deliverables.length > 0
      ? initialData.deliverables
      : [
          { title: "Design System", description: "Tokens, Figma library, and React components" },
        ],
  );

  // External Links
  const [liveUrl, setLiveUrl] = useState(initialData?.links?.live || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.links?.github || "");

  // Auto-slug generator from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  // Cloudinary Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Fetch signed signature
      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "devden/projects" }),
      });

      if (!signRes.ok) {
        throw new Error("Failed to get Cloudinary signature");
      }

      const signData = await signRes.json();
      if (!signData.ok) {
        throw new Error(signData.error || "Signing error");
      }

      // 2. Upload file directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        throw new Error("Direct Cloudinary upload failed.");
      }

      const uploadData = await uploadRes.json();
      if (uploadData.secure_url) {
        setCoverSrc(uploadData.secure_url);
        setNotification({
          message: "Cover image successfully uploaded to Cloudinary.",
          type: "success",
        });
      }
    } catch (uploadErr) {
      console.warn("Cloudinary upload issue:", uploadErr);
      setNotification({
        message: "Cloudinary upload failed or mock credentials active. You can still input image URL manually below.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDecisionAdd = () => {
    setDecisions((prev) => [...prev, ""]);
  };

  const handleDecisionChange = (index: number, val: string) => {
    setDecisions((prev) => prev.map((d, i) => (i === index ? val : d)));
  };

  const handleDecisionRemove = (index: number) => {
    setDecisions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMetricAdd = () => {
    setMetrics((prev) => [...prev, { label: "", value: "", description: "" }]);
  };

  const handleMetricChange = (index: number, field: string, val: string) => {
    setMetrics((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: val } : m)),
    );
  };

  const handleMetricRemove = (index: number) => {
    setMetrics((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeliverableAdd = () => {
    setDeliverables((prev) => [...prev, { title: "", description: "" }]);
  };

  const handleDeliverableChange = (index: number, field: string, val: string) => {
    setDeliverables((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: val } : d)),
    );
  };

  const handleDeliverableRemove = (index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    // Parse tags & stack
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedStack = techStackInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanDecisions = decisions.map((d) => d.trim()).filter(Boolean);
    const cleanMetrics = metrics.filter((m) => m.label.trim() && m.value.trim());
    const cleanDeliverables = deliverables.filter((d) => d.title.trim());

    const projectPayload = {
      slug: slug.trim().toLowerCase(),
      title: title.trim(),
      tagline: tagline.trim(),
      category,
      featured,
      published,
      year: year.trim(),
      timeline: timeline.trim(),
      role: role.trim(),
      client: client.trim(),
      summary: summary.trim(),
      coverImage: {
        src: coverSrc.trim(),
        alt: coverAlt.trim() || `${title} cover`,
        aspectRatio: "16/9",
      },
      tags: parsedTags.length > 0 ? parsedTags : ["TypeScript"],
      problem: problem.trim() || "Problem statement describing challenges and objectives.",
      solution: solution.trim() || "Detailed solution outlining approach and craftsmanship.",
      architecture: {
        stack: parsedStack.length > 0 ? parsedStack : ["TypeScript", "Next.js"],
        decisions: cleanDecisions.length > 0 ? cleanDecisions : ["Architecture decision."],
      },
      metrics: cleanMetrics,
      deliverables: cleanDeliverables,
      links: {
        live: liveUrl.trim() || undefined,
        github: githubUrl.trim() || undefined,
      },
    };

    startTransition(async () => {
      try {
        if (isEdit) {
          const res = await updateProjectAction(initialData?.slug || slug, projectPayload);
          if (res.ok) {
            setNotification({
              message: "Project successfully updated.",
              type: "success",
            });
            router.refresh();
          } else {
            setNotification({
              message: res.error || "Failed to update project.",
              type: "error",
            });
          }
        } else {
          const res = await createProjectAction(projectPayload);
          if (res.ok) {
            setNotification({
              message: "Project successfully created.",
              type: "success",
            });
            setTimeout(() => {
              router.push("/admin/projects");
              router.refresh();
            }, 800);
          } else {
            setNotification({
              message: res.error || "Failed to create project.",
              type: "error",
            });
          }
        }
      } catch {
        setNotification({
          message: "An unexpected error occurred during submission.",
          type: "error",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            title="Return to projects"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
              {isEdit ? `Edit: ${initialData?.title}` : "Create New Project"}
            </h1>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              {isEdit
                ? `Update case study data for /work/${initialData?.slug}`
                : "Fill in the required information to publish a new case study."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="px-3.5 py-2 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3 rounded-[var(--r-sm)] text-xs font-medium border flex items-center justify-between ${
            notification.type === "success"
              ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30"
              : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="underline hover:opacity-80 text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: Core Metadata */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[var(--ink)] pb-2 border-b border-[var(--line)]">
          1. Core Metadata &amp; Identifiers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-title" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Project Title *
            </label>
            <input
              id="p-title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="e.g. Stride Design System"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="p-slug" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              URL Slug * <span className="text-[10px] lowercase text-[var(--ink-muted)]/60">(/work/[slug])</span>
            </label>
            <input
              id="p-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={isEdit}
              placeholder="stride-design-system"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label htmlFor="p-tagline" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
            Tagline / Subtitle *
          </label>
          <input
            id="p-tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
            placeholder="A unified multi-brand token engine and component architecture."
            className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="p-category" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Category *
            </label>
            <select
              id="p-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Project["category"])}
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="Design Systems">Design Systems</option>
              <option value="Full-Stack">Full-Stack</option>
              <option value="Web Applications">Web Applications</option>
              <option value="Open Source">Open Source</option>
            </select>
          </div>

          <div>
            <label htmlFor="p-year" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Year *
            </label>
            <input
              id="p-year"
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="p-timeline" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Timeline *
            </label>
            <input
              id="p-timeline"
              type="text"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              required
              placeholder="e.g. 12 weeks"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-role" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Role *
            </label>
            <input
              id="p-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              placeholder="e.g. Lead UI Engineer"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="p-client" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Client / Organization *
            </label>
            <input
              id="p-client"
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
              placeholder="e.g. Stride Systems or Self-directed"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        {/* Toggles: Featured and Published */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded-[var(--r-sm)] border-[var(--line)] text-[var(--accent)] focus:ring-[var(--focus)]"
            />
            <span>Published on portfolio site</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded-[var(--r-sm)] border-[var(--line)] text-[var(--accent)] focus:ring-[var(--focus)]"
            />
            <span>Featured showcase on homepage</span>
          </label>
        </div>
      </div>

      {/* Section 2: Media & Cover Image */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[var(--ink)] pb-2 border-b border-[var(--line)]">
          2. Cover Image &amp; Accessibility (Cloudinary / URL)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="p-cover-src" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Image URL *
              </label>
              <input
                id="p-cover-src"
                type="url"
                value={coverSrc}
                onChange={(e) => setCoverSrc(e.target.value)}
                required
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="p-cover-alt" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Image Alt Text * (WCAG 2.2 Requirement)
              </label>
              <input
                id="p-cover-alt"
                type="text"
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                required
                placeholder="Meaningful description of the screenshot or UI preview"
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            {/* Cloudinary Signed Upload Option */}
            <div className="p-3 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] space-y-2">
              <span className="block text-xs font-semibold text-[var(--ink)]">
                Direct Cloudinary Signed Upload
              </span>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer">
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{isUploading ? "Uploading to Cloudinary..." : "Choose Image File"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
              <p className="text-[10px] text-[var(--ink-muted)]">
                Signed on the server via <span className="font-mono">/api/admin/cloudinary-sign</span>
              </p>
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center p-3 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)]">
            <span className="text-[10px] font-semibold text-[var(--ink-muted)] mb-2">
              Cover Preview
            </span>
            <div className="w-full aspect-video rounded-[var(--r-sm)] overflow-hidden bg-[var(--surface)] border border-[var(--line)] relative">
              {coverSrc ? (
                <Image
                  src={coverSrc}
                  alt={coverAlt || "Preview"}
                  fill
                  sizes="350px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[var(--ink-muted)]">
                  No image provided
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Narrative & Content */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[var(--ink)] pb-2 border-b border-[var(--line)]">
          3. Project Narrative (Summary, Problem &amp; Solution)
        </h2>

        <div>
          <label htmlFor="p-summary" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
            Executive Summary *
          </label>
          <textarea
            id="p-summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            placeholder="High-level overview of the product, goals, and architectural achievements."
            className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-problem" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              The Problem *
            </label>
            <textarea
              id="p-problem"
              rows={4}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
              placeholder="What friction, debt, or UX challenge needed solving?"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="p-solution" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              The Solution *
            </label>
            <textarea
              id="p-solution"
              rows={4}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              required
              placeholder="How did design craft and engineering address this?"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Architecture, Decisions & Metrics */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-6 shadow-xs">
        <h2 className="text-sm font-bold text-[var(--ink)] pb-2 border-b border-[var(--line)]">
          4. Architecture Decisions &amp; Measurable Metrics
        </h2>

        <div>
          <label htmlFor="p-stack" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
            Technology Stack * <span className="text-[10px] lowercase text-[var(--ink-muted)]/60">(comma-separated)</span>
          </label>
          <input
            id="p-stack"
            type="text"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="p-tags" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
            Tags &amp; Skills * <span className="text-[10px] lowercase text-[var(--ink-muted)]/60">(comma-separated)</span>
          </label>
          <input
            id="p-tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        {/* Decisions Array */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-muted)]">
              Architecture Decisions
            </span>
            <button
              type="button"
              onClick={handleDecisionAdd}
              className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Decision</span>
            </button>
          </div>

          {decisions.map((decision, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={decision}
                onChange={(e) => handleDecisionChange(index, e.target.value)}
                placeholder="Architectural choice and rationale..."
                className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleDecisionRemove(index)}
                disabled={decisions.length <= 1}
                className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors disabled:opacity-30"
                title="Remove decision"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        {/* Measurable Metrics */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-muted)]">
              Measurable Metrics
            </span>
            <button
              type="button"
              onClick={handleMetricAdd}
              className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Metric</span>
            </button>
          </div>

          {metrics.map((m, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-[var(--surface-2)]/60 p-2.5 rounded-[var(--r-sm)] border border-[var(--line)]">
              <input
                type="text"
                value={m.label}
                onChange={(e) => handleMetricChange(index, "label", e.target.value)}
                placeholder="Metric Label (e.g. Speed)"
                className="px-2.5 py-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)]"
              />
              <input
                type="text"
                value={m.value}
                onChange={(e) => handleMetricChange(index, "value", e.target.value)}
                placeholder="Value (e.g. +84%)"
                className="px-2.5 py-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono font-bold"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={m.description || ""}
                  onChange={(e) => handleMetricChange(index, "description", e.target.value)}
                  placeholder="Context / details"
                  className="flex-1 px-2.5 py-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)]"
                />
                <button
                  type="button"
                  onClick={() => handleMetricRemove(index)}
                  className="p-1 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors"
                  title="Remove metric"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: External Links */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[var(--ink)] pb-2 border-b border-[var(--line)]">
          5. External Deployment &amp; Source Links
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-live" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Live Product URL <span className="text-[10px] lowercase text-[var(--ink-muted)]/60">(optional)</span>
            </label>
            <input
              id="p-live"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="p-github" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              GitHub Repository URL <span className="text-[10px] lowercase text-[var(--ink-muted)]/60">(optional)</span>
            </label>
            <input
              id="p-github"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
        <Link
          href="/admin/projects"
          className="px-4 py-2 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}</span>
        </button>
      </div>
    </form>
  );
}
