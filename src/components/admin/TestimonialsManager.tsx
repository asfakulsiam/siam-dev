"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Quote,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  User,
} from "lucide-react";
import { Testimonial, TestimonialInput } from "@/features/testimonials/schema";
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  togglePublishTestimonialAction,
  reorderTestimonialsAction,
} from "@/features/testimonials/actions";
import { cldUrl } from "@/lib/cloudinary";

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[];
}

export function TestimonialsManager({
  initialTestimonials,
}: TestimonialsManagerProps) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State (for both create and edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quote, setQuote] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [photoPublicId, setPhotoPublicId] = useState("");
  const [photoAlt, setPhotoAlt] = useState("");
  const [order, setOrder] = useState(0);
  const [published, setPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setQuote("");
    setAuthorName("");
    setAuthorRole("");
    setPhotoPublicId("");
    setPhotoAlt("");
    setOrder(items.length);
    setPublished(false);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setOrder(items.length);
    setIsFormOpen(true);
  };

  const openEditForm = (item: Testimonial) => {
    setEditingId(item.id);
    setQuote(item.quote);
    setAuthorName(item.authorName);
    setAuthorRole(item.authorRole || "");
    setPhotoPublicId(item.authorPhoto?.publicId || "");
    setPhotoAlt(item.authorPhoto?.alt || "");
    setOrder(item.order);
    setPublished(item.published);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "devden/testimonials" }),
      });

      if (!signRes.ok) {
        throw new Error("Failed to get upload signature from server.");
      }

      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        throw new Error("Direct Cloudinary upload failed.");
      }

      const uploadData = await uploadRes.json();
      setPhotoPublicId(uploadData.public_id);
      if (!photoAlt) {
        setPhotoAlt(`${authorName || "Author"} photo`);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload image.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (photoPublicId && !photoAlt) {
      setStatusMessage({
        type: "error",
        text: "Alt text is required for author photo accessibility.",
      });
      return;
    }

    const payload: TestimonialInput = {
      id: editingId || `tst-${Date.now()}`,
      quote: quote.trim(),
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || undefined,
      authorPhoto: photoPublicId ? { publicId: photoPublicId, alt: photoAlt.trim() } : undefined,
      order,
      published,
    };

    startTransition(async () => {
      if (editingId) {
        const res = await updateTestimonialAction(editingId, payload);
        if (res.ok) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === editingId
                ? { ...item, ...payload, updatedAt: new Date().toISOString() }
                : item,
            ),
          );
          setStatusMessage({ type: "success", text: "Testimonial updated successfully." });
          resetForm();
        } else {
          setStatusMessage({ type: "error", text: res.error });
        }
      } else {
        const res = await createTestimonialAction(payload);
        if (res.ok) {
          const newItem: Testimonial = {
            ...payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setItems((prev) => [...prev, newItem].sort((a, b) => a.order - b.order));
          setStatusMessage({ type: "success", text: "Testimonial created successfully." });
          resetForm();
        } else {
          setStatusMessage({ type: "error", text: res.error });
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete testimonial from "${name}"? This cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteTestimonialAction(id);
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setStatusMessage({ type: "success", text: "Testimonial deleted." });
      } else {
        setStatusMessage({ type: "error", text: res.error });
      }
    });
  };

  const handleTogglePublish = (id: string, currentPublished: boolean) => {
    startTransition(async () => {
      const res = await togglePublishTestimonialAction(id, !currentPublished);
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, published: !currentPublished } : item,
          ),
        );
        setStatusMessage({
          type: "success",
          text: !currentPublished
            ? "Testimonial published on portfolio site."
            : "Testimonial moved to drafts.",
        });
      } else {
        setStatusMessage({ type: "error", text: res.error });
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const currentItem = newItems[index];
    const targetItem = newItems[targetIndex];
    if (!currentItem || !targetItem) return;

    newItems[index] = targetItem;
    newItems[targetIndex] = currentItem;

    const reordered = newItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    setItems(reordered);

    startTransition(async () => {
      await reorderTestimonialsAction(
        reordered.map((item) => ({ id: item.id, order: item.order })),
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Client &amp; Colleague Endorsements
          </h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Manage quotes and recommendations displayed in the homepage scroll reveal section.
          </p>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--r-sm)] text-xs font-semibold bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Testimonial</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-[var(--r-sm)] border text-xs flex items-center justify-between gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-[var(--danger)]/10 border-[var(--danger)]/20 text-[var(--danger)]"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[10px] underline hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Drawer / Panel */}
      {isFormOpen && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <h2 className="text-base font-bold text-[var(--ink)]">
              {editingId ? "Edit Endorsement" : "Add Endorsement"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Quote */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="tst-quote"
                  className="block text-xs font-semibold text-[var(--ink-muted)]"
                >
                  Quote Statement *
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    quote.length > 380 ? "text-[var(--danger)] font-bold" : "text-[var(--ink-muted)]"
                  }`}
                >
                  {quote.length}/400
                </span>
              </div>
              <textarea
                id="tst-quote"
                rows={4}
                value={quote}
                maxLength={400}
                onChange={(e) => setQuote(e.target.value)}
                required
                placeholder="Specific statement of impact, engineering craft, leadership, or collaboration..."
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            {/* Author Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tst-author"
                  className="block text-xs font-semibold text-[var(--ink-muted)] mb-1"
                >
                  Author Name *
                </label>
                <input
                  id="tst-author"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  placeholder="e.g. Sarah Lin"
                  className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="tst-role"
                  className="block text-xs font-semibold text-[var(--ink-muted)] mb-1"
                >
                  Author Role / Affiliation <span className="text-[10px] opacity-60">(optional)</span>
                </label>
                <input
                  id="tst-role"
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="e.g. VP of Product at Stride Labs"
                  className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            {/* Author Photo */}
            <div className="p-4 rounded-[var(--r-sm)] bg-[var(--surface-2)]/60 border border-[var(--line)] space-y-4">
              <span className="block text-xs font-bold text-[var(--ink)]">
                Author Avatar / Photo <span className="text-[10px] font-normal opacity-60">(optional)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="tst-photo"
                    className="block text-xs font-semibold text-[var(--ink-muted)] mb-1"
                  >
                    Cloudinary ID / Image URL
                  </label>
                  <input
                    id="tst-photo"
                    type="text"
                    value={photoPublicId}
                    onChange={(e) => setPhotoPublicId(e.target.value)}
                    placeholder="devden/testimonials/sarah-lin"
                    className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tst-alt"
                    className="block text-xs font-semibold text-[var(--ink-muted)] mb-1"
                  >
                    Image Alt Text {photoPublicId && "* (Required for WCAG 2.2)"}
                  </label>
                  <input
                    id="tst-alt"
                    type="text"
                    value={photoAlt}
                    onChange={(e) => setPhotoAlt(e.target.value)}
                    required={!!photoPublicId}
                    placeholder="Portrait of Sarah Lin"
                    className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{isUploading ? "Uploading photo..." : "Upload Avatar"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="sr-only"
                  />
                </label>

                {photoPublicId && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--line)] relative bg-[var(--surface)]">
                      <Image
                        src={cldUrl(photoPublicId)}
                        alt={photoAlt || "Preview"}
                        fill
                        sizes="32px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPublicId("");
                        setPhotoAlt("");
                      }}
                      className="text-[10px] text-[var(--danger)] hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Publishing & Order */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded-[var(--r-sm)] border-[var(--line)] text-[var(--accent)] focus:ring-[var(--focus)]"
                />
                <span>Publish immediately on public portfolio</span>
              </label>

              <div className="flex items-center gap-2">
                <label htmlFor="tst-order" className="text-xs text-[var(--ink-muted)]">
                  Display Order:
                </label>
                <input
                  id="tst-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-16 px-2 py-1 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono text-center"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={resetForm}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                <span>{editingId ? "Save Changes" : "Create Testimonial"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Testimonials */}
      {items.length === 0 ? (
        <div className="p-12 text-center border border-[var(--line)] rounded-[var(--r-md)] bg-[var(--surface)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--ink-muted)] flex items-center justify-center mx-auto">
            <Quote className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-[var(--ink)]">Zero Testimonials Seeded</h2>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Per strict portfolio discipline, no synthetic endorsements are invented. Add verified
              client reviews or colleague testimonials to feature them on the homepage.
            </p>
          </div>
          {!isFormOpen && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--r-sm)] text-xs font-semibold bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add First Testimonial</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-5 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-[var(--ink-muted)]/50"
            >
              <div className="flex items-start gap-4 flex-1">
                {/* Avatar / Initials */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-2)] border border-[var(--line)] relative shrink-0 flex items-center justify-center">
                  {item.authorPhoto ? (
                    <Image
                      src={cldUrl(item.authorPhoto.publicId)}
                      alt={item.authorPhoto.alt}
                      fill
                      sizes="40px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-5 h-5 text-[var(--ink-muted)]" aria-hidden="true" />
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[var(--ink)]">
                      {item.authorName}
                    </span>
                    {item.authorRole && (
                      <span className="text-xs text-[var(--ink-muted)]">
                        — {item.authorRole}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-[var(--r-sm)] border ${
                        item.published
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-muted)]"
                      }`}
                    >
                      {item.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--ink)] italic line-clamp-2">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Actions & Reordering */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[var(--line)]">
                {/* Reorder Up / Down */}
                <div className="flex items-center border border-[var(--line)] rounded-[var(--r-sm)] bg-[var(--bg)]">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || isPending}
                    aria-label="Move up in order"
                    className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === items.length - 1 || isPending}
                    aria-label="Move down in order"
                    className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-30 border-l border-[var(--line)]"
                  >
                    <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Publish Toggle */}
                <button
                  type="button"
                  onClick={() => handleTogglePublish(item.id, item.published)}
                  disabled={isPending}
                  title={item.published ? "Unpublish" : "Publish"}
                  className="p-2 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
                >
                  {item.published ? (
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => openEditForm(item)}
                  disabled={isPending}
                  title="Edit testimonial"
                  className="p-2 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.authorName)}
                  disabled={isPending}
                  title="Delete testimonial"
                  className="p-2 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:text-[var(--danger)] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
