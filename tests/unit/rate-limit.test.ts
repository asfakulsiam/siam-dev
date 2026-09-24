import { describe, it, expect } from "vitest";
import { hashIp, checkRateLimit } from "@/lib/rate-limit";

describe("Rate Limiting and IP Hashing", () => {
  it("generates deterministic SHA-256 hashes for IP addresses", () => {
    const ip1 = "192.168.1.100";
    const hash1a = hashIp(ip1);
    const hash1b = hashIp(ip1);

    expect(hash1a).toBe(hash1b);
    expect(hash1a).toHaveLength(64); // SHA-256 hex string length
    expect(hash1a).not.toContain(ip1); // Never leaks raw IP
  });

  it("produces distinct hashes for different IP addresses", () => {
    const hashA = hashIp("10.0.0.1");
    const hashB = hashIp("10.0.0.2");

    expect(hashA).not.toBe(hashB);
  });

  it("handles fallback if raw IP is undefined or empty", () => {
    const hashEmpty = hashIp("");
    expect(typeof hashEmpty).toBe("string");
    expect(hashEmpty).toHaveLength(64);
  });

  it("enforces sliding window rate limit on keys", async () => {
    const testKey = `test-ip-${Date.now()}`;

    // First request: should pass
    const res1 = await checkRateLimit(testKey, 2, 60);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    // Second request: should pass
    const res2 = await checkRateLimit(testKey, 2, 60);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);

    // Third request: should fail limit
    const res3 = await checkRateLimit(testKey, 2, 60);
    expect(res3.success).toBe(false);
    expect(res3.remaining).toBe(0);
    expect(res3.resetMs).toBeGreaterThan(0);
  });
});
