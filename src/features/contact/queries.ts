import { getCollection, sanitizeDocuments } from "@/lib/db";
import { ContactFormInput, ContactMessage } from "@/features/contact/schema";

export interface MessageDeliveryOptions {
  emailStatus?: "delivered" | "failed" | "skipped";
  emailError?: string;
  recipientEmail?: string;
}

/**
 * Persists a new validated contact message to MongoDB.
 */
export async function saveContactMessage(
  data: ContactFormInput,
  ipHash: string,
  delivery?: MessageDeliveryOptions,
): Promise<{ id: string }> {
  const collection = await getCollection("messages");
  const now = new Date().toISOString();

  // Strip honeypot field before persisting
  const { honeypot: _, ...cleanData } = data;

  const result = await collection.insertOne({
    ...cleanData,
    ipHash,
    status: "unread",
    emailStatus: delivery?.emailStatus || "skipped",
    emailError: delivery?.emailError,
    recipientEmail: delivery?.recipientEmail,
    createdAt: now,
  });

  return { id: result.insertedId.toHexString() };
}

/**
 * Updates delivery status for an existing contact message.
 */
export async function updateMessageDeliveryStatus(
  id: string,
  delivery: MessageDeliveryOptions,
): Promise<void> {
  try {
    const { ObjectId } = await import("mongodb");
    const collection = await getCollection("messages");
    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }] };
    }

    await collection.updateOne(query, {
      $set: {
        emailStatus: delivery.emailStatus || "skipped",
        emailError: delivery.emailError,
        recipientEmail: delivery.recipientEmail,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.warn("⚠️ [DB] Unable to update message delivery status:", err);
  }
}

/**
 * Retrieves all contact submissions for admin review.
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const collection = await getCollection("messages");
    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return sanitizeDocuments<ContactMessage>(docs);
  } catch (err) {
    console.warn("⚠️ [DB] Unable to fetch contact messages:", err);
    return [];
  }
}
