"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { hashIp, checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/features/contact/schema";
import { saveContactMessage } from "@/features/contact/queries";
import { ActionResponse } from "@/features/projects/actions";

let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  if (!resendClient && env.RESEND_API_KEY && !env.RESEND_API_KEY.includes("placeholder")) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Handles contact form submissions with server-side validation,
 * honeypot bot trap, salted IP rate limiting, MongoDB persistence,
 * and optional Resend notification dispatch.
 */
export async function submitContactAction(
  raw: unknown,
): Promise<ActionResponse<{ message: string }>> {
  try {
    // 1. Resolve client IP and generate salted hash
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const firstIp = forwardedFor ? forwardedFor.split(",")[0] : undefined;
    const rawIp = firstIp ? firstIp.trim() : "127.0.0.1";
    const ipHash = hashIp(rawIp);

    // 2. Sliding window rate limit check (3 submissions per hour)
    const rateLimit = await checkRateLimit(ipHash, 3, 3600);
    if (!rateLimit.success) {
      return {
        ok: false,
        error: "Rate limit exceeded. Please wait a while before sending another message.",
      };
    }

    // 3. Honeypot verification (Spam prevention)
    const rawObj = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
    if (rawObj.honeypot && String(rawObj.honeypot).trim().length > 0) {
      return {
        ok: false,
        error: "Spam submission detected.",
      };
    }

    // 4. Zod schema validation
    const parsed = contactFormSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Please correct the highlighted form errors.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // 5. Persist to MongoDB
    try {
      await saveContactMessage(parsed.data, ipHash);
    } catch (dbErr) {
      console.error("Failed to save contact message to database:", dbErr);
      // Even if DB fails in disconnected environments, allow proceeding if email sends or log safely
    }

    // 6. Optional Email Notification via Resend
    const resend = getResendClient();
    if (resend) {
      try {
        await resend.emails.send({
          from: env.RESEND_FROM,
          to: env.CONTACT_TO_EMAIL,
          subject: `[Dev Den] New message from ${parsed.data.name} (${parsed.data.projectType})`,
          text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nProject Type: ${parsed.data.projectType}\nTimeline: ${parsed.data.timeline || "Not specified"}\n\nMessage:\n${parsed.data.message}`,
        });
      } catch (emailErr) {
        console.warn("⚠️ [Resend] Email dispatch notice:", emailErr);
        // Do not fail user submission if notification email fails; message is safely stored in DB
      }
    }

    return {
      ok: true,
      data: {
        message: "Thank you for reaching out. Your message has been received.",
      },
    };
  } catch (err) {
    console.error("Unhandled contact submission error:", err);
    return {
      ok: false,
      error: "An unexpected error occurred while sending your message. Please try again.",
    };
  }
}

/**
 * Updates the read/unread status of a contact message.
 * Requires admin authorization.
 */
export async function updateMessageStatusAction(
  id: string,
  status: "read" | "unread",
): Promise<ActionResponse<{ updated: boolean }>> {
  try {
    const { requireAdmin } = await import("@/lib/auth-guard");
    const { getCollection } = await import("@/lib/db");
    const { ObjectId } = await import("mongodb");
    const { revalidateTag } = await import("next/cache");

    await requireAdmin();

    const collection = await getCollection("messages");
    let query: Record<string, unknown> = { id };
    try {
      if (ObjectId.isValid(id)) {
        query = { $or: [{ _id: new ObjectId(id) }, { id }] };
      }
    } catch {
      // Use standard query
    }

    await collection.updateOne(query, {
      $set: {
        status,
        updatedAt: new Date().toISOString(),
      },
    });

    revalidateTag("messages");
    return { ok: true, data: { updated: true } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update message status",
    };
  }
}

/**
 * Deletes a contact message by ID.
 * Requires admin authorization.
 */
export async function deleteMessageAction(
  id: string,
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    const { requireAdmin } = await import("@/lib/auth-guard");
    const { getCollection } = await import("@/lib/db");
    const { ObjectId } = await import("mongodb");
    const { revalidateTag } = await import("next/cache");

    await requireAdmin();

    const collection = await getCollection("messages");
    let query: Record<string, unknown> = { id };
    try {
      if (ObjectId.isValid(id)) {
        query = { $or: [{ _id: new ObjectId(id) }, { id }] };
      }
    } catch {
      // Use standard query
    }

    const result = await collection.deleteOne(query);
    if (result.deletedCount === 0) {
      return { ok: false, error: "Message not found or already deleted." };
    }

    revalidateTag("messages");
    return { ok: true, data: { deleted: true } };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete message",
    };
  }
}
