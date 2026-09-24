import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

export interface SessionUser {
  email: string;
  name: string;
  role: "admin" | "visitor";
}

export interface Session {
  user: SessionUser;
  expires: string;
}

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Creates an HMAC SHA-256 signature for the session payload.
 */
function signPayload(payload: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(payload).digest("hex");
}

/**
 * Generates a tamper-proof session token.
 * Format: email:role:expiresAt:signature
 */
export function createSessionToken(
  email: string,
  role: "admin" = "admin",
  expiresAt: number = Date.now() + SESSION_DURATION_MS,
): string {
  const payload = `${email}:${role}:${expiresAt}`;
  const signature = signPayload(payload);
  return `${payload}:${signature}`;
}

/**
 * Verifies and parses a session token.
 * Returns null if token is malformed, expired, or signature is invalid.
 */
export function verifySessionToken(
  token: string,
): { email: string; role: "admin"; expiresAt: number } | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 4) return null;

    const [email, role, timestampStr, signature] = parts;
    if (!email || role !== "admin" || !timestampStr || !signature) return null;

    const expiresAt = parseInt(timestampStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;

    const expectedSignature = signPayload(`${email}:${role}:${expiresAt}`);
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    if (email !== env.ADMIN_EMAIL) {
      return null;
    }

    return { email, role: "admin", expiresAt };
  } catch {
    return null;
  }
}

/**
 * Lightweight server-side session resolver.
 * Verifies the session cookie against AUTH_SECRET / admin state.
 */
export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const verified = verifySessionToken(sessionToken);
    if (!verified) {
      return null;
    }

    return {
      user: {
        email: verified.email,
        name: "Asfakul (Admin)",
        role: "admin",
      },
      expires: new Date(verified.expiresAt).toISOString(),
    };
  } catch {
    return null;
  }
}
