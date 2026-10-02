"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowUpRight } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MobileSheet } from "./MobileSheet";
import { ProfileData } from "@/features/profile/data";
import { Button, buttonVariants } from "@/components/ui/Button";

const DESKTOP_NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/colophon", label: "Colophon" },
];

const MOBILE_MENU_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/colophon", label: "Colophon" },
];

interface HeaderProps {
  profile?: ProfileData;
}

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Scrolled state for backdrop blur and line
      if (currentScrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide on scroll down (> 120px threshold), reveal on scroll up
      if (currentScrollY > 120 && currentScrollY > lastScrollY) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Skip to Content accessible link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        } ${
          isScrolled
            ? "bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--line)] shadow-xs"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="text-base sm:text-lg font-bold tracking-tight text-[var(--ink)] hover:text-[var(--accent)] transition-colors focus-visible:rounded-[var(--r-sm)]"
            data-cursor-text="Home"
          >
            Asfakul
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium"
          >
            {DESKTOP_NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative py-1 text-sm transition-colors ${
                    isActive
                      ? "text-[var(--ink)] font-semibold"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                  data-cursor-text="Open"
                >
                  {link.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)] rounded-full transition-transform"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Theme */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>

            {/* Resume Button */}
            <a
              href={profile?.resume?.url || "https://drive.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "hidden sm:inline-flex gap-1.5",
              })}
              data-cursor-text="Resume"
            >
              <span>Resume</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" aria-hidden="true" />
            </a>

            {/* Mobile Menu Trigger */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden px-2"
            >
              <Menu className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <MobileSheet
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        links={MOBILE_MENU_LINKS}
        currentPath={pathname || "/"}
        profile={profile}
      />
    </>
  );
}
