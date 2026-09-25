import { describe, it, expect } from "vitest";
import { themeEnum } from "@/features/appearance/schema";

describe("Phase H: Night Coder Charcoal Alternative Theme", () => {
  it("validates night-coder-charcoal as an allowed theme identifier in schema", () => {
    const valid = themeEnum.safeParse("night-coder-charcoal");
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data).toBe("night-coder-charcoal");
    }
  });

  it("still supports all canonical themes (day-shift, night-coder, blueprint, mono)", () => {
    expect(themeEnum.safeParse("day-shift").success).toBe(true);
    expect(themeEnum.safeParse("night-coder").success).toBe(true);
    expect(themeEnum.safeParse("blueprint").success).toBe(true);
    expect(themeEnum.safeParse("mono").success).toBe(true);
  });

  it("rejects invalid theme names", () => {
    expect(themeEnum.safeParse("sunset-pink").success).toBe(false);
  });
});
