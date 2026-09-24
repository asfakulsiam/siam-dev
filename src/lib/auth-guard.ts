import { auth } from "@/lib/auth";

/**
 * Enforces admin authorization on Server Actions and Route Handlers.
 * Throws "UNAUTHORIZED" error if the caller lacks an active admin session.
 */
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
