"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Palette,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Sun,
  Moon,
  Compass,
  Contrast,
} from "lucide-react";
import {
  settingsInputSchema,
  SettingsInput,
  SettingsDocument,
  Theme,
} from "@/features/appearance/schema";
import { defaultMemeSVGs } from "@/features/appearance/data";
import { updateSettingsAction } from "@/features/appearance/actions";
import { MemeState } from "@/components/motion/MemeState";

interface AppearanceManagerProps {
  initialSettings: SettingsDocument;
}

const THEME_OPTIONS: { id: Theme; name: string; icon: typeof Sun; description: string; bg: string; accent: string }[] = [
  {
    id: "day-shift",
    name: "Day Shift",
    icon: Sun,
    description: "Paper light warmth with deep ink and punchy orange accent.",
    bg: "#fbfbfd",
    accent: "#ff5722",
  },
  {
    id: "night-coder",
    name: "Night Coder",
    icon: Moon,
    description: "Deep obsidian canvas with luminous amber neon focus.",
    bg: "#090a0f",
    accent: "#f59e0b",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    icon: Compass,
    description: "Cadet blueprint indigo background with electric cyan precision.",
    bg: "#0b1329",
    accent: "#38bdf8",
  },
  {
    id: "mono",
    name: "Mono (High Contrast)",
    icon: Contrast,
    description: "Stark black-and-white editorial aesthetic with maximum legibility.",
    bg: "#000000",
    accent: "#ffffff",
  },
];

const MEME_SLOTS: {
  key: keyof SettingsInput["memes"];
  label: string;
  description: string;
  context: string;
}[] = [
  {
    key: "waiting",
    label: "Idle / Waiting State",
    description: "Visible at rest on the contact form (Mr. Bean waiting / impatience vibe).",
    context: "Contact Page at rest",
  },
  {
    key: "sending",
    label: "Sending / Dispatching State",
    description: "Active when the user submits an inquiry or form is submitting.",
    context: "Contact Form submitting",
  },
  {
    key: "success",
    label: "Success / Delivered State",
    description: "Celebratory reaction when an inquiry is received cleanly.",
    context: "Contact Form success",
  },
  {
    key: "error",
    label: "Error / Goofed State",
    description: "Comic glitch / facepalm reaction when submission encounters an issue.",
    context: "Form errors or submission failures",
  },
  {
    key: "notFound",
    label: "404 Not Found State",
    description: "Confused detective searching for missing or broken routes.",
    context: "Custom 404 Page",
  },
  {
    key: "loading",
    label: "Global Loading / Brewing State",
    description: "Animated progress state when routes or queries exceed 400ms.",
    context: "Suspense fallback & loading boundaries",
  },
];

export function AppearanceManager({ initialSettings }: AppearanceManagerProps) {
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsInputSchema),
    defaultValues: {
      defaultTheme: initialSettings.defaultTheme,
      memes: initialSettings.memes,
    },
  });

  const currentTheme = watch("defaultTheme");
  const currentMemes = watch("memes");

  const onSubmit = async (data: SettingsInput) => {
    setFeedback({ type: null, message: "" });
    try {
      const res = await updateSettingsAction(data);
      if (res.ok) {
        setFeedback({
          type: "success",
          message: "Appearance and meme configurations saved successfully!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to update appearance settings.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "An unexpected network error occurred while saving.",
      });
    }
  };

  const resetToDefaultMeme = (slotKey: keyof SettingsInput["memes"]) => {
    setValue(`memes.${slotKey}.type`, "image", { shouldDirty: true });
    setValue(`memes.${slotKey}.publicId`, defaultMemeSVGs[slotKey], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header and Save CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)] tracking-wide">
            <Palette className="w-4 h-4" />
            <span>APPEARANCE & REACTION SYSTEM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] mt-1">
            Theme & Meme Engine
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Configure default first-paint theme and manage reactive meme clips across forms and error pages.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Appearance</span>
            </>
          )}
        </button>
      </div>

      {/* Live Feedback Alert */}
      {feedback.type && (
        <div
          role="alert"
          className={`flex items-center gap-3 p-4 rounded-[var(--r-sm)] border text-sm ${
            feedback.type === "success"
              ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--ink)]"
              : "bg-red-500/10 border-red-500 text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[var(--accent)] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <p className="font-medium">{feedback.message}</p>
        </div>
      )}

      {/* Section 1: Default First-Paint Theme */}
      <section className="space-y-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <h2>Default Visitor Theme</h2>
        </div>
        <p className="text-xs text-[var(--muted)]">
          The baseline theme applied to first-time visitors before any personal theme toggle or system preference.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {THEME_OPTIONS.map((theme) => {
            const Icon = theme.icon;
            const isSelected = currentTheme === theme.id;

            return (
              <label
                key={theme.id}
                className={`relative flex flex-col justify-between p-4 rounded-[var(--r-sm)] border cursor-pointer transition-all ${
                  isSelected
                    ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--surface-hover)]"
                    : "border-[var(--line)] hover:border-[var(--line-strong)] bg-[var(--surface)]"
                }`}
              >
                <input
                  type="radio"
                  value={theme.id}
                  {...register("defaultTheme")}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--ink)]" />
                    <span className="font-semibold text-sm text-[var(--ink)]">
                      {theme.name}
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-[var(--line)]"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {theme.description}
                </p>
              </label>
            );
          })}
        </div>
      </section>

      {/* Section 2: Reaction & Meme Asset Slots */}
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)]">
            Meme & Reaction Engine (6 States)
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Short, loopable clips (≤3s, MP4/WebM) or expressive stills with alt text. Fallback to comic vector SVGs if no custom URL is provided.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {MEME_SLOTS.map((slot) => {
            const slotData = currentMemes?.[slot.key] || initialSettings.memes[slot.key];
            const slotErrors = errors.memes?.[slot.key];

            return (
              <div
                key={slot.key}
                className="flex flex-col justify-between rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4"
              >
                {/* Slot Header */}
                <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--ink)]">
                        {slot.label}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-[var(--r-sm)] bg-[var(--surface-hover)] border border-[var(--line)] text-[var(--muted)]">
                        {slot.context}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {slot.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => resetToDefaultMeme(slot.key)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--accent)] hover:underline shrink-0"
                    title="Reset to default vector SVG"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Main Inputs & Preview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  {/* Inputs Column */}
                  <div className="space-y-3">
                    {/* Media Type */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                        Asset Format
                      </label>
                      <select
                        {...register(`memes.${slot.key}.type`)}
                        className="w-full text-xs rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1.5 text-[var(--ink)] focus:outline-[var(--focus)]"
                      >
                        <option value="image">Image / SVG / Still</option>
                        <option value="video">Short Video Loop (MP4/WebM)</option>
                      </select>
                    </div>

                    {/* Public ID / URL */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                        Cloudinary Public ID or URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register(`memes.${slot.key}.publicId`)}
                        placeholder="e.g. devden/memes/waiting or https://..."
                        className={`w-full text-xs rounded-[var(--r-sm)] border bg-[var(--bg)] px-2.5 py-1.5 text-[var(--ink)] font-mono focus:outline-[var(--focus)] ${
                          slotErrors?.publicId ? "border-red-500" : "border-[var(--line)]"
                        }`}
                      />
                      {slotErrors?.publicId && (
                        <p className="text-[11px] text-red-500 mt-0.5">
                          {slotErrors.publicId.message}
                        </p>
                      )}
                    </div>

                    {/* Video Poster (if type === 'video') */}
                    {watch(`memes.${slot.key}.type`) === "video" && (
                      <div>
                        <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                          Poster Frame Public ID / URL
                        </label>
                        <input
                          type="text"
                          {...register(`memes.${slot.key}.posterPublicId`)}
                          placeholder="devden/memes/waiting-poster"
                          className="w-full text-xs rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1.5 text-[var(--ink)] font-mono focus:outline-[var(--focus)]"
                        />
                      </div>
                    )}

                    {/* Mandatory Alt Text */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--ink)] mb-1">
                        Accessibility Alt Text <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register(`memes.${slot.key}.alt`)}
                        placeholder="Describe the comic reaction..."
                        className={`w-full text-xs rounded-[var(--r-sm)] border bg-[var(--bg)] px-2.5 py-1.5 text-[var(--ink)] focus:outline-[var(--focus)] ${
                          slotErrors?.alt ? "border-red-500" : "border-[var(--line)]"
                        }`}
                      />
                      {slotErrors?.alt && (
                        <p className="text-[11px] text-red-500 mt-0.5">
                          {slotErrors.alt.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preview Column */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--bg)]">
                    <span className="text-[10px] font-mono text-[var(--muted)] mb-2">
                      LIVE PREVIEW
                    </span>
                    <MemeState
                      asset={{
                        type: watch(`memes.${slot.key}.type`) || "image",
                        publicId:
                          watch(`memes.${slot.key}.publicId`) ||
                          defaultMemeSVGs[slot.key],
                        alt: watch(`memes.${slot.key}.alt`) || "Preview asset",
                        posterPublicId: watch(
                          `memes.${slot.key}.posterPublicId`,
                        ),
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </form>
  );
}
