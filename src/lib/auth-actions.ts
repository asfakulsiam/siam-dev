"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";
import { hashIp, checkRateLimit } from "@/lib/rate-limit";
import { createSessionToken } from "@/lib/auth";

export type AuthResponse =
  | { ok: true }
  | { ok: false; error: string };

const SESSION_COOKIE_NAME = "admin_session";

/**
 * Handles admin login with bcrypt password verification,
 * rate limiting (5 attempts per 15 minutes per IP+email hash),
 * and secure HTTP-only cookie creation.
 */
export async function loginAction(
  emailInput: string,
  passwordInput: string,
): Promise<AuthResponse> {
  try {
    // 1. Resolve client IP and rate-limit key
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const firstIp = forwardedFor ? forwardedFor.split(",")[0] : undefined;
    const rawIp = firstIp ? firstIp.trim() : "127.0.0.1";
    const ipHash = hashIp(rawIp);
    const loginRateKey = `login:${ipHash}:${hashIp(emailInput.trim().toLowerCase())}`;

    // 2. Sliding window check: 5 attempts per 15 minutes (900 seconds)
    const rateLimit = await checkRateLimit(loginRateKey, 5, 900);
    if (!rateLimit.success) {
      return {
        ok: false,
        error: "Too many login attempts. Please wait 15 minutes before trying again.",
      };
    }

    // 3. Credentials verification
    const emailMatches = emailInput.trim().toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
    const passwordMatches = await bcrypt.compare(passwordInput, env.ADMIN_PASSWORD_HASH);

    if (!emailMatches || !passwordMatches) {
      // Generic error message: never reveal whether the email exists or password was wrong
      return {
        ok: false,
        error: "Invalid email or password.",
      };
    }

    // 4. Create and set secure session token
    const token = createSessionToken(env.ADMIN_EMAIL, "admin");
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return { ok: true };
  } catch (err) {
    console.error("Login action error:", err);
    return {
      ok: false,
      error: "An unexpected error occurred during authentication. Please try again.",
    };
  }
}

/**
 * Handles admin sign out: deletes session cookie and redirects to login.
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
