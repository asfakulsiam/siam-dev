import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createSessionToken, verifySessionToken } from "@/lib/auth";
import { env } from "@/lib/env";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { staticProjects } from "@/features/projects/data";
import {
  updateMessageStatusAction,
  deleteMessageAction,
} from "@/features/contact/actions";

// Mock router and navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin",
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map([["x-forwarded-for", "127.0.0.1"]])),
  cookies: vi.fn(async () => ({
    get: vi.fn(() => undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe("Phase 5: Authentication & Admin CMS", () => {
  describe("HMAC Session Token Engine", () => {
    it("creates a verifiable tamper-proof session token", () => {
      const email = env.ADMIN_EMAIL;
      const token = createSessionToken(email, "admin");
      expect(typeof token).toBe("string");
      expect(token.split(":").length).toBe(4);

      const verified = verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.email).toBe(email);
      expect(verified?.role).toBe("admin");
    });

    it("rejects tampered session tokens", () => {
      const email = env.ADMIN_EMAIL;
      const token = createSessionToken(email, "admin");
      const tampered = token.replace("admin", "superadmin");
      const verified = verifySessionToken(tampered);
      expect(verified).toBeNull();
    });

    it("rejects tokens for mismatched admin emails", () => {
      const wrongEmail = "intruder@evil.com";
      const token = createSessionToken(wrongEmail, "admin");
      const verified = verifySessionToken(token);
      expect(verified).toBeNull();
    });

    it("rejects expired tokens", () => {
      const email = env.ADMIN_EMAIL;
      const expiredTimestamp = Date.now() - 10000;
      const expiredToken = createSessionToken(email, "admin", expiredTimestamp);
      const verified = verifySessionToken(expiredToken);
      expect(verified).toBeNull();
    });
  });

  describe("Admin Authorization on Inbound Messages", () => {
    it("rejects unauthenticated updateMessageStatusAction", async () => {
      const res = await updateMessageStatusAction("msg-123", "read");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });

    it("rejects unauthenticated deleteMessageAction", async () => {
      const res = await deleteMessageAction("msg-123");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });
  });

  describe("Admin UI Components Rendering", () => {
    it("renders AdminLoginForm with accessible elements", () => {
      render(<AdminLoginForm />);
      expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
      expect(screen.getByLabelText(/^Password/i)).toBeDefined();
      expect(
        screen.getByRole("button", { name: /Sign in to Dashboard/i }),
      ).toBeDefined();
    });

    it("renders AdminSidebar with navigation links and badge count", () => {
      render(<AdminSidebar unreadMessagesCount={3} isOpen={true} />);
      expect(screen.getByText("Overview")).toBeDefined();
      expect(screen.getByText("Projects")).toBeDefined();
      expect(screen.getByText("Profile & Now")).toBeDefined();
      expect(screen.getByText("Experience")).toBeDefined();
      expect(screen.getByText("Messages")).toBeDefined();
      expect(screen.getByText("3")).toBeDefined();
    });

    it("renders AdminHeader with brand mark and controls", () => {
      render(<AdminHeader onToggleSidebar={() => {}} />);
      expect(screen.getByText("Dev Den")).toBeDefined();
      expect(screen.getByText("Admin")).toBeDefined();
      expect(screen.getByLabelText(/Sign out/i)).toBeDefined();
    });

    it("renders ProjectsManager with search filter and project cards", () => {
      render(<ProjectsManager initialProjects={staticProjects} />);
      expect(screen.getByPlaceholderText(/Search projects/i)).toBeDefined();
      expect(screen.getByText("Stride Design System")).toBeDefined();
      expect(screen.getByText("Pulse Analytics Platform")).toBeDefined();
    });
  });
});
