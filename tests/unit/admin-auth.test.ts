import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import { loginAction } from "@/lib/auth-actions";
import { env } from "@/lib/env";
import { updateMessageStatusAction, deleteMessageAction } from "@/features/contact/actions";

// Mock next/headers
vi.mock("next/headers", () => {
  const store = new Map<string, string>();
  return {
    headers: vi.fn(async () => new Map([["x-forwarded-for", "127.0.0.1"]])),
    cookies: vi.fn(async () => ({
      get: vi.fn((name: string) => (store.has(name) ? { value: store.get(name) } : undefined)),
      set: vi.fn((name: string, value: string) => store.set(name, value)),
      delete: vi.fn((name: string) => store.delete(name)),
    })),
  };
});

describe("Phase 5: Authentication & Admin Security", () => {
  describe("HMAC Session Token Creation & Verification", () => {
    it("generates and verifies a valid admin session token", () => {
      const token = createSessionToken(env.ADMIN_EMAIL, "admin");
      expect(token).toBeDefined();
      expect(token.split(":")).toHaveLength(4);

      const verified = verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.email).toBe(env.ADMIN_EMAIL);
      expect(verified?.role).toBe("admin");
      expect(verified?.expiresAt).toBeGreaterThan(Date.now());
    });

    it("rejects token with tampered signature", () => {
      const token = createSessionToken(env.ADMIN_EMAIL, "admin");
      const [email, role, timestamp] = token.split(":");
      const tamperedToken = `${email}:${role}:${timestamp}:bad_hex_signature_1234567890abcdef`;

      const verified = verifySessionToken(tamperedToken);
      expect(verified).toBeNull();
    });

    it("rejects token with tampered role or email", () => {
      const token = createSessionToken(env.ADMIN_EMAIL, "admin");
      const [, role, timestamp, sig] = token.split(":");
      const tamperedEmailToken = `attacker@evil.com:${role}:${timestamp}:${sig}`;

      const verified = verifySessionToken(tamperedEmailToken);
      expect(verified).toBeNull();
    });

    it("rejects an expired session token", () => {
      // 1 hour in the past
      const pastTime = Date.now() - 3600 * 1000;
      const expiredToken = createSessionToken(env.ADMIN_EMAIL, "admin", pastTime);

      const verified = verifySessionToken(expiredToken);
      expect(verified).toBeNull();
    });

    it("rejects malformed token strings", () => {
      expect(verifySessionToken("")).toBeNull();
      expect(verifySessionToken("invalid-token")).toBeNull();
      expect(verifySessionToken("admin:admin")).toBeNull();
    });
  });

  describe("Admin Login Action Flow", () => {
    it("returns generic error on incorrect password without leaking existence", async () => {
      const res = await loginAction(env.ADMIN_EMAIL, "wrong_password_123");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Invalid email or password.");
      }
    });

    it("returns generic error on non-admin email", async () => {
      const res = await loginAction("unknown@example.com", "any_password");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBe("Invalid email or password.");
      }
    });
  });

  describe("Admin Message Actions Authorization", () => {
    it("rejects unauthenticated updateMessageStatusAction", async () => {
      const res = await updateMessageStatusAction("msg-1", "read");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });

    it("rejects unauthenticated deleteMessageAction", async () => {
      const res = await deleteMessageAction("msg-1");
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });
  });
});
