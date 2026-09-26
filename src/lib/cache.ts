import {
  unstable_cache as nextUnstableCache,
  revalidateTag as nextRevalidateTag,
  revalidatePath as nextRevalidatePath,
} from "next/cache";

/**
 * Universal safe wrapper around Next.js `unstable_cache`.
 * 
 * In the Next.js server runtime (next dev, next build, next start), it leverages
 * Next.js Incremental Cache with tag-based revalidation (e.g. tags: ["profile"]).
 * In standalone test runners (Vitest) or CLI migration scripts (tsx) where Next.js's
 * internal `incrementalCache` context is not initialized, it seamlessly falls back
 * directly to the wrapped fetcher function without throwing invariant errors.
 */
export function safeUnstableCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyParts?: string[],
  options?: { tags?: string[]; revalidate?: number | false },
): T {
  let cachedFn: T | null = null;

  try {
    cachedFn = nextUnstableCache(fn, keyParts, options) as T;
  } catch {
    return fn;
  }

  return (async (...args: unknown[]) => {
    if (cachedFn) {
      try {
        return await cachedFn(...args);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.message.includes("incrementalCache missing") || err.message.includes("Invariant"))
        ) {
          return await fn(...args);
        }
        throw err;
      }
    }
    return await fn(...args);
  }) as T;
}

/**
 * Universal safe wrapper around Next.js `revalidateTag`.
 * Dispatches tag invalidation in Next.js runtime; gracefully no-ops in isolated unit tests.
 */
export function safeRevalidateTag(tag: string): void {
  try {
    nextRevalidateTag(tag);
  } catch {
    // Isolated test environment fallback
  }
}

/**
 * Universal safe wrapper around Next.js `revalidatePath`.
 * Dispatches route/layout invalidation in Next.js runtime; gracefully no-ops in isolated unit tests.
 */
export function safeRevalidatePath(path: string, type?: "layout" | "page"): void {
  try {
    nextRevalidatePath(path, type);
  } catch {
    // Isolated test environment fallback
  }
}

