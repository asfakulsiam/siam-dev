"use client";

import { useState } from "react";
import {
  Briefcase,
  PlusCircle,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { ExperienceDocument, PhilosophyPrinciple } from "@/features/experience/schema";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "@/features/experience/actions";

interface ExperienceManagerProps {
  initialItems: ExperienceDocument[];
  initialPrinciples: PhilosophyPrinciple[];
}

export function ExperienceManager({
  initialItems,
  initialPrinciples,
}: ExperienceManagerProps) {
  const [items, setItems] = useState<ExperienceDocument[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"experience" | "principles">("experience");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Editor modal state
  const [editingItem, setEditingItem] = useState<ExperienceDocument | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [id, setId] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [period, setPeriod] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<ExperienceDocument["type"]>("Full-Time");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [achievements, setAchievements] = useState<string[]>([""]);
  const [sortOrder, setSortOrder] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ExperienceDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingItem(null);
    setId(`exp-${Date.now()}`);
    setRole("");
    setOrganization("");
    setPeriod("2024 — Present");
    setLocation("Remote / Dhaka");
    setType("Full-Time");
    setDescription("");
    setSkillsInput("TypeScript, Next.js, Architecture");
    setAchievements(["Architected scalable system components"]);
    setSortOrder(items.length);
    setIsCreatingNew(true);
  };

  const openEditModal = (item: ExperienceDocument) => {
    setEditingItem(item);
    setId(item.id);
    setRole(item.role);
    setOrganization(item.organization);
    setPeriod(item.period);
    setLocation(item.location);
    setType(item.type);
    setDescription(item.description);
    setSkillsInput(item.skills.join(", "));
    setAchievements(item.achievements && item.achievements.length > 0 ? item.achievements : [""]);
    setSortOrder(item.sortOrder || 0);
    setIsCreatingNew(true);
  };

  const handleAchievementChange = (index: number, val: string) => {
    setAchievements((prev) => prev.map((a, i) => (i === index ? val : a)));
  };

  const handleAchievementAdd = () => {
    setAchievements((prev) => [...prev, ""]);
  };

  const handleAchievementRemove = (index: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const parsedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanAchievements = achievements.map((a) => a.trim()).filter(Boolean);

    const payload = {
      id: id.trim(),
      role: role.trim(),
      organization: organization.trim(),
      period: period.trim(),
      location: location.trim(),
      type,
      description: description.trim(),
      skills: parsedSkills.length > 0 ? parsedSkills : ["Software Design"],
      achievements: cleanAchievements,
      sortOrder,
    };

    try {
      if (editingItem) {
        const res = await updateExperienceAction(editingItem.id, payload);
        if (res.ok) {
          setItems((prev) =>
            prev.map((item) => (item.id === editingItem.id ? { ...item, ...payload } : item)),
          );
          setNotification({
            message: `Updated experience at "${organization}".`,
            type: "success",
          });
          setIsCreatingNew(false);
          setEditingItem(null);
        } else {
          setNotification({
            message: res.error || "Failed to update experience.",
            type: "error",
          });
        }
      } else {
        const res = await createExperienceAction(payload);
        if (res.ok) {
          setItems((prev) => [payload as ExperienceDocument, ...prev]);
          setNotification({
            message: `Created experience at "${organization}".`,
            type: "success",
          });
          setIsCreatingNew(false);
        } else {
          setNotification({
            message: res.error || "Failed to create experience.",
            type: "error",
          });
        }
      }
    } catch {
      setNotification({
        message: "An unexpected error occurred during submission.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await deleteExperienceAction(deleteTarget.id);
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setNotification({
          message: `Removed "${deleteTarget.role}" at "${deleteTarget.organization}".`,
          type: "success",
        });
        setDeleteTarget(null);
      } else {
        setNotification({
          message: res.error || "Failed to delete experience milestone.",
          type: "error",
        });
      }
    } catch {
      setNotification({
        message: "An unexpected error occurred while deleting.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Experience &amp; Principles
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Curate your career milestones, leadership achievements, and design philosophy.
          </p>
        </div>

        {activeTab === "experience" && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Experience</span>
          </button>
        )}
      </div>

      {/* Notification Toast */}
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

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`px-3 py-1.5 rounded-[var(--r-sm)] font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "experience"
              ? "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Timeline Milestones ({items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("principles")}
          className={`px-3 py-1.5 rounded-[var(--r-sm)] font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "principles"
              ? "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Principles of Craft ({initialPrinciples.length})</span>
        </button>
      </div>

      {/* Tab 1: Experience Items */}
      {activeTab === "experience" && (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="p-8 text-center bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] text-xs text-[var(--ink-muted)]">
              No career history entries recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)] bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] overflow-hidden shadow-xs">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[var(--surface-2)]/30 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-[var(--ink)]">
                        {item.role}
                      </span>
                      <span className="text-xs text-[var(--ink-muted)]">&bull;</span>
                      <span className="text-xs font-semibold text-[var(--accent)]">
                        {item.organization}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink-muted)]">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)] font-mono">
                      <span>{item.period}</span>
                      <span>&bull;</span>
                      <span>{item.location}</span>
                    </div>

                    <p className="text-xs text-[var(--ink)]/80 leading-relaxed">
                      {item.description}
                    </p>

                    {item.skills && item.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] text-[10px] text-[var(--ink-muted)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      title="Edit experience"
                      aria-label={`Edit ${item.role} at ${item.organization}`}
                      className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      title="Delete experience"
                      aria-label={`Delete ${item.role} at ${item.organization}`}
                      className="p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--danger)]/10 text-[var(--ink-muted)] hover:text-[var(--danger)] hover:border-[var(--danger)]/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Principles of Craft */}
      {activeTab === "principles" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-[var(--ink)] pb-2 border-b border-[var(--line)]">
              Core Philosophy &amp; Craft Principles
            </h2>
            <div className="space-y-4 divide-y divide-[var(--line)]">
              {initialPrinciples.map((principle, idx) => (
                <div key={idx} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--accent)]">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-[var(--ink)]">
                      {principle.title}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-[var(--ink)]">
                    &ldquo;{principle.statement}&rdquo;
                  </p>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                    {principle.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isCreatingNew && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exp-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 space-y-5 shadow-lg my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h2 id="exp-modal-title" className="text-base font-bold text-[var(--ink)]">
                {editingItem ? `Edit: ${editingItem.organization}` : "Add Career Milestone"}
              </h2>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="exp-role" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                    Role Title *
                  </label>
                  <input
                    id="exp-role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    placeholder="e.g. Lead Designer"
                    className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="exp-org" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                    Company / Organization *
                  </label>
                  <input
                    id="exp-org"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                    placeholder="e.g. Acme Studio"
                    className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="exp-period" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                    Period *
                  </label>
                  <input
                    id="exp-period"
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    required
                    placeholder="2024 — Present"
                    className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="exp-loc" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                    Location *
                  </label>
                  <input
                    id="exp-loc"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="Remote / City"
                    className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="exp-type" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                    Type *
                  </label>
                  <select
                    id="exp-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as ExperienceDocument["type"])}
                    className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Advisory">Advisory</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="exp-desc" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                  Description *
                </label>
                <textarea
                  id="exp-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Primary engineering leadership and design responsibilities..."
                  className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="exp-skills" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                  Skills &amp; Tools * <span className="text-[10px] lowercase text-[var(--ink-muted)]/60">(comma-separated)</span>
                </label>
                <input
                  id="exp-skills"
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  required
                  placeholder="TypeScript, Next.js, Design Systems"
                  className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              {/* Key Achievements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--ink-muted)]">
                    Key Achievements
                  </span>
                  <button
                    type="button"
                    onClick={handleAchievementAdd}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    + Add bullet
                  </button>
                </div>

                {achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={a}
                      onChange={(e) => handleAchievementChange(i, e.target.value)}
                      placeholder="e.g. Scaled design adoption across 4 squads"
                      className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAchievementRemove(i)}
                      disabled={achievements.length <= 1}
                      className="p-1 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  <span>{isSubmitting ? "Saving..." : editingItem ? "Update Milestone" : "Add Milestone"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-exp-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <div className="w-9 h-9 rounded-[var(--r-sm)] bg-[var(--danger)]/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 id="delete-exp-dialog-title" className="text-base font-bold text-[var(--ink)]">
                Delete Milestone
              </h2>
            </div>

            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Are you sure you want to remove <strong className="text-[var(--ink)] font-semibold">{deleteTarget.role}</strong> at <strong className="text-[var(--ink)] font-semibold">{deleteTarget.organization}</strong>?
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
