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
  Palette,
} from "lucide-react";
import { ProfileDocument, Photo } from "@/features/profile/schema";
import {
  defaultIdentityPhotoSVG,
  getDefaultIdentityPhotoSVG,
  getDefaultSecondaryPhotoSVG,
} from "@/features/profile/data";
import { updateProfileAction, updateNowAction } from "@/features/profile/actions";
import { cldUrl, getDuotonePhotoUrl } from "@/lib/cloudinary";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";
import { deleteCloudinaryAssetAction } from "@/lib/cloudinary-actions";
import { PortraitFrame, DEFAULT_AVATAR_PUBLIC_ID } from "@/components/ui/PortraitFrame";
import { ThemeId, getThemeAccent } from "@/hooks/useTheme";

const PRESET_ACCENTS = [
  { label: "Auto (Theme-Adaptive)", hex: "auto" },
  { label: "Day Shift (Cobalt)", hex: "#2F4BFF" },
  { label: "Night Coder (Periwinkle)", hex: "#8AA2FF" },
  { label: "Blueprint (Yellow)", hex: "#FFE14D" },
  { label: "Mono (Grayscale)", hex: "#000000" },
  { label: "Emerald", hex: "#10B981" },
  { label: "Amber", hex: "#F59E0B" },
  { label: "Slate", hex: "#64748B" },
];

interface ProfileManagerProps {
  initialProfile: ProfileDocument;
}

export function ProfileManager({ initialProfile }: ProfileManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<"profile" | "photos" | "now" | "toolbox">("profile");

  // Admin Theme Preview state for checking duotone tints across themes
  const [previewTheme, setPreviewTheme] = useState<ThemeId>("day-shift");

  // Profile fields
  const [name, setName] = useState(initialProfile.name || "Asfakul");
  const [headline, setHeadline] = useState(initialProfile.headline || "");
  const [subheadline, setSubheadline] = useState(initialProfile.subheadline || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [email, setEmail] = useState(initialProfile.email || "");
  const [location, setLocation] = useState(initialProfile.location || "Bangladesh");
  const [timezone, setTimezone] = useState(initialProfile.timezone || "Asia/Dhaka (UTC+6)");
  const [resumeUrl, setResumeUrl] = useState(initialProfile.resume?.url || "https://drive.google.com");
  const [resumeUpdated, setResumeUpdated] = useState(initialProfile.resume?.updatedAt || "Q1 2026");
  const [availabilityOpen, setAvailabilityOpen] = useState(initialProfile.availability?.open ?? true);
  const [availabilityText, setAvailabilityText] = useState(
    initialProfile.availability?.text || "Available for contracts (Q4 2026)",
  );

  // Social Links (N.2)
  const [socials, setSocials] = useState<{ label: string; url: string }[]>(
    initialProfile.socials || [],
  );

  const handleAddSocial = () => {
    setSocials((prev) => [...prev, { label: "", url: "" }]);
  };

  const handleRemoveSocial = (idx: number) => {
    setSocials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSocial = (idx: number, field: "label" | "url", val: string) => {
    setSocials((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    );
  };

  // Identity Photos
  const [photos, setPhotos] = useState<Photo[]>(
    initialProfile.photos && initialProfile.photos.length > 0
      ? initialProfile.photos
      : [],
  );
  const [activePhotoId, setActivePhotoId] = useState<string>(
    initialProfile.activePhotoId ||
      initialProfile.photos?.[0]?.publicId ||
      DEFAULT_AVATAR_PUBLIC_ID,
  );

  // Hero Cutout Slots (Light & Dark Variants for Full-Bleed Cutout Mode)
  const [heroCutout, setHeroCutout] = useState<{
    light?: { publicId: string; alt: string };
    dark?: { publicId: string; alt: string };
  }>(
    initialProfile.heroCutout || {
      light: { publicId: "", alt: "" },
      dark: { publicId: "", alt: "" },
    },
  );

  const handleCutoutUpdate = (
    variant: "light" | "dark",
    field: "publicId" | "alt",
    val: string,
  ) => {
    setHeroCutout((prev) => ({
      ...prev,
      [variant]: {
        publicId: field === "publicId" ? val : prev?.[variant]?.publicId || "",
        alt: field === "alt" ? val : prev?.[variant]?.alt || "",
      },
    }));
  };

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
      accentColor: "#2F4BFF",
      role: "unassigned",
    };
    setPhotos((prev) => [...prev, newPhoto]);
  };

  const handleSetHeroRole = (idx: number, role: "hero-primary" | "hero-secondary" | "unassigned") => {
    setPhotos((prev) =>
      prev.map((p, i) => {
        if (i === idx) {
          return { ...p, role };
        }
        // Enforce exclusivity: if another photo held this hero role, clear it to unassigned
        if (role !== "unassigned" && p.role === role) {
          return { ...p, role: "unassigned" };
        }
        return p;
      }),
    );
  };

  const handleHeroSlotUpdate = (
    targetRole: "hero-primary" | "hero-secondary",
    field: keyof Photo,
    val: string,
  ) => {
    setPhotos((prev) => {
      const existsIndex = prev.findIndex((p) => p.role === targetRole);
      if (existsIndex >= 0) {
        return prev.map((p, i) => (i === existsIndex ? { ...p, [field]: val } : p));
      }
      // Create new photo with this role
      const newPhoto: Photo = {
        publicId: field === "publicId" ? val : "",
        alt: field === "alt" ? val : targetRole === "hero-primary" ? "Primary hero portrait" : "Secondary hero portrait",
        mood: field === "mood" ? val : "candid",
        accentColor: field === "accentColor" ? val : targetRole === "hero-primary" ? "#2F4BFF" : "#8AA2FF",
        role: targetRole,
      };
      return [newPhoto, ...prev];
    });
  };

  const handleRemovePhoto = (idx: number) => {
    const photoToRemove = photos[idx];
    if (photoToRemove?.publicId && !photoToRemove.publicId.startsWith("data:")) {
      deleteCloudinaryAssetAction(photoToRemove.publicId, "image");
    }
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    if (photoToRemove && activePhotoId === photoToRemove.publicId) {
      setActivePhotoId(newPhotos[0]?.publicId || DEFAULT_AVATAR_PUBLIC_ID);
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

    const cleanSocials = socials
      .map((s) => ({ label: s.label.trim(), url: s.url.trim() }))
      .filter((s) => s.label.length > 0 && s.url.length > 0);

    const cleanHeroCutout = {
      ...(heroCutout?.light?.publicId?.trim()
        ? {
            light: {
              publicId: heroCutout.light.publicId.trim(),
              alt: heroCutout.light.alt?.trim() || "Light theme cutout portrait",
            },
          }
        : {}),
      ...(heroCutout?.dark?.publicId?.trim()
        ? {
            dark: {
              publicId: heroCutout.dark.publicId.trim(),
              alt: heroCutout.dark.alt?.trim() || "Dark theme cutout portrait",
            },
          }
        : {}),
    };

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
      socials: cleanSocials,
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
      heroCutout: Object.keys(cleanHeroCutout).length > 0 ? cleanHeroCutout : undefined,
      activePhotoId: activePhotoId || (photos.length > 0 ? photos[0]?.publicId : DEFAULT_AVATAR_PUBLIC_ID),
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
                title={resumeUrl}
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none truncate"
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

          {/* Social Profiles & Links Editor (N.2) */}
          <div className="p-4 rounded-[var(--r-sm)] bg-[var(--surface-2)]/60 border border-[var(--line)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-[var(--ink)]">
                  Social Profiles &amp; External Links
                </span>
                <p className="text-[11px] text-[var(--ink-muted)]">
                  Rendered in the public footer, mobile sheet, and direct contact card.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSocial}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {socials.map((social, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={social.label}
                    onChange={(e) => handleUpdateSocial(sIdx, "label", e.target.value)}
                    placeholder="Platform Label (e.g. GitHub)"
                    className="w-1/3 px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <input
                    type="url"
                    value={social.url}
                    onChange={(e) => handleUpdateSocial(sIdx, "url", e.target.value)}
                    placeholder="Full Profile URL (e.g. https://github.com/username)"
                    title={social.url}
                    className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] font-mono focus:border-[var(--accent)] focus:outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(sIdx)}
                    disabled={socials.length <= 1}
                    className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors disabled:opacity-30 cursor-pointer"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Identity & Photos (Phase C & Split Frame Hero) */}
      {activeTab === "photos" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-5 sm:p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="text-sm font-bold text-[var(--ink)]">
                  Hero Photo Manager (Split Frame)
                </h2>
              </div>
              <p className="text-xs text-[var(--ink-muted)] mt-1">
                Upload photos, assign hero primary and secondary roles, and maintain WCAG 2.2 AA compliant alt text.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddPhoto}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--surface)] transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Portrait Photo</span>
            </button>
          </div>

          {/* Current Hero Assignment Summary Banner & Direct Hero Slots */}
          <div className="space-y-4">
            <div className="p-4 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[var(--ink)] block">
                  Current Hero Role Assignments:
                </span>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
                  <div>
                    <span className="text-[var(--ink-muted)]">Hero Primary: </span>
                    <span className="text-[var(--accent)] font-semibold">
                      {photos.find((p) => p.role === "hero-primary")?.alt || "None assigned (clean text-only hero)"}
                    </span>
                  </div>
                  <span className="text-[var(--line)]">•</span>
                  <div>
                    <span className="text-[var(--ink-muted)]">Hero Secondary (Accent Card): </span>
                    <span className="text-[var(--ink)] font-semibold">
                      {photos.find((p) => p.role === "hero-secondary")?.alt || "None (hidden)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Hero Photo Slots (Primary and Secondary) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Hero Slot */}
              <div className="p-4 rounded-[var(--r-md)] border-2 border-[var(--accent)]/60 bg-[var(--surface-2)]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                    <span className="font-bold text-xs text-[var(--ink)]">Slot 1: Primary Hero Photo (Full Bleed)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[var(--r-pill)] bg-[var(--accent)] text-[var(--accent-ink)] font-bold">
                    HERO PRIMARY
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-muted)]">
                  The full-bleed right-column photo panel with single soft bottom-left corner.
                </p>

                <CloudinaryUploadField
                  label="Primary Hero Photo File"
                  value={photos.find((p) => p.role === "hero-primary")?.publicId || ""}
                  alt={photos.find((p) => p.role === "hero-primary")?.alt || ""}
                  accept="image/*"
                  folder="devden/portraits"
                  required
                  altRequired
                  placeholderAlt="e.g. Asfakul in studio lighting with architectural silhouette"
                  onAltChange={(newAlt) => handleHeroSlotUpdate("hero-primary", "alt", newAlt)}
                  onUploaded={(newId) => handleHeroSlotUpdate("hero-primary", "publicId", newId)}
                  onDeleteOld={(oldId) => {
                    if (!oldId.startsWith("data:")) {
                      deleteCloudinaryAssetAction(oldId, "image");
                    }
                  }}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="text-[11px] font-semibold text-[var(--ink-muted)]">
                    Duotone Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleHeroSlotUpdate("hero-primary", "accentColor", "auto")}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                        (photos.find((p) => p.role === "hero-primary")?.accentColor || "auto") === "auto"
                          ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] font-bold"
                          : "bg-[var(--surface)] text-[var(--ink-muted)] border-[var(--line)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Auto (Theme-Adaptive)
                    </button>
                    <input
                      type="color"
                      value={
                        photos.find((p) => p.role === "hero-primary")?.accentColor &&
                        photos.find((p) => p.role === "hero-primary")?.accentColor !== "auto"
                          ? photos.find((p) => p.role === "hero-primary")?.accentColor
                          : "#2F4BFF"
                      }
                      onChange={(e) => handleHeroSlotUpdate("hero-primary", "accentColor", e.target.value)}
                      className="w-6 h-6 rounded border border-[var(--line)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={photos.find((p) => p.role === "hero-primary")?.accentColor || "auto"}
                      onChange={(e) => handleHeroSlotUpdate("hero-primary", "accentColor", e.target.value)}
                      placeholder="auto"
                      className="w-20 px-1.5 py-0.5 text-xs font-mono bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)]"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Hero Slot */}
              <div className="p-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--ink-muted)]" />
                    <span className="font-bold text-xs text-[var(--ink)]">Slot 2: Secondary Accent Photo (Tilted Card)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[var(--r-pill)] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] font-bold">
                    HERO SECONDARY
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-muted)]">
                  The small tilted card tucked at the bottom-left of the primary panel (optional).
                </p>

                <CloudinaryUploadField
                  label="Secondary Photo File"
                  value={photos.find((p) => p.role === "hero-secondary")?.publicId || ""}
                  alt={photos.find((p) => p.role === "hero-secondary")?.alt || ""}
                  accept="image/*"
                  folder="devden/portraits"
                  placeholderAlt="e.g. Asfakul candid at design workstation"
                  onAltChange={(newAlt) => handleHeroSlotUpdate("hero-secondary", "alt", newAlt)}
                  onUploaded={(newId) => handleHeroSlotUpdate("hero-secondary", "publicId", newId)}
                  onDeleteOld={(oldId) => {
                    if (!oldId.startsWith("data:")) {
                      deleteCloudinaryAssetAction(oldId, "image");
                    }
                  }}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="text-[11px] font-semibold text-[var(--ink-muted)]">
                    Duotone Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleHeroSlotUpdate("hero-secondary", "accentColor", "auto")}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                        (photos.find((p) => p.role === "hero-secondary")?.accentColor || "auto") === "auto"
                          ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)] font-bold"
                          : "bg-[var(--surface)] text-[var(--ink-muted)] border-[var(--line)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Auto (Theme-Adaptive)
                    </button>
                    <input
                      type="color"
                      value={
                        photos.find((p) => p.role === "hero-secondary")?.accentColor &&
                        photos.find((p) => p.role === "hero-secondary")?.accentColor !== "auto"
                          ? photos.find((p) => p.role === "hero-secondary")?.accentColor
                          : "#8AA2FF"
                      }
                      onChange={(e) => handleHeroSlotUpdate("hero-secondary", "accentColor", e.target.value)}
                      className="w-6 h-6 rounded border border-[var(--line)] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={photos.find((p) => p.role === "hero-secondary")?.accentColor || "auto"}
                      onChange={(e) => handleHeroSlotUpdate("hero-secondary", "accentColor", e.target.value)}
                      placeholder="auto"
                      className="w-20 px-1.5 py-0.5 text-xs font-mono bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Hero Cutout Slots (Full-Bleed Cutout Hero Mode - Phase S) */}
            <div className="p-5 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-sm font-bold text-[var(--ink)]">
                      Hero Cutout Slots (Full-Bleed Cutout Mode)
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] mt-1">
                    Upload transparent-background PNG or WebP cutouts (subject only, no background). Providing separate Light and Dark uploads ensures optimal contrast, grading, and crisp silhouettes across both light and dark themes.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[var(--r-pill)] bg-[var(--accent)] text-[var(--accent-ink)] font-bold shrink-0">
                  CUTOUT HERO
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Light Theme Cutout */}
                <div className="p-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2F4BFF]" />
                      <span className="font-bold text-xs text-[var(--ink)]">
                        Light Theme Cutout
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-[var(--r-pill)] bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-bold">
                      DAY SHIFT &amp; MONO
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-muted)]">
                    Graded for light background themes. Alpha transparent cutout required.
                  </p>

                  <CloudinaryUploadField
                    label="Light Cutout Image (PNG/WebP)"
                    value={heroCutout?.light?.publicId || ""}
                    alt={heroCutout?.light?.alt || ""}
                    accept="image/*"
                    folder="devden/portraits"
                    placeholderAlt="e.g. Asfakul architectural silhouette portrait (light)"
                    onAltChange={(newAlt) => handleCutoutUpdate("light", "alt", newAlt)}
                    onUploaded={(newId) => handleCutoutUpdate("light", "publicId", newId)}
                    onDeleteOld={(oldId) => {
                      if (!oldId.startsWith("data:")) {
                        deleteCloudinaryAssetAction(oldId, "image");
                      }
                    }}
                  />

                  {/* Light Canvas Live Preview with Bottom Fade */}
                  {heroCutout?.light?.publicId && (
                    <div className="pt-2 flex flex-col items-center">
                      <span className="text-[10px] font-mono text-[var(--ink-muted)] mb-1">
                        LIGHT CANVAS PREVIEW (BOTTOM FADE)
                      </span>
                      <div
                        className="relative w-36 h-48 bg-[#f4f6fa] rounded-[var(--r-sm)] border border-[var(--line)] overflow-hidden flex items-end justify-center"
                        style={{
                          maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                          WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                        }}
                      >
                        {heroCutout.light.publicId.startsWith("data:") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={heroCutout.light.publicId}
                            alt={heroCutout.light.alt || "Light cutout preview"}
                            className="w-full h-full object-contain object-bottom"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cldUrl(heroCutout.light.publicId)}
                            alt={heroCutout.light.alt || "Light cutout preview"}
                            className="w-full h-full object-contain object-bottom"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dark Theme Cutout */}
                <div className="p-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFE14D]" />
                      <span className="font-bold text-xs text-[var(--ink)]">
                        Dark Theme Cutout
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-[var(--r-pill)] bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-bold">
                      NIGHT CODER &amp; BLUEPRINT
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-muted)]">
                    Graded for dark background themes. Alpha transparent cutout required.
                  </p>

                  <CloudinaryUploadField
                    label="Dark Cutout Image (PNG/WebP)"
                    value={heroCutout?.dark?.publicId || ""}
                    alt={heroCutout?.dark?.alt || ""}
                    accept="image/*"
                    folder="devden/portraits"
                    placeholderAlt="e.g. Asfakul architectural silhouette portrait (dark)"
                    onAltChange={(newAlt) => handleCutoutUpdate("dark", "alt", newAlt)}
                    onUploaded={(newId) => handleCutoutUpdate("dark", "publicId", newId)}
                    onDeleteOld={(oldId) => {
                      if (!oldId.startsWith("data:")) {
                        deleteCloudinaryAssetAction(oldId, "image");
                      }
                    }}
                  />

                  {/* Dark Canvas Live Preview with Bottom Fade */}
                  {heroCutout?.dark?.publicId && (
                    <div className="pt-2 flex flex-col items-center">
                      <span className="text-[10px] font-mono text-[var(--ink-muted)] mb-1">
                        DARK CANVAS PREVIEW (BOTTOM FADE)
                      </span>
                      <div
                        className="relative w-36 h-48 bg-[#0a0f1a] rounded-[var(--r-sm)] border border-[var(--line)] overflow-hidden flex items-end justify-center"
                        style={{
                          maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                          WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                        }}
                      >
                        {heroCutout.dark.publicId.startsWith("data:") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={heroCutout.dark.publicId}
                            alt={heroCutout.dark.alt || "Dark cutout preview"}
                            className="w-full h-full object-contain object-bottom"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cldUrl(heroCutout.dark.publicId)}
                            alt={heroCutout.dark.alt || "Dark cutout preview"}
                            className="w-full h-full object-contain object-bottom"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--line)]">
            <h3 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              All Uploaded Photos &amp; Library ({photos.length})
            </h3>
            {photos.length === 0 && (
              <div className="p-8 text-center rounded-[var(--r-sm)] border border-dashed border-[var(--line)] space-y-2">
                <p className="text-xs font-semibold text-[var(--ink)]">No photos uploaded yet</p>
                <p className="text-[11px] text-[var(--ink-muted)] max-w-sm mx-auto">
                  The hero currently displays a confident text-only layout. Click &ldquo;Add Portrait Photo&rdquo; to upload an image.
                </p>
              </div>
            )}

            {photos.map((photo, pIdx) => {
              const role = photo.role || "unassigned";
              const isPrimary = role === "hero-primary";
              const isSecondary = role === "hero-secondary";

              return (
                <div
                  key={pIdx}
                  className={`p-5 rounded-[var(--r-md)] border space-y-4 transition-all ${
                    isPrimary
                      ? "border-[var(--accent)] bg-[var(--surface-2)]/60 ring-2 ring-[var(--accent)]/20"
                      : isSecondary
                      ? "border-[var(--line)] bg-[var(--surface-2)]/30 ring-1 ring-[var(--line)]"
                      : "border-[var(--line)] bg-[var(--bg)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--ink)]">
                        Photo #{pIdx + 1}
                      </span>
                      {isPrimary && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-[var(--r-pill)] bg-[var(--accent)] text-[var(--accent-ink)] font-bold">
                          <Check className="w-3 h-3" /> HERO PRIMARY
                        </span>
                      )}
                      {isSecondary && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-[var(--r-pill)] bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-bold">
                          HERO SECONDARY ACCENT
                        </span>
                      )}
                    </div>

                    {/* Role Control Actions */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetHeroRole(pIdx, "hero-primary")}
                          disabled={!photo.publicId}
                          className="px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)] font-semibold hover:bg-[var(--surface-2)] disabled:opacity-40 cursor-pointer"
                        >
                          Set as hero photo
                        </button>
                      )}

                      {!isSecondary && (
                        <button
                          type="button"
                          onClick={() => handleSetHeroRole(pIdx, "hero-secondary")}
                          disabled={!photo.publicId}
                          className="px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-semibold hover:bg-[var(--surface-2)] disabled:opacity-40 cursor-pointer"
                        >
                          Set as hero accent
                        </button>
                      )}

                      {(isPrimary || isSecondary) && (
                        <button
                          type="button"
                          onClick={() => handleSetHeroRole(pIdx, "unassigned")}
                          className="px-2.5 py-1 rounded-[var(--r-sm)] border border-transparent text-[var(--ink-muted)] hover:text-[var(--danger)] cursor-pointer"
                        >
                          Remove from hero
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(pIdx)}
                        className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                        title="Delete photo from library"
                        aria-label={`Delete photo #${pIdx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    <div className="sm:col-span-2 space-y-3">
                      <CloudinaryUploadField
                        label={`Photo #${pIdx + 1} Image File`}
                        value={photo.publicId}
                        alt={photo.alt}
                        accept="image/*"
                        folder="devden/portraits"
                        required
                        altRequired
                        placeholderAlt="Describe the portrait clearly (e.g. Asfakul in studio lighting)"
                        onAltChange={(newAlt) => handleUpdatePhoto(pIdx, "alt", newAlt)}
                        onUploaded={(newId) => handleUpdatePhoto(pIdx, "publicId", newId)}
                        onDeleteOld={(oldId) => {
                          if (!oldId.startsWith("data:")) {
                            deleteCloudinaryAssetAction(oldId, "image");
                          }
                        }}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                        {/* Accent Color / Duotone Tint Override */}
                        <div>
                          <label className="block text-xs font-semibold text-[var(--ink-muted)] mb-1 flex items-center gap-1">
                            <Palette className="w-3 h-3 text-[var(--accent)]" />
                            <span>Duotone Accent Override</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={photo.accentColor || "#2F4BFF"}
                              onChange={(e) => handleUpdatePhoto(pIdx, "accentColor", e.target.value)}
                              className="w-7 h-7 rounded border border-[var(--line)] cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={photo.accentColor || "#2F4BFF"}
                              onChange={(e) => handleUpdatePhoto(pIdx, "accentColor", e.target.value)}
                              placeholder="#2F4BFF"
                              className="w-24 px-2 py-1 text-xs font-mono bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quick preset color swatches */}
                      <div>
                        <span className="block text-[10px] text-[var(--ink-muted)] mb-1">
                          Preset Theme Tints:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {PRESET_ACCENTS.map((preset) => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => handleUpdatePhoto(pIdx, "accentColor", preset.hex)}
                              title={preset.label}
                              className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                                (photo.accentColor || "#2F4BFF").toLowerCase() === preset.hex.toLowerCase()
                                  ? "ring-2 ring-[var(--ink)] scale-110 border-white"
                                  : "border-[var(--line)] hover:scale-105"
                              }`}
                              style={{ backgroundColor: preset.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Previews Column: Split-Frame Sharp Rectangular Preview */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] space-y-2">
                      <div className="flex items-center justify-between w-full text-[9px] font-mono text-[var(--ink-muted)]">
                        <span>PREVIEW IN:</span>
                        <div className="flex items-center gap-1">
                          {(["day-shift", "night-coder", "blueprint", "mono"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setPreviewTheme(t)}
                              className={`px-1 py-0.5 rounded uppercase text-[8px] ${
                                previewTheme === t
                                  ? "bg-[var(--accent)] text-[var(--accent-ink)] font-bold"
                                  : "bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                              }`}
                            >
                              {t === "day-shift" ? "Day" : t === "night-coder" ? "Night" : t === "blueprint" ? "Blue" : "Mono"}
                            </button>
                          ))}
                        </div>
                      </div>
                      {photo.publicId ? (
                        <div className="relative w-32 h-40 rounded-bl-xl overflow-hidden border border-[var(--line)] bg-[var(--surface-2)]">
                          {photo.publicId.startsWith("data:") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getDefaultIdentityPhotoSVG(previewTheme)}
                              alt={photo.alt}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cldUrl(photo.publicId, {
                                duotone: true,
                                accent: getThemeAccent(previewTheme, photo.accentColor),
                              })}
                              alt={photo.alt}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-28 h-36 rounded-bl-xl border border-dashed border-[var(--line)] flex items-center justify-center text-[10px] text-[var(--ink-muted)]">
                          Upload photo
                        </div>
                      )}
                      <span className="text-[9px] font-mono text-[var(--ink-muted)]">
                        Tint: {getThemeAccent(previewTheme, photo.accentColor)}
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
