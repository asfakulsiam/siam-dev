import { describe, it, expect } from "vitest";
import { env } from "@/lib/env";

describe("Environment Variable Validator", () => {
  it("should have default values for critical configurations in dev/test", () => {
    expect(env.MONGODB_DB).toBeDefined();
    expect(env.ADMIN_EMAIL).toBeDefined();
    expect(env.AUTH_SECRET).toBeDefined();
  });

  it("should provide valid URLs for auth and site", () => {
    expect(env.AUTH_URL).toMatch(/^https?:\/\//);
    expect(env.NEXT_PUBLIC_SITE_URL).toMatch(/^https?:\/\//);
  });
});
