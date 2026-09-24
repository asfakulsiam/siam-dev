"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { contactFormSchema, type ContactFormInput } from "../schema";
import { submitContactAction } from "../actions";

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormInput>({
    name: "",
    email: "",
    projectType: "Full-Stack Web App",
    timeline: "1–3 months",
    message: "",
    honeypot: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormInput, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on edit
    if (errors[name as keyof ContactFormInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate using Zod
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormInput, string>> = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof ContactFormInput;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    // Bot check
    if (formData.honeypot && formData.honeypot.length > 0) {
      // Silently accept bots without doing anything
      setStatus("success");
      return;
    }

    setStatus("submitting");

    try {
      const res = await submitContactAction(formData);
      if (res.ok) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          projectType: "Full-Stack Web App",
          timeline: "1–3 months",
          message: "",
          honeypot: "",
        });
        setErrors({});
      } else {
        setStatus("error");
        setErrorMessage(
          res.error ||
            "Something went wrong while sending your note. Please email hello@asfakul.com directly.",
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "Something went wrong while sending your note. Please email hello@asfakul.com directly.",
      );
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-8 sm:p-10 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)]">
          <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--ink)]">Message Received</h3>
        <p className="text-sm text-[var(--ink-muted)] max-w-md mx-auto leading-relaxed">
          Thank you for reaching out. I review all inquiries personally and will respond to your
          email within 24 to 48 hours.
        </p>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="p-6 sm:p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] space-y-6"
    >
      {/* Honeypot field (hidden from view and assistive tech) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-honeypot">Leave this blank</label>
        <input
          id="contact-honeypot"
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status === "error" && errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Name & Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-xs font-medium text-[var(--ink)] block">
            Your Name <span className="text-[var(--accent)]">*</span>
          </label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            required
            autoComplete="name"
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-[var(--accent)] font-medium">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contact-email" className="text-xs font-medium text-[var(--ink)] block">
            Email Address <span className="text-[var(--accent)]">*</span>
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            required
            autoComplete="email"
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-[var(--accent)] font-medium">
              {errors.email}
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
            name="projectType"
            value={formData.projectType}
            onChange={handleChange}
            className="w-full h-11 px-3.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--bg)] text-xs sm:text-sm text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] transition-colors"
          >
            <option value="Full-Stack Web App">Full-Stack Web App</option>
            <option value="Design System">Design System</option>
            <option value="Frontend Engineering">Frontend Engineering</option>
            <option value="Consulting / Audit">Consulting / Technical Audit</option>
            <option value="Other">Other / General Inquiry</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="contact-timeline" className="text-xs font-medium text-[var(--ink)] block">
            Expected Timeline
          </label>
          <select
            id="contact-timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            className="w-full h-11 px-3.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--bg)] text-xs sm:text-sm text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] transition-colors"
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
        <label htmlFor="contact-message" className="text-xs font-medium text-[var(--ink)] block">
          Project Details & Context <span className="text-[var(--accent)]">*</span>
        </label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder="Tell me about your product goals, architectural constraints, and desired outcomes..."
          value={formData.message}
          onChange={handleChange}
          error={!!errors.message}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          required
        />
        {errors.message && (
          <p id="message-error" className="text-xs text-[var(--accent)] font-medium">
            {errors.message}
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
  );
}
