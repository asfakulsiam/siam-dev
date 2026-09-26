"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { hashIp, checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/features/contact/schema";
import { saveContactMessage, updateMessageDeliveryStatus } from "@/features/contact/queries";
import { getProfile } from "@/features/profile/queries";
import { safeRevalidateTag } from "@/lib/cache";
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
 * dynamic recipient routing to profile.email, and Resend delivery-status tracking.
 */
export async function submitContactAction(
  raw: unknown,
): Promise<ActionResponse<{ message: string; deliveryStatus?: string }>> {
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

    // 5. Dynamic recipient resolution (M.1 / Finding K3)
    // Priority: profile.email (editable in /admin/profile) -> fallback env.CONTACT_TO_EMAIL
    let recipientEmail = env.CONTACT_TO_EMAIL;
    try {
      const profile = await getProfile();
      if (profile?.email && profile.email.trim().length > 0) {
        recipientEmail = profile.email.trim();
      }
    } catch {
      // Fallback to static env recipient if profile query encounters issues
    }

    // 6. Delivery Status Tracking (M.2 / Finding K4)
    let emailStatus: "delivered" | "failed" | "skipped" = "skipped";
    let emailError: string | undefined = undefined;

    const resend = getResendClient();
    if (resend) {
      try {
        const sendResult = await resend.emails.send({
          from: env.RESEND_FROM,
          to: recipientEmail,
          subject: `[Dev Den] New message from ${parsed.data.name} (${parsed.data.projectType})`,
          text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nProject Type: ${parsed.data.projectType}\nTimeline: ${parsed.data.timeline || "Not specified"}\n\nMessage:\n${parsed.data.message}`,
        });

        if (sendResult.error) {
          emailStatus = "failed";
          emailError = sendResult.error.message || "Resend returned delivery error";
          console.warn("⚠️ [Resend] Email dispatch returned error:", sendResult.error);
        } else {
          emailStatus = "delivered";
        }
      } catch (emailErr) {
        emailStatus = "failed";
        emailError = emailErr instanceof Error ? emailErr.message : "Failed to dispatch email notification";
        console.warn("⚠️ [Resend] Email dispatch notice:", emailErr);
      }
    } else {
      emailStatus = "skipped";
      emailError = "Resend API key not configured or set to placeholder";
    }

    // 7. Persist to MongoDB with full delivery metadata
    try {
      await saveContactMessage(parsed.data, ipHash, {
        emailStatus,
        emailError,
        recipientEmail,
      });
      safeRevalidateTag("messages");
    } catch (dbErr) {
      console.error("Failed to save contact message to database:", dbErr);
    }

    return {
      ok: true,
      data: {
        message: "Thank you for reaching out. Your message has been received.",
        deliveryStatus: emailStatus,
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
 * Retries sending an email notification for a previously failed or skipped message.
 * Requires admin authorization.
 */
export async function retryMessageDeliveryAction(
  id: string,
): Promise<ActionResponse<{ delivered: boolean; emailStatus: string; error?: string }>> {
  try {
    const { requireAdmin } = await import("@/lib/auth-guard");
    const { getCollection } = await import("@/lib/db");
    const { ObjectId } = await import("mongodb");

    await requireAdmin();

    const collection = await getCollection("messages");
    let query: Record<string, unknown> = { id };
    try {
      if (ObjectId.isValid(id)) {
        query = { $or: [{ _id: new ObjectId(id) }, { id }] };
      }
    } catch {
      // Use query as is
    }

    const doc = await collection.findOne(query);
    if (!doc) {
      return { ok: false, error: "Message not found." };
    }

    let recipientEmail = env.CONTACT_TO_EMAIL;
    try {
      const profile = await getProfile();
      if (profile?.email && profile.email.trim().length > 0) {
        recipientEmail = profile.email.trim();
      }
    } catch {
      // Fallback
    }

    const resend = getResendClient();
    if (!resend) {
      await updateMessageDeliveryStatus(id, {
        emailStatus: "skipped",
        emailError: "Resend API key not configured or set to placeholder",
        recipientEmail,
      });
      safeRevalidateTag("messages");
      return {
        ok: false,
        error: "Resend API key is not configured in environment variables.",
      };
    }

    try {
      const sendResult = await resend.emails.send({
        from: env.RESEND_FROM,
        to: recipientEmail,
        subject: `[Dev Den] [Retry] New message from ${doc.name} (${doc.projectType})`,
        text: `Name: ${doc.name}\nEmail: ${doc.email}\nProject Type: ${doc.projectType}\nTimeline: ${doc.timeline || "Not specified"}\n\nMessage:\n${doc.message}`,
      });

      if (sendResult.error) {
        const errorMsg = sendResult.error.message || "Resend error occurred during delivery";
        await updateMessageDeliveryStatus(id, {
          emailStatus: "failed",
          emailError: errorMsg,
          recipientEmail,
        });
        safeRevalidateTag("messages");
        return {
          ok: false,
          error: errorMsg,
        };
      }

      await updateMessageDeliveryStatus(id, {
        emailStatus: "delivered",
        emailError: undefined,
        recipientEmail,
      });
      safeRevalidateTag("messages");
      return {
        ok: true,
        data: {
          delivered: true,
          emailStatus: "delivered",
        },
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send email";
      await updateMessageDeliveryStatus(id, {
        emailStatus: "failed",
        emailError: errorMsg,
        recipientEmail,
      });
      safeRevalidateTag("messages");
      return {
        ok: false,
        error: errorMsg,
      };
    }
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { ok: false, error: "Unauthorized. Admin session required." };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to retry message delivery",
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

    safeRevalidateTag("messages");
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

    safeRevalidateTag("messages");
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
