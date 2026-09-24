import { getCollection, sanitizeDocuments } from "@/lib/db";
import { ContactFormInput, ContactMessage } from "@/features/contact/schema";

/**
 * Persists a new validated contact message to MongoDB.
 */
export async function saveContactMessage(
  data: ContactFormInput,
  ipHash: string,
): Promise<{ id: string }> {
  const collection = await getCollection("messages");
  const now = new Date().toISOString();

  // Strip honeypot field before persisting
  const { honeypot: _, ...cleanData } = data;

  const result = await collection.insertOne({
    ...cleanData,
    ipHash,
    status: "unread",
    createdAt: now,
  });

  return { id: result.insertedId.toHexString() };
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
