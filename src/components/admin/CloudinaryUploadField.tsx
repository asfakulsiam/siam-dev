"use client";

import { useState, useRef, useId } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Video, X, Copy } from "lucide-react";
import { cldUrl } from "@/lib/cloudinary";
import { Button } from "@/components/ui/Button";

function getDisplayPublicId(val: string): string {
  if (!val) return "";
  if (val.startsWith("http://") || val.startsWith("https://")) {
    try {
      const url = new URL(val);
      // Cloudinary URL structure: /<cloud_name>/<resource_type>/upload/(v<version>/)?<public_id>.<ext>
      const match = url.pathname.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      if (match && match[1]) {
        return match[1];
      }
      return url.pathname.split("/").pop() || val;
    } catch {
      return val;
    }
  }
  return val;
}

export interface CloudinaryUploadFieldProps {
  label: string;
  value: string; // current publicId or URL
  alt: string;
  onAltChange: (v: string) => void;
  onUploaded: (publicId: string, secureUrl: string, resourceType?: "image" | "video") => void;
  accept?: string; // "image/*" | "video/*" | "image/*,video/*"
  folder: string; // e.g. "devden/memes", "devden/portraits", "devden/projects"
  required?: boolean;
  altRequired?: boolean;
  helperText?: string;
  placeholderAlt?: string;
  onDeleteOld?: (oldPublicId: string) => void;
}

export function CloudinaryUploadField({
  label,
  value,
  alt,
  onAltChange,
  onUploaded,
  accept = "image/*",
  folder,
  required = false,
  altRequired = true,
  helperText,
  placeholderAlt = "Describe this media asset for accessibility...",
  onDeleteOld,
}: CloudinaryUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const altInputId = useId();

  const isVideo = accept.includes("video") || value.endsWith(".mp4") || value.endsWith(".webm");
  const displayUrl = cldUrl(value);

  // Client-side file size and format validation (Images ≤ 10MB, Video ≤ 100MB per specs)
  const validateFile = (file: File): string | null => {
    const isImageFile = file.type.startsWith("image/");
    const isVideoFile = file.type.startsWith("video/");

    if (!isImageFile && !isVideoFile) {
      return "Unsupported file type. Please upload a standard image (JPG, PNG, WebP) or video (MP4, WebM).";
    }

    if (isImageFile && file.size > 10 * 1024 * 1024) {
      return `Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.`;
    }

    if (isVideoFile && file.size > 100 * 1024 * 1024) {
      return `Video is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 100MB.`;
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);

    // 1. Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setStatusMessage({ type: "error", text: validationError });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const oldPublicId = value;

    try {
      // 2. Fetch server-signed credentials
      const signRes = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      if (!signRes.ok) {
        throw new Error("Failed to get authorized upload signature from server.");
      }

      const signData = await signRes.json();
      if (!signData.ok) {
        throw new Error(signData.error || "Signing error");
      }

      setUploadProgress(40);

      // 3. Dispatch direct multi-part POST to Cloudinary endpoint
      const resourceType = file.type.startsWith("video/") ? "video" : "image";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!uploadRes.ok) {
        throw new Error(`Direct Cloudinary upload failed with status ${uploadRes.status}`);
      }

      const uploadData = await uploadRes.json();
      const newPublicId = uploadData.public_id || uploadData.secure_url;
      const secureUrl = uploadData.secure_url || newPublicId;

      setUploadProgress(100);

      // Trigger update with detected resource type
      onUploaded(newPublicId, secureUrl, resourceType);

      // If replacing an existing Cloudinary asset, clean up the old one
      if (oldPublicId && oldPublicId !== newPublicId && onDeleteOld) {
        onDeleteOld(oldPublicId);
      }

      setStatusMessage({
        type: "success",
        text: "Asset uploaded successfully to Cloudinary.",
      });

      // Clear the file input so the user can re-upload if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.warn("Cloudinary upload failed:", err);
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Cloudinary upload failed. You can paste the ID manually below.",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const handleManualValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUploaded(val, val);
  };

  return (
    <div className="space-y-3">
      {/* Label and Helper Text */}
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--ink)]">
          {label} {required && <span className="text-[var(--danger)]">*</span>}
        </label>
        {helperText && (
          <span className="text-[11px] text-[var(--ink-muted)]">{helperText}</span>
        )}
      </div>

      {/* Upload Zone & Preview Container */}
      <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)]/40 p-3 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Hidden File Input */}
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            aria-label={`Upload file for ${label}`}
          />

          {/* Trigger Button & State */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              isLoading={isUploading}
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>{value ? "Replace File" : "Choose File to Upload"}</span>
            </Button>

            <span className="text-[11px] text-[var(--ink-muted)]">
              {accept.includes("video") ? "MP4/WebM ≤100MB" : "Images ≤10MB"}
            </span>
          </div>

          {/* Quick toggle for manual publicId / URL entry */}
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setShowManualInput((prev) => !prev)}
            className="text-[var(--accent)] font-mono text-[11px]"
          >
            {showManualInput ? "Hide manual ID" : "Paste ID / URL"}
          </Button>
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress !== null && (
          <div className="w-full bg-[var(--line)] h-1 rounded-full overflow-hidden">
            <div
              className="bg-[var(--accent)] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Live Preview & Active Asset Badge */}
        {value && (
          <div className="flex items-center gap-3 p-2 rounded-[var(--r-sm)] bg-[var(--surface)] border border-[var(--line)]">
            <div className="relative w-12 h-12 rounded-[var(--r-sm)] bg-[var(--bg)] border border-[var(--line)] overflow-hidden shrink-0 flex items-center justify-center">
              {isVideo ? (
                <video
                  src={displayUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayUrl}
                  alt={alt || "Asset preview"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder icon on broken link
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )}
              {isVideo ? (
                <Video className="w-4 h-4 text-[var(--ink-muted)] pointer-events-none" />
              ) : (
                <ImageIcon className="w-4 h-4 text-[var(--ink-muted)] pointer-events-none" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-mono text-[var(--ink)] truncate" title={value}>
                  {getDisplayPublicId(value)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1 rounded-[var(--r-sm)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
                  title="Copy full URL/ID"
                  aria-label="Copy full URL or ID to clipboard"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3 h-3 text-[var(--accent)]" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3 h-3" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[var(--ink-muted)] truncate">
                Folder: <span className="font-mono">{folder}</span>
              </p>
            </div>
          </div>
        )}

        {/* Fallback Manual Text Input for Power Users */}
        {showManualInput && (
          <div className="space-y-1 pt-1">
            <label htmlFor={`${inputId}-manual`} className="block text-[11px] font-mono text-[var(--ink-muted)]">
              Direct Public ID or Hosted URL
            </label>
            <div className="relative">
              <input
                id={`${inputId}-manual`}
                type="text"
                value={value}
                onChange={handleManualValueChange}
                placeholder="e.g. devden/memes/waiting or https://res.cloudinary.com/..."
                title={value}
                className="w-full px-2.5 py-1.5 pr-8 text-xs font-mono bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none truncate"
                style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
              />
              {value && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  title="Copy full value"
                  aria-label="Copy full value"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`flex items-center gap-2 p-2 rounded-[var(--r-sm)] text-xs ${
              statusMessage.type === "success"
                ? "bg-[var(--accent)]/10 text-[var(--ink)] border border-[var(--accent)]/30"
                : "bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => setStatusMessage(null)}
              className="p-0.5 h-auto hover:opacity-70"
              aria-label="Dismiss status message"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Required Alt Text Input */}
      <div>
        <label htmlFor={altInputId} className="block text-xs font-semibold text-[var(--ink)] mb-1">
          Accessibility Alt Text {altRequired && <span className="text-[var(--danger)]">*</span>}
        </label>
        <input
          id={altInputId}
          type="text"
          value={alt}
          onChange={(e) => onAltChange(e.target.value)}
          required={altRequired}
          placeholder={placeholderAlt}
          className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--line)] rounded-[var(--r-sm)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
        />
        <p className="text-[10px] text-[var(--ink-muted)] mt-0.5">
          Required for screen readers and WCAG 2.2 AA accessibility compliance.
        </p>
      </div>
    </div>
  );
}
