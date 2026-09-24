"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, Copy, Check } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { FooterWordmark } from "@/components/motion/FooterWordmark";

export function Footer() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [dhakaTime, setDhakaTime] = useState("");

  const email = "hello@asfakul.com";

  // Calculate live Asia/Dhaka time each minute
  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Dhaka",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        setDhakaTime(formatter.format(new Date()));
      } catch {
        setDhakaTime("14:30");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-[var(--surface)] text-[var(--ink)] border-t border-[var(--line)] pt-16 pb-12 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-16">
        {/* Top Section: Project Inquiry & Email Copy */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-[var(--line)]">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
              Have a project in mind?
            </h2>
            <p className="text-sm sm:text-base text-[var(--ink-muted)]">
              Available for full-stack engineering and product design contracts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${email}`}
              className="text-base sm:text-xl font-mono text-[var(--ink)] hover:text-[var(--accent)] transition-colors underline decoration-[var(--line)] underline-offset-8"
              data-cursor-text="Mail"
            >
              {email}
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              aria-label="Copy email address to clipboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--success)]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
                  <span>Copy email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Middle Section: Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          {/* Pages */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Pages
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/work"
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  Work
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/colophon"
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  Colophon
                </Link>
              </li>
            </ul>
          </div>

          {/* Elsewhere */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Elsewhere
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  Resume
                </a>
              </li>
            </ul>
          </div>

          {/* Status & Local Time */}
          <div className="space-y-3 col-span-2 sm:col-span-1">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Status
            </div>
            <div className="space-y-2 text-[var(--ink-muted)]">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-[var(--ink)] font-medium">Open for work</span>
              </div>
              <div className="font-mono text-xs">
                Dhaka · {dhakaTime ? `${dhakaTime} (local time)` : "Loading..."}
              </div>
              <div className="text-xs">Built in 2026</div>
            </div>
          </div>

          {/* Design & Craft Statement */}
          <div className="space-y-3 col-span-2 sm:col-span-1">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              Craft
            </div>
            <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
              Designed with strict 4px rhythm, variable typography, zero-pill discipline, and full
              accessibility.
            </p>
          </div>
        </div>

        {/* Giant Signature Wordmark (M7) */}
        <FooterWordmark />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--line)] text-xs text-[var(--ink-muted)]">
          <div className="flex items-center gap-4">
            <span>© 2026 Asfakul. All rights reserved.</span>
            <Link href="/colophon" className="hover:text-[var(--ink)] transition-colors underline">
              Colophon
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top of page"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-[var(--r-sm)] border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
