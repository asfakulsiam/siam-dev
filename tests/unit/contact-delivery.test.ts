import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveContactMessage, updateMessageDeliveryStatus } from "@/features/contact/queries";
import { retryMessageDeliveryAction } from "@/features/contact/actions";

// Mock auth-guard
vi.mock("@/lib/auth-guard", () => ({
  requireAdmin: vi.fn(async () => {
    throw new Error("UNAUTHORIZED");
  }),
}));

// Mock MongoDB
const mockInsertOne = vi.fn(async (doc: Record<string, unknown>) => ({
  insertedId: { toHexString: () => "mock-msg-id-12345" },
}));
const mockUpdateOne = vi.fn(async () => ({ matchedCount: 1, modifiedCount: 1 }));

vi.mock("@/lib/db", () => ({
  getCollection: vi.fn(async () => ({
    insertOne: mockInsertOne,
    updateOne: mockUpdateOne,
    findOne: vi.fn(async () => null),
  })),
  sanitizeDocuments: vi.fn((docs) => docs),
}));

describe("Phase M: Contact Email Delivery & Admin Status Tracking (K3, K4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists email delivery metadata (emailStatus, emailError, recipientEmail) via saveContactMessage", async () => {
    const input = {
      name: "Jordan Lee",
      email: "jordan@company.com",
      projectType: "Full-Stack Web App" as const,
      timeline: "Immediately",
      message: "Looking for an expert contractor to build our Next.js web application.",
    };

    const delivery = {
      emailStatus: "delivered" as const,
      recipientEmail: "asfakul.custom@portfolio.dev",
    };

    const result = await saveContactMessage(input, "salted-ip-hash-abc", delivery);
    expect(result.id).toBe("mock-msg-id-12345");

    expect(mockInsertOne).toHaveBeenCalledTimes(1);
    const savedDoc = mockInsertOne.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(savedDoc.emailStatus).toBe("delivered");
    expect(savedDoc.recipientEmail).toBe("asfakul.custom@portfolio.dev");
    expect(savedDoc.name).toBe("Jordan Lee");
    expect(savedDoc.status).toBe("unread");
  });

  it("records failed delivery status and error message when email dispatch encounters failure", async () => {
    const input = {
      name: "Marcus Brody",
      email: "marcus@museum.org",
      projectType: "Consulting / Audit" as const,
      message: "Need a comprehensive performance audit of our catalog frontend.",
    };

    const delivery = {
      emailStatus: "failed" as const,
      emailError: "Resend: domain not verified",
      recipientEmail: "owner@devden.io",
    };

    await saveContactMessage(input, "ip-hash-xyz", delivery);

    const savedDoc = mockInsertOne.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(savedDoc.emailStatus).toBe("failed");
    expect(savedDoc.emailError).toBe("Resend: domain not verified");
    expect(savedDoc.recipientEmail).toBe("owner@devden.io");
  });

  it("updates message delivery status via updateMessageDeliveryStatus", async () => {
    await updateMessageDeliveryStatus("mock-msg-id-12345", {
      emailStatus: "delivered",
      recipientEmail: "verified@inbox.com",
    });

    expect(mockUpdateOne).toHaveBeenCalledTimes(1);
  });

  it("enforces requireAdmin on retryMessageDeliveryAction", async () => {
    const res = await retryMessageDeliveryAction("mock-msg-id-12345");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Unauthorized");
    }
  });
});
