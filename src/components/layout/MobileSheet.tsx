"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ProfileData } from "@/features/profile/data";
import { Button } from "@/components/ui/Button";

interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  currentPath: string;
  profile?: ProfileData;
}

export function MobileSheet({ isOpen, onClose, links, currentPath, profile }: MobileSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const email = profile?.email || "";
  const timezone = profile?.timezone || "Asia/Dhaka";
  const socials = profile?.socials || [];
  const displayName = profile?.name || "Asfakul";

  // Lock scroll & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      ref={dialogRef}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] text-[var(--ink)] p-6 sm:p-8 animate-in fade-in duration-200"
    >
      {/* Top row */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--line)]">
        <span className="font-bold text-lg tracking-tight">{displayName}</span>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Button
            ref={closeBtnRef}
            type="button"
            size="sm"
            variant="outline"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="px-2"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Main navigation links */}
      <nav className="flex-1 flex flex-col justify-center gap-6 py-12">
        {links.map((link, idx) => {
          const isActive = currentPath === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`text-3xl font-semibold tracking-tight transition-colors flex items-center justify-between ${
                isActive ? "text-[var(--accent)]" : "text-[var(--ink)] hover:text-[var(--accent)]"
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <span>{link.label}</span>
              <ArrowUpRight className="w-6 h-6 opacity-40" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>

      {/* Sheet footer info */}
      <div className="pt-6 border-t border-[var(--line)] flex flex-col gap-4 text-xs text-[var(--ink-muted)]">
        <div className="flex items-center justify-between">
          {email ? <span className="font-mono">{email}</span> : <span />}
          <span className="font-mono">{timezone}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-medium text-[var(--ink)]">
          {socials.map((social) => (
            <a
              key={social.url}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
            >
              {social.label}
            </a>
          ))}
          {profile?.resume?.url && (
            <a
              href={profile.resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
            >
              Resume
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
