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
  Sparkles,
  Github,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Gauge,
} from "lucide-react";
import { Project, ConversionStep } from "@/features/projects/types";
import {
  createProjectAction,
  updateProjectAction,
  importProjectFromGitHubAction,
  syncProjectFromGitHubAction,
} from "@/features/projects/actions";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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

  // Performance Metrics State (Lighthouse & Funnel Conversions for D3.js)
  const [hasPerfData, setHasPerfData] = useState<boolean>(
    Boolean(initialData?.performanceData?.lighthouse || initialData?.performanceData?.conversions),
  );
  const [perfScores, setPerfScores] = useState({
    performance: initialData?.performanceData?.lighthouse?.performance ?? 98,
    accessibility: initialData?.performanceData?.lighthouse?.accessibility ?? 100,
    bestPractices: initialData?.performanceData?.lighthouse?.bestPractices ?? 100,
    seo: initialData?.performanceData?.lighthouse?.seo ?? 100,
    fcp: initialData?.performanceData?.lighthouse?.fcp || "0.8s",
    lcp: initialData?.performanceData?.lighthouse?.lcp || "1.2s",
    cls: initialData?.performanceData?.lighthouse?.cls || "0.01",
    tbt: initialData?.performanceData?.lighthouse?.tbt || "15ms",
  });
  const [conversionFunnel, setConversionFunnel] = useState<ConversionStep[]>(
    initialData?.performanceData?.conversions && initialData.performanceData.conversions.length > 0
      ? initialData.performanceData.conversions
      : [
          { step: "Homepage Visit", rate: 100, count: 12000 },
          { step: "Case Study View", rate: 68.4, count: 8208 },
          { step: "Architecture Deep Dive", rate: 42.1, count: 5052 },
          { step: "Contact / Inquire", rate: 18.6, count: 2232 },
        ],
  );
  const [perfSummary, setPerfSummary] = useState(
    initialData?.performanceData?.summary ||
      "Achieved sub-second first-contentful paint with zero client layout shift across cold mobile caches.",
  );

  // AI Project Importer & Synchronization State
  const [showAiImport, setShowAiImport] = useState(false);
  const [aiRepoUrl, setAiRepoUrl] = useState(initialData?.links?.github || "");
  const [aiInstructions, setAiInstructions] = useState("");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  // AI Repository Analysis & Form Population
  const handleAiImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiRepoUrl.trim()) {
      setAiError("Please provide a valid GitHub repository URL.");
      return;
    }

    setAiError(null);
    setIsAiAnalyzing(true);

    try {
      const res = await importProjectFromGitHubAction(
        aiRepoUrl.trim(),
        aiInstructions.trim() || undefined,
      );

      if (!res.ok) {
        setAiError(res.error || "Failed to analyze repository.");
        return;
      }

      const d = res.data;

      // Populate existing project form fields with verified AI analysis
      if (d.title) setTitle(d.title);
      if (d.slug && !isEdit) setSlug(d.slug);
      if (d.tagline) setTagline(d.tagline);
      if (d.category) setCategory(d.category);
      if (d.year) setYear(d.year);
      if (d.timeline) setTimeline(d.timeline);
      if (d.role) setRole(d.role);
      if (d.client) setClient(d.client);
      if (d.summary) setSummary(d.summary);
      if (d.tags && d.tags.length > 0) setTagsInput(d.tags.join(", "));
      if (d.problem) setProblem(d.problem);
      if (d.solution) setSolution(d.solution);
      if (d.techStack && d.techStack.length > 0) setTechStackInput(d.techStack.join(", "));
      if (d.architectureDecisions && d.architectureDecisions.length > 0) {
        setDecisions(d.architectureDecisions);
      }
      if (d.metrics && d.metrics.length > 0) setMetrics(d.metrics);
      if (d.deliverables && d.deliverables.length > 0) setDeliverables(d.deliverables);
      if (d.githubUrl) setGithubUrl(d.githubUrl);
      if (d.liveUrl) setLiveUrl(d.liveUrl);
      if (d.coverImageAlt) setCoverAlt(d.coverImageAlt);

      setNotification({
        message: "Repository successfully analyzed with Gemini 2.5 Flash! Review the populated fields below before saving.",
        type: "success",
      });

      // Collapse AI panel cleanly
      setShowAiImport(false);
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while communicating with the AI service.",
      );
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Automated GitHub Synchronization Handler
  const handleSyncFromGitHub = async () => {
    const targetUrl = githubUrl.trim() || aiRepoUrl.trim();
    if (!targetUrl) {
      setNotification({
        message: "Please enter a GitHub repository URL to synchronize.",
        type: "error",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await syncProjectFromGitHubAction(targetUrl, {
        autoPublish: published,
        instructions: aiInstructions.trim() || undefined,
      });

      if (!res.ok) {
        setNotification({
          message: res.error || "Failed to synchronize project with GitHub.",
          type: "error",
        });
        return;
      }

      setNotification({
        message: `Successfully synchronized "${res.data.title}" from GitHub repository!`,
        type: "success",
      });
      router.refresh();
    } catch (err) {
      setNotification({
        message: err instanceof Error ? err.message : "Sync error occurred.",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConversionAdd = () => {
    setConversionFunnel((prev) => [...prev, { step: "New Stage", rate: 50 }]);
  };

  const handleConversionRemove = (index: number) => {
    setConversionFunnel((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConversionChange = (index: number, field: keyof ConversionStep, val: string | number) => {
    setConversionFunnel((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)),
    );
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
      performanceData: hasPerfData
        ? {
            lighthouse: {
              performance: Number(perfScores.performance) || 90,
              accessibility: Number(perfScores.accessibility) || 95,
              bestPractices: Number(perfScores.bestPractices) || 95,
              seo: Number(perfScores.seo) || 95,
              fcp: perfScores.fcp.trim() || undefined,
              lcp: perfScores.lcp.trim() || undefined,
              cls: perfScores.cls.trim() || undefined,
              tbt: perfScores.tbt.trim() || undefined,
            },
            conversions: conversionFunnel.map((c) => ({
              step: c.step.trim(),
              rate: Number(c.rate) || 0,
              count: c.count ? Number(c.count) : undefined,
            })),
            summary: perfSummary.trim() || undefined,
          }
        : undefined,
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
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Cancel
          </Link>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={isPending}
            isLoading={isPending}
          >
            <Save className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span>{isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}</span>
          </Button>
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
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setNotification(null)}
            className="ml-4"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Optional AI Project Importer */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[var(--r-sm)] bg-[var(--accent)]/10 text-[var(--accent)]">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--ink)]">Import from GitHub with AI</h2>
                <Badge variant="outline" size="xs" className="uppercase font-semibold">
                  Optional
                </Badge>
              </div>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                Inspect a public GitHub repository with Gemini 2.5 Flash to pre-fill the form fields below.
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowAiImport((prev) => !prev);
              setAiError(null);
            }}
            aria-expanded={showAiImport}
            className="self-start sm:self-auto"
          >
            <Github className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span>{showAiImport ? "Close AI Importer" : "Generate with AI"}</span>
            {showAiImport ? (
              <ChevronUp className="w-3.5 h-3.5 opacity-60 ml-1" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1" aria-hidden="true" />
            )}
          </Button>
        </div>

        {showAiImport && (
          <div className="mt-5 pt-4 border-t border-[var(--line)] space-y-4 animate-in fade-in duration-150">
            {aiError && (
              <div
                role="alert"
                className="p-3 rounded-[var(--r-sm)] text-xs font-medium bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold">Import Issue</p>
                  <p className="mt-0.5">{aiError}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="ai-repo-url"
                  className="block text-xs font-semibold text-[var(--ink-muted)] mb-1"
                >
                  GitHub Repository URL *
                </label>
                <div className="relative">
                  <input
                    id="ai-repo-url"
                    type="url"
                    value={aiRepoUrl}
                    onChange={(e) => setAiRepoUrl(e.target.value)}
                    disabled={isAiAnalyzing}
                    placeholder="https://github.com/username/project-name"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none disabled:opacity-50"
                  />
                  <Github
                    className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-2.5 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ai-instructions"
                  className="block text-xs font-semibold text-[var(--ink-muted)] mb-1"
                >
                  Additional Instructions <span className="text-[10px] text-[var(--ink-muted)]/60 font-normal">(optional)</span>
                </label>
                <input
                  id="ai-instructions"
                  type="text"
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  disabled={isAiAnalyzing}
                  placeholder="e.g. Keep the description concise and focus on the main technical features."
                  className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--line)]">
                <p className="text-[11px] text-[var(--ink-muted)]">
                  Inspect README, metadata, and dependencies with Gemini 2.5 Flash to populate form fields or synchronize directly to CMS.
                </p>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleSyncFromGitHub}
                    disabled={isSyncing || isAiAnalyzing || !aiRepoUrl.trim()}
                    isLoading={isSyncing}
                    title="Automatically sync latest GitHub README and metadata directly into CMS database"
                  >
                    {!isSyncing && <RefreshCw className="w-3.5 h-3.5 mr-1" aria-hidden="true" />}
                    <span>{isSyncing ? "Syncing..." : "Auto-Sync to CMS"}</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleAiImport}
                    disabled={isAiAnalyzing || isSyncing || !aiRepoUrl.trim()}
                    isLoading={isAiAnalyzing}
                  >
                    {!isAiAnalyzing && <Sparkles className="w-3.5 h-3.5 mr-1" aria-hidden="true" />}
                    <span>{isAiAnalyzing ? "Analyzing repository..." : "Populate Form Fields"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
                title={coverSrc}
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none truncate"
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
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={handleDecisionAdd}
              className="text-[var(--accent)]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Add Decision</span>
            </Button>
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
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={handleMetricAdd}
              className="text-[var(--accent)]"
            >
              <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Add Metric</span>
            </Button>
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
              title={liveUrl}
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none truncate"
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
              title={githubUrl}
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none truncate"
            />
          </div>
        </div>
      </div>

      {/* Section 6: Performance Metrics & Lighthouse Telemetry Module */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
            <h2 className="text-sm font-bold text-[var(--ink)]">
              6. Performance Metrics &amp; Lighthouse Module
            </h2>
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--ink)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasPerfData}
              onChange={(e) => setHasPerfData(e.target.checked)}
              className="rounded-[var(--r-sm)] accent-[var(--accent)]"
            />
            <span className="font-semibold">Enable D3.js Charts on Case Study</span>
          </label>
        </div>

        {hasPerfData ? (
          <div className="space-y-6 pt-2 animate-in fade-in duration-150">
            {/* Lighthouse Scores */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-[var(--ink)]">
                Google Lighthouse Audit Scores (0–100)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="lh-perf" className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    Performance
                  </label>
                  <input
                    id="lh-perf"
                    type="number"
                    min="0"
                    max="100"
                    value={perfScores.performance}
                    onChange={(e) =>
                      setPerfScores((p) => ({ ...p, performance: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="lh-a11y" className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    Accessibility
                  </label>
                  <input
                    id="lh-a11y"
                    type="number"
                    min="0"
                    max="100"
                    value={perfScores.accessibility}
                    onChange={(e) =>
                      setPerfScores((p) => ({ ...p, accessibility: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="lh-bp" className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    Best Practices
                  </label>
                  <input
                    id="lh-bp"
                    type="number"
                    min="0"
                    max="100"
                    value={perfScores.bestPractices}
                    onChange={(e) =>
                      setPerfScores((p) => ({ ...p, bestPractices: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="lh-seo" className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    SEO
                  </label>
                  <input
                    id="lh-seo"
                    type="number"
                    min="0"
                    max="100"
                    value={perfScores.seo}
                    onChange={(e) =>
                      setPerfScores((p) => ({ ...p, seo: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label htmlFor="cwv-fcp" className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    First Contentful Paint (FCP)
                  </label>
                  <input
                    id="cwv-fcp"
                    type="text"
                    value={perfScores.fcp}
                    onChange={(e) => setPerfScores((p) => ({ ...p, fcp: e.target.value }))}
                    placeholder="0.8s"
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="cwv-lcp" className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    Largest Contentful Paint (LCP)
                  </label>
                  <input
                    id="cwv-lcp"
                    type="text"
                    value={perfScores.lcp}
                    onChange={(e) => setPerfScores((p) => ({ ...p, lcp: e.target.value }))}
                    placeholder="1.2s"
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="cwv-cls" className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    Cumulative Layout Shift (CLS)
                  </label>
                  <input
                    id="cwv-cls"
                    type="text"
                    value={perfScores.cls}
                    onChange={(e) => setPerfScores((p) => ({ ...p, cls: e.target.value }))}
                    placeholder="0.01"
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="cwv-tbt" className="block text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                    Total Blocking Time (TBT)
                  </label>
                  <input
                    id="cwv-tbt"
                    type="text"
                    value={perfScores.tbt}
                    onChange={(e) => setPerfScores((p) => ({ ...p, tbt: e.target.value }))}
                    placeholder="15ms"
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Funnel Conversions */}
            <div className="space-y-3 pt-3 border-t border-[var(--line)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--ink)]">
                  Funnel Conversion Progression (D3.js Bar Chart)
                </span>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={handleConversionAdd}
                  className="text-[var(--accent)]"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  <span>Add Funnel Stage</span>
                </Button>
              </div>

              {conversionFunnel.map((step, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-[var(--surface-2)]/60 p-2.5 rounded-[var(--r-sm)] border border-[var(--line)]"
                >
                  <input
                    type="text"
                    value={step.step}
                    onChange={(e) => handleConversionChange(idx, "step", e.target.value)}
                    placeholder="Stage Name (e.g. Sign up)"
                    className="px-2.5 py-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)]"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[var(--ink-muted)] font-mono">Rate:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={step.rate}
                      onChange={(e) =>
                        handleConversionChange(idx, "rate", parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono font-bold"
                    />
                    <span className="text-xs text-[var(--ink-muted)]">%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={step.count || ""}
                      onChange={(e) =>
                        handleConversionChange(idx, "count", parseInt(e.target.value, 10) || 0)
                      }
                      placeholder="Count (optional)"
                      className="flex-1 px-2.5 py-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleConversionRemove(idx)}
                      className="p-1 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors"
                      title="Remove stage"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Summary */}
            <div className="space-y-1.5 pt-2">
              <label htmlFor="perf-summary" className="block text-xs font-semibold text-[var(--ink)]">
                Performance Executive Summary
              </label>
              <textarea
                id="perf-summary"
                rows={2}
                value={perfSummary}
                onChange={(e) => setPerfSummary(e.target.value)}
                placeholder="Key takeaways from performance optimizations and funnel improvements..."
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--ink-muted)] py-1">
            Toggle above to input Lighthouse audit scores and conversion rates to display interactive D3.js gauges and funnel charts on the case study.
          </p>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
        <Link
          href="/admin/projects"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Cancel
        </Link>
        <Button
          type="submit"
          size="sm"
          variant="primary"
          disabled={isPending}
          isLoading={isPending}
        >
          <Save className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          <span>{isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}</span>
        </Button>
      </div>
    </form>
  );
}
