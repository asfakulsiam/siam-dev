"use client";

import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--surface)] border-b border-[var(--line)] px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation drawer"
          className="md:hidden p-1.5 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:opacity-80 transition-opacity"
        >
          <Menu className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Brand */}
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm font-bold text-[var(--ink)] tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] flex items-center justify-center font-mono text-xs">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span>Dev Den</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-[var(--r-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink-muted)]">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <AdminSignOutButton />
      </div>
    </header>
  );
}
