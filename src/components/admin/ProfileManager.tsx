"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Wrench,
  User,
  Plus,
  Trash2,
  Camera,
  Check,
  Sparkles,
} from "lucide-react";
import { ProfileDocument, Photo } from "@/features/profile/schema";
import { defaultIdentityPhotoSVG } from "@/features/profile/data";
import { updateProfileAction, updateNowAction } from "@/features/profile/actions";
import { cldUrl, getDuotonePhotoUrl } from "@/lib/cloudinary";

interface ProfileManagerProps {
  initialProfile: ProfileDocument;
}

export function ProfileManager({ initialProfile }: ProfileManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<"profile" | "photos" | "now" | "toolbox">("profile");

  // Profile fields
  const [name, setName] = useState(initialProfile.name || "Asfakul");
  const [headline, setHeadline] = useState(initialProfile.headline || "");
  const [subheadline, setSubheadline] = useState(initialProfile.subheadline || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [email, setEmail] = useState(initialProfile.email || "hello@asfakul.com");
  const [location, setLocation] = useState(initialProfile.location || "Bangladesh");
  const [timezone, setTimezone] = useState(initialProfile.timezone || "Asia/Dhaka (UTC+6)");
  const [resumeUrl, setResumeUrl] = useState(initialProfile.resume?.url || "https://drive.google.com");
  const [resumeUpdated, setResumeUpdated] = useState(initialProfile.resume?.updatedAt || "Q1 2026");
  const [availabilityOpen, setAvailabilityOpen] = useState(initialProfile.availability?.open ?? true);
  const [availabilityText, setAvailabilityText] = useState(
    initialProfile.availability?.text || "Available for Select Q2 2026 Engagements",
  );

  // Identity Photos
  const [photos, setPhotos] = useState<Photo[]>(
    initialProfile.photos && initialProfile.photos.length > 0
      ? initialProfile.photos
      : [
          {
            publicId: defaultIdentityPhotoSVG,
            alt: "Asfakul in studio lighting with architectural silhouette",
            mood: "working",
          },
        ],
  );
  const [activePhotoId, setActivePhotoId] = useState<string>(
    initialProfile.activePhotoId || initialProfile.photos?.[0]?.publicId || defaultIdentityPhotoSVG,
  );

  // "Now" fields
  const [nowTitle, setNowTitle] = useState(initialProfile.now?.title || "What I am building now");
  const [nowBody, setNowBody] = useState(
    initialProfile.now?.body ||
      "Designing multi-brand design systems and exploring zero-latency edge architecture.",
  );
  const [nowUpdated, setNowUpdated] = useState(initialProfile.now?.updatedAt || "September 2026");

  // Toolbox
  const [toolbox, setToolbox] = useState(
    initialProfile.toolbox && initialProfile.toolbox.length > 0
      ? initialProfile.toolbox
      : [
          { group: "Design & Systems", items: ["Figma", "Design Tokens", "Typography Hierarchy", "WCAG 2.2 AA"] },
          { group: "Frontend Architecture", items: ["Next.js App Router", "React 19", "TypeScript", "Tailwind CSS"] },
          { group: "Backend & Cloud", items: ["Node.js", "MongoDB", "Cloudinary", "Resend"] },
        ],
  );

  const handleToolboxItemChange = (groupIndex: number, itemsString: string) => {
    const items = itemsString.split(",").map((s) => s.trim()).filter(Boolean);
    setToolbox((prev) =>
      prev.map((g, idx) => (idx === groupIndex ? { ...g, items } : g)),
    );
  };

  const handleToolboxGroupAdd = () => {
    setToolbox((prev) => [...prev, { group: "New Category", items: ["Item 1", "Item 2"] }]);
  };

  const handleToolboxGroupRemove = (groupIndex: number) => {
    setToolbox((prev) => prev.filter((_, idx) => idx !== groupIndex));
  };

  const handleAddPhoto = () => {
    const newPhoto: Photo = {
      publicId: "",
      alt: "Asfakul portfolio portrait",
      mood: "candid",
    };
    setPhotos((prev) => [...prev, newPhoto]);
  };

  const handleRemovePhoto = (idx: number) => {
    const photoToRemove = photos[idx];
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    const firstPhoto = newPhotos[0];
    if (photoToRemove && activePhotoId === photoToRemove.publicId && firstPhoto) {
      setActivePhotoId(firstPhoto.publicId);
    }
  };

  const handleUpdatePhoto = (idx: number, field: keyof Photo, val: string) => {
    setPhotos((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)),
    );
  };

  const handleSaveProfile = () => {
    setNotification(null);

    // Validation check for photos
    for (const photo of photos) {
      if (!photo.publicId.trim()) {
        setNotification({
          message: "Every photo must have a valid public ID or image URL.",
          type: "error",
        });
        return;
      }
      if (!photo.alt.trim()) {
        setNotification({
          message: "Alt text is mandatory for every photo to maintain WCAG accessibility.",
          type: "error",
        });
        return;
      }
    }

    const payload = {
      name: name.trim(),
      headline: headline.trim(),
      subheadline: subheadline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      timezone: timezone.trim(),
      availability: {
        open: availabilityOpen,
        text: availabilityText.trim(),
      },
      email: email.trim(),
      socials: initialProfile.socials || [
        { label: "GitHub", url: "https://github.com" },
        { label: "LinkedIn", url: "https://linkedin.com" },
      ],
      resume: {
        url: resumeUrl.trim(),
        updatedAt: resumeUpdated.trim(),
      },
      now: {
        title: nowTitle.trim(),
        body: nowBody.trim(),
        updatedAt: nowUpdated.trim(),
      },
      toolbox,
      photos,
      activePhotoId: activePhotoId || photos[0]?.publicId,
    };

    startTransition(async () => {
      try {
        const res = await updateProfileAction(payload);
        if (res.ok) {
          setNotification({
            message: "Profile, identity photos, and settings saved successfully.",
            type: "success",
          });
          router.refresh();
        } else {
          setNotification({
            message: res.error || "Failed to update profile.",
            type: "error",
          });
        }
      } catch {
        setNotification({
          message: "An unexpected error occurred while saving profile.",
          type: "error",
        });
      } finally {
        setTimeout(() => setNotification(null), 4000);
      }
    });
  };

  const handleSaveNowOnly = () => {
    setNotification(null);

    const nowPayload = {
      title: nowTitle.trim(),
      body: nowBody.trim(),
      updatedAt: nowUpdated.trim(),
    };

    startTransition(async () => {
      try {
        const res = await updateNowAction(nowPayload);
        if (res.ok) {
          setNotification({
            message: '"Now" section updated successfully.',
            type: "success",
          });
          router.refresh();
        } else {
          setNotification({
            message: res.error || 'Failed to update "Now" section.',
            type: "error",
          });
        }
      } catch {
        setNotification({
          message: 'An unexpected error occurred while saving "Now" section.',
          type: "error",
        });
      } finally {
        setTimeout(() => setNotification(null), 4000);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Profile &amp; Identity Manager
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Manage your biography, identity portraits, contact links, availability, and &ldquo;Now&rdquo; exploration.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          <span>{isPending ? "Saving..." : "Save All Changes"}</span>
        </button>
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

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-1.5 rounded-[var(--r-sm)] font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "profile"
              ? "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          <User className="w-3.5 h-3.5" aria-hidden="true" />
          <span>General Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("photos")}
          className={`px-3 py-1.5 rounded-[var(--r-sm)] font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "photos"
              ? "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Camera className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Identity &amp; Photos ({photos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("now")}
          className={`px-3 py-1.5 rounded-[var(--r-sm)] font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "now"
              ? "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>&ldquo;Now&rdquo; Section</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("toolbox")}
          className={`px-3 py-1.5 rounded-[var(--r-sm)] font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "toolbox"
              ? "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Toolbox &amp; Skills</span>
        </button>
      </div>

      {/* Tab 1: General Profile */}
      {activeTab === "profile" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-name" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Display Name *
              </label>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-email" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Contact Email *
              </label>
              <input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="prof-headline" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Headline *
            </label>
            <input
              id="prof-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              placeholder="Web Designer & Full-Stack Developer"
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="prof-subheadline" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Subheadline *
            </label>
            <input
              id="prof-subheadline"
              type="text"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="prof-bio" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Biography &amp; Narrative *
            </label>
            <textarea
              id="prof-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-loc" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Location *
              </label>
              <input
                id="prof-loc"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-tz" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Timezone *
              </label>
              <input
                id="prof-tz"
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {/* Availability Status */}
          <div className="p-4 rounded-[var(--r-sm)] bg-[var(--surface-2)]/60 border border-[var(--line)] space-y-3">
            <span className="block text-xs font-bold text-[var(--ink)]">
              Availability Status Badge
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={availabilityOpen}
                  onChange={(e) => setAvailabilityOpen(e.target.checked)}
                  className="rounded-[var(--r-sm)] border-[var(--line)] text-[var(--accent)] focus:ring-[var(--focus)]"
                />
                <span>Open for new client engagements</span>
              </label>
            </div>
            <div>
              <label htmlFor="prof-avail-text" className="block text-xs text-[var(--ink-muted)] mb-1">
                Availability Badge Text
              </label>
              <input
                id="prof-avail-text"
                type="text"
                value={availabilityText}
                onChange={(e) => setAvailabilityText(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {/* Resume Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="prof-resume-url" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Resume URL (Google Drive / CDN) *
              </label>
              <input
                id="prof-resume-url"
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-resume-upd" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                Resume Version / Date *
              </label>
              <input
                id="prof-resume-upd"
                type="text"
                value={resumeUpdated}
                onChange={(e) => setResumeUpdated(e.target.value)}
                required
                placeholder="Q1 2026"
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Identity & Photos (Phase C) */}
      {activeTab === "photos" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="text-sm font-bold text-[var(--ink)]">
                  Identity Portraits &amp; Hero Mask Reveal
                </h2>
              </div>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Upload portraits, set the active hero mask photo, and maintain WCAG 2.2 AA compliant alt text.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddPhoto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--surface)] transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Portrait Photo</span>
            </button>
          </div>

          <div className="space-y-6">
            {photos.map((photo, pIdx) => {
              const isActive = (activePhotoId || photos[0]?.publicId) === photo.publicId;
              const photoDeliveryUrl = cldUrl(photo.publicId);
              const duotoneUrl = getDuotonePhotoUrl(photo.publicId);

              return (
                <div
                  key={pIdx}
                  className={`p-5 rounded-[var(--r-md)] border space-y-4 transition-all ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--surface-2)]/60 ring-2 ring-[var(--accent)]/20"
                      : "border-[var(--line)] bg-[var(--bg)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--ink)]">
                        Portrait #{pIdx + 1}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-[var(--r-pill)] bg-[var(--accent)] text-[var(--accent-ink)] font-bold">
                          <Check className="w-3 h-3" /> ACTIVE HERO PHOTO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => setActivePhotoId(photo.publicId)}
                          disabled={!photo.publicId}
                          className="text-[11px] font-mono text-[var(--accent)] hover:underline disabled:opacity-30"
                        >
                          Set as Active
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(pIdx)}
                        disabled={photos.length <= 1}
                        className="p-1 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors disabled:opacity-30"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    <div className="sm:col-span-2 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                          Cloudinary Public ID or Image URL *
                        </label>
                        <input
                          type="text"
                          value={photo.publicId}
                          onChange={(e) => handleUpdatePhoto(pIdx, "publicId", e.target.value)}
                          placeholder="e.g. devden/portraits/asfakul-working or https://..."
                          required
                          className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--ink)] mb-1">
                          Accessibility Alt Text * (Mandatory)
                        </label>
                        <input
                          type="text"
                          value={photo.alt}
                          onChange={(e) => handleUpdatePhoto(pIdx, "alt", e.target.value)}
                          placeholder="Describe the portrait clearly (e.g. Asfakul in studio lighting)"
                          required
                          className="w-full px-3 py-2 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
                          Mood / Setting (Optional)
                        </label>
                        <input
                          type="text"
                          value={photo.mood || ""}
                          onChange={(e) => handleUpdatePhoto(pIdx, "mood", e.target.value)}
                          placeholder="e.g. working, candid, formal"
                          className="w-full px-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Previews Column */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] space-y-2">
                      <span className="text-[10px] font-mono text-[var(--ink-muted)]">
                        LIVE PREVIEW
                      </span>
                      {photo.publicId ? (
                        <div className="relative w-28 h-36 rounded-[var(--r-sm)] overflow-hidden border border-[var(--line)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoDeliveryUrl}
                            alt={photo.alt || "Portrait preview"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-36 rounded-[var(--r-sm)] border border-dashed border-[var(--line)] flex items-center justify-center text-[10px] text-[var(--ink-muted)]">
                          No URL
                        </div>
                      )}
                      <span className="text-[9px] font-mono text-[var(--ink-muted)]">
                        Duotone Transform Applied
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: "Now" Section */}
      {activeTab === "now" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">
                The &ldquo;Now&rdquo; Micro-Section (/about and homepage card)
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Keeps visitors updated on your current projects, learning, and reading.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveNowOnly}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
            >
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              <span>Save &ldquo;Now&rdquo;</span>
            </button>
          </div>

          <div>
            <label htmlFor="now-heading" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Section Title *
            </label>
            <input
              id="now-heading"
              type="text"
              value={nowTitle}
              onChange={(e) => setNowTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="now-body" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Current Focus Statement *
            </label>
            <textarea
              id="now-body"
              rows={4}
              value={nowBody}
              onChange={(e) => setNowBody(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="now-updated" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Last Updated Timestamp *
            </label>
            <input
              id="now-updated"
              type="text"
              value={nowUpdated}
              onChange={(e) => setNowUpdated(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Toolbox & Skills */}
      {activeTab === "toolbox" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h2 className="text-sm font-bold text-[var(--ink)]">
                Toolbox &amp; Technical Proficiencies
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Organized categories rendered on the /about page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToolboxGroupAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Group</span>
            </button>
          </div>

          <div className="space-y-4">
            {toolbox.map((group, gIdx) => (
              <div
                key={gIdx}
                className="p-4 rounded-[var(--r-sm)] bg-[var(--surface-2)]/60 border border-[var(--line)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={group.group}
                    onChange={(e) => {
                      const newGroup = e.target.value;
                      setToolbox((prev) =>
                        prev.map((g, idx) => (idx === gIdx ? { ...g, group: newGroup } : g)),
                      );
                    }}
                    placeholder="Category Name"
                    className="font-semibold text-xs text-[var(--ink)] bg-[var(--bg)] px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--line)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleToolboxGroupRemove(gIdx)}
                    disabled={toolbox.length <= 1}
                    className="p-1 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors disabled:opacity-30"
                    title="Remove category"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--ink-muted)] mb-1">
                    Skills / Tools (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={group.items.join(", ")}
                    onChange={(e) => handleToolboxItemChange(gIdx, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
