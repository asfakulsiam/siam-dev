import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Mock router and pathname
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/admin",
}));

describe("Phase 5: Admin UI Components", () => {
  it("renders AdminLoginForm with email, password, and submit button", () => {
    render(<AdminLoginForm />);
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Sign in to Dashboard/i }),
    ).toBeDefined();
  });

  it("renders AdminHeader with brand mark and sign out button", () => {
    render(<AdminHeader />);
    expect(screen.getByText("Dev Den")).toBeDefined();
    expect(screen.getByText("Admin")).toBeDefined();
    expect(screen.getByRole("button", { name: /Sign out/i })).toBeDefined();
  });

  it("renders AdminSidebar with all primary navigation destinations", () => {
    render(<AdminSidebar unreadMessagesCount={3} />);
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Profile & Now")).toBeDefined();
    expect(screen.getByText("Experience")).toBeDefined();
    expect(screen.getByText("Messages")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined(); // unread count badge
  });

  it("renders MessagesManager with delivery badges and status filters", async () => {
    const { MessagesManager } = await import("@/components/admin/MessagesManager");

    const sampleMessages = [
      {
        id: "msg-1",
        name: "Alice Cooper",
        email: "alice@example.com",
        projectType: "Design System" as const,
        message: "Need a comprehensive tokens overhaul.",
        ipHash: "hash-1",
        status: "unread" as const,
        emailStatus: "delivered" as const,
        recipientEmail: "asfakul@devden.io",
        createdAt: new Date().toISOString(),
      },
      {
        id: "msg-2",
        name: "Bob Builder",
        email: "bob@example.com",
        projectType: "Full-Stack Web App" as const,
        message: "Need full stack engineering support.",
        ipHash: "hash-2",
        status: "read" as const,
        emailStatus: "failed" as const,
        emailError: "Resend: domain not verified",
        recipientEmail: "asfakul@devden.io",
        createdAt: new Date().toISOString(),
      },
    ];

    render(<MessagesManager initialMessages={sampleMessages} />);
    expect(screen.getByText("Alice Cooper")).toBeDefined();
    expect(screen.getByText("Bob Builder")).toBeDefined();
    expect(screen.getByText("Delivered")).toBeDefined();
    expect(screen.getByText("Email Failed")).toBeDefined();
  });
});
