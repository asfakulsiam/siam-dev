"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { contactFormSchema, type ContactFormInput } from "../schema";
import { submitContactAction } from "../actions";
import { MemeState } from "@/components/motion/MemeState";
import { defaultMemeSVGs } from "@/features/appearance/data";
import { MemeAsset } from "@/features/appearance/schema";

interface ContactFormProps {
  memes?: {
    waiting: MemeAsset;
    sending: MemeAsset;
    success: MemeAsset;
    error: MemeAsset;
  };
  fallbackEmail?: string;
}

export function ContactForm({ memes, fallbackEmail }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [messageLength, setMessageLength] = useState<number>(0);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalCloseBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [showToast]);

  // Modal accessibility: lock scroll and handle Esc key
  useEffect(() => {
    if (!showModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button
    const focusTimer = setTimeout(() => {
      modalCloseBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  const memeAssets = {
    waiting: memes?.waiting || {
      type: "image" as const,
      publicId: defaultMemeSVGs.waiting,
      alt: "Character checking wristwatch while waiting for your message",
    },
    sending: memes?.sending || {
      type: "image" as const,
      publicId: defaultMemeSVGs.sending,
      alt: "Origami rocket in motion dispatching your note",
    },
    success: memes?.success || {
      type: "image" as const,
      publicId: defaultMemeSVGs.success,
      alt: "Delivered cleanly! Cheerful thumbs up",
    },
    error: memes?.error || {
      type: "image" as const,
      publicId: defaultMemeSVGs.error,
      alt: "Comic facepalm indicating submission glitch",
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      projectType: "Full-Stack Web App",
      timeline: "1–3 months",
      message: "",
      honeypot: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: ContactFormInput) => {
    setErrorMessage("");

    // Bot check
    if (data.honeypot && data.honeypot.length > 0) {
      setStatus("success");
      setShowToast(true);
      setShowModal(true);
      return;
    }

    setStatus("submitting");

    try {
      const res = await submitContactAction(data);
      if (res.ok) {
        setStatus("success");
        setShowToast(true);
        setShowModal(true);
        reset();
      } else {
        setStatus("error");
        if (res.errors) {
          Object.entries(res.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              setError(field as keyof ContactFormInput, {
                type: "server",
                message: messages[0],
              });
            }
          });
        }
        setErrorMessage(
          res.error ||
            "Please check the highlighted fields below and try again.",
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        fallbackEmail
          ? `Something went wrong while sending your note. Please email ${fallbackEmail} directly.`
          : "Something went wrong while sending your note. Please try again or reach out directly.",
      );
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrorMessage("");
    setMessageLength(0);
    setShowToast(false);
    setShowModal(false);
    reset();
  };

  const currentMemeAsset =
    status === "submitting"
      ? memeAssets.sending
      : status === "error"
      ? memeAssets.error
      : memeAssets.waiting;

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md p-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-floating)] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="p-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold text-[var(--ink)]">Message Dispatched</p>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Your message was sent successfully. Average reply time is under 48 hours.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            aria-label="Dismiss notification"
            className="p-1 rounded-[var(--r-sm)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Accessible Success Modal Dialog */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 text-center space-y-5 shadow-[var(--shadow-floating)] animate-in zoom-in-95 duration-150">
            <button
              ref={modalCloseBtnRef}
              type="button"
              onClick={() => setShowModal(false)}
              aria-label="Close success dialog"
              className="absolute top-4 right-4 p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex justify-center">
              <MemeState asset={memeAssets.success} maxLoops={3} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)]">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 id="success-modal-title" className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
                Message Received
              </h3>
              <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed max-w-sm mx-auto">
                Thank you for reaching out. I review all inquiries personally and will respond to your
                email within 24 to 48 hours.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto"
              >
                Got It
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                Send Another Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reactive Meme Status Companion */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)]">
        <MemeState asset={currentMemeAsset} maxLoops={3} className="shrink-0" />
        <div className="text-center sm:text-left space-y-1">
          <span className="text-xs font-semibold text-[var(--accent)]">
            {status === "submitting"
              ? "Sending message..."
              : status === "error"
              ? "Transmission issue"
              : "Ready when you are"}
          </span>
          <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
            {status === "submitting"
              ? "Encrypting payload and transmitting via secure API proxy."
              : status === "error"
              ? "The note couldn't be delivered. Check highlighted fields below."
              : "Drop a note below for architectural consultation, full-stack contracts, or design systems."}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="p-6 sm:p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-6"
      >
        {/* Honeypot field (hidden from view and assistive tech) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="contact-honeypot">Leave this blank</label>
          <input
            id="contact-honeypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("honeypot")}
          />
        </div>

        {status === "error" && errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 rounded-[var(--r-sm)] border border-[var(--danger)] bg-[var(--danger)]/10 text-xs text-[var(--ink)] flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" aria-hidden="true" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Name & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="contact-name" className="text-xs font-medium text-[var(--ink)] block">
              Your Name <span className="text-[var(--accent)]" aria-hidden="true">*</span>
            </label>
            <Input
              id="contact-name"
              type="text"
              placeholder="Jane Doe"
              error={!!errors.name}
              aria-invalid={!!errors.name}
              aria-required="true"
              aria-describedby={errors.name ? "name-error" : undefined}
              autoComplete="name"
              {...register("name")}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="text-xs text-[var(--danger)] font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-email" className="text-xs font-medium text-[var(--ink)] block">
              Email Address <span className="text-[var(--accent)]" aria-hidden="true">*</span>
            </label>
            <Input
              id="contact-email"
              type="email"
              placeholder="jane@example.com"
              error={!!errors.email}
              aria-invalid={!!errors.email}
              aria-required="true"
              aria-describedby={errors.email ? "email-error" : undefined}
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-xs text-[var(--danger)] font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Project Type & Timeline Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="contact-type" className="text-xs font-medium text-[var(--ink)] block">
              Project Scope
            </label>
            <select
              id="contact-type"
              {...register("projectType")}
              className="w-full h-10 px-3.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-1 transition-colors hover:border-[var(--ink-muted)]"
            >
              <option value="Full-Stack Web App">Full-Stack Web App</option>
              <option value="Design System">Design System</option>
              <option value="Frontend Engineering">Frontend Engineering</option>
              <option value="Consulting / Audit">Consulting / Technical Audit</option>
              <option value="Other">Other / General Inquiry</option>
            </select>
            {errors.projectType && (
              <p id="project-type-error" role="alert" className="text-xs text-[var(--danger)] font-medium">
                {errors.projectType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-timeline" className="text-xs font-medium text-[var(--ink)] block">
              Expected Timeline
            </label>
            <select
              id="contact-timeline"
              {...register("timeline")}
              className="w-full h-10 px-3.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus)] focus-visible:outline-offset-1 transition-colors hover:border-[var(--ink-muted)]"
            >
              <option value="Immediately (within 2 weeks)">Immediately (within 2 weeks)</option>
              <option value="1–3 months">1–3 months</option>
              <option value="3–6 months">3–6 months</option>
              <option value="Flexible / Discovery">Flexible / Discovery</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="contact-message" className="text-xs font-medium text-[var(--ink)] block">
              Project Details & Context <span className="text-[var(--accent)]" aria-hidden="true">*</span>
            </label>
            <span
              className={`text-[11px] font-mono ${
                messageLength > 3000
                  ? "text-[var(--danger)] font-semibold"
                  : "text-[var(--ink-muted)]"
              }`}
              aria-live="polite"
            >
              {messageLength}/3,000 chars
            </span>
          </div>
          <Textarea
            id="contact-message"
            rows={5}
            placeholder="Tell me about your product goals, architectural constraints, and desired outcomes (min 10 characters)..."
            error={!!errors.message}
            aria-invalid={!!errors.message}
            aria-required="true"
            aria-describedby={errors.message ? "message-error" : undefined}
            {...register("message", {
              onChange: (e) => setMessageLength(e.target.value.length),
            })}
          />
          {errors.message && (
            <p id="message-error" role="alert" className="text-xs text-[var(--danger)] font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.message.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            disabled={status === "submitting"}
            className="w-full sm:w-auto"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                <span>Sending note...</span>
              </>
            ) : (
              <span>Send Message</span>
            )}
          </Button>
          <p className="text-xs text-[var(--ink-muted)] font-mono">
            Average reply time: under 48 hours
          </p>
        </div>
      </form>
    </div>
  );
}
