import crypto from "node:crypto";
import { env } from "@/lib/env";
import { getCollection } from "@/lib/db";

// In-memory sliding window fallback for offline/development/test
const inMemoryLimits = new Map<string, number[]>();

/**
 * Creates an irreversible salted SHA-256 hash of an IP address.
 * Raw IP addresses are NEVER stored or logged.
 */
export function hashIp(rawIp: string): string {
  const salt = env.IP_HASH_SALT || "fallback_dev_salt_string";
  return crypto
    .createHmac("sha256", salt)
    .update(rawIp || "127.0.0.1")
    .digest("hex");
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

/**
 * Sliding window rate limiter.
 * Default: 3 requests per 3600 seconds (1 hour).
 */
export async function checkRateLimit(
  key: string,
  limit = 3,
  windowSeconds = 3600,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  // Try MongoDB storage first
  try {
    const collection = await getCollection<{
      key: string;
      timestamps: number[];
      expiresAt: Date;
    }>("rate_limits");

    const record = await collection.findOne({ key });
    const currentTimestamps = record?.timestamps?.filter((t) => t > windowStart) || [];

    if (currentTimestamps.length >= limit) {
      const oldestInWindow = Math.min(...currentTimestamps);
      const resetMs = oldestInWindow + windowMs - now;
      return {
        success: false,
        limit,
        remaining: 0,
        resetMs: Math.max(0, resetMs),
      };
    }

    currentTimestamps.push(now);
    await collection.updateOne(
      { key },
      {
        $set: {
          timestamps: currentTimestamps,
          expiresAt: new Date(now + windowMs),
        },
      },
      { upsert: true },
    );

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - currentTimestamps.length),
      resetMs: windowMs,
    };
  } catch {
    // Graceful fallback to in-memory sliding window
    const timestamps = (inMemoryLimits.get(key) || []).filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
      const oldest = Math.min(...timestamps);
      return {
        success: false,
        limit,
        remaining: 0,
        resetMs: Math.max(0, oldest + windowMs - now),
      };
    }

    timestamps.push(now);
    inMemoryLimits.set(key, timestamps);

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - timestamps.length),
      resetMs: windowMs,
    };
  }
}
