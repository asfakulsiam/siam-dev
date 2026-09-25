"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  UserCog,
  Briefcase,
  Mail,
  Palette,
  ExternalLink,
  PlusCircle,
  MessageSquareQuote,
} from "lucide-react";

interface AdminSidebarProps {
  unreadMessagesCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  unreadMessagesCount = 0,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Projects",
      href: "/admin/projects",
      icon: FolderKanban,
      exact: false,
    },
    {
      label: "Profile & Now",
      href: "/admin/profile",
      icon: UserCog,
      exact: false,
    },
    {
      label: "Experience",
      href: "/admin/experience",
      icon: Briefcase,
      exact: false,
    },
    {
      label: "Testimonials",
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
      exact: false,
    },
    {
      label: "Appearance & Memes",
      href: "/admin/appearance",
      icon: Palette,
      exact: false,
    },
    {
      label: "Messages",
      href: "/admin/messages",
      icon: Mail,
      exact: false,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-64 bg-[var(--surface)] border-r border-[var(--line)] flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Quick Action Button */}
          <Link
            href="/admin/projects/new"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>Create New Project</span>
          </Link>

          {/* Navigation Links */}
          <nav aria-label="Admin Navigation" className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[var(--r-sm)] transition-colors ${
                    isActive
                      ? "bg-[var(--surface-2)] text-[var(--ink)] font-semibold border-l-2 border-[var(--accent)]"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[var(--accent)]" : "opacity-70"}`} aria-hidden="true" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--accent)] text-[var(--accent-ink)] tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[var(--line)]">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
          </Link>
          <p className="mt-2 text-[10px] text-[var(--ink-muted)]/60">
            Dev Den Admin &bull; v0.1.0
          </p>
        </div>
      </aside>
    </>
  );
}
