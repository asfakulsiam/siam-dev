"use client";

import { useState } from "react";
import { Copy, Check, Clock, Globe2, ArrowUpRight } from "lucide-react";
import { staticProfile } from "@/features/profile/data";

export function DirectContactCard() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(staticProfile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6 p-6 sm:p-8 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]">
      {/* Email Copy Box */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[var(--ink)]">Direct email</span>
        <div className="flex items-center justify-between gap-2 p-3 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--bg)]">
          <span className="text-sm font-medium text-[var(--ink)] font-mono select-all">
            {staticProfile.email}
          </span>
          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label="Copy email address"
            className="p-1.5 rounded-[var(--r-sm)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--accent)]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        {copied && <p className="text-xs text-[var(--accent)] font-medium">Copied to clipboard!</p>}
      </div>

      {/* Timezone & Location */}
      <div className="space-y-2 pt-4 border-t border-[var(--line)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)]">
          <Globe2 className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
          <span>Location &amp; time</span>
        </div>
        <div className="text-sm font-medium text-[var(--ink)]">{staticProfile.location}</div>
        <div className="text-xs text-[var(--ink-muted)] flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Asia/Dhaka (UTC+6)</span>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2 pt-4 border-t border-[var(--line)]">
        <span className="text-xs font-semibold text-[var(--ink)]">
          Current capacity
        </span>
        <div className="text-xs text-[var(--ink-muted)] leading-relaxed">
          {staticProfile.availability.text}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-2 pt-4 border-t border-[var(--line)]">
        <span className="text-xs font-semibold text-[var(--ink)]">
          Profiles elsewhere
        </span>
        <ul className="space-y-1.5 text-xs">
          {staticProfile.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors py-1"
              >
                <span>{social.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
