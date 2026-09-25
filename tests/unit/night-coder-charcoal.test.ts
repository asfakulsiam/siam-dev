import { describe, it, expect } from "vitest";
import { themeEnum } from "@/features/appearance/schema";

describe("Themes Configuration & Discrete Theme Verification", () => {
  it("validates charcoal as a discrete dark theme in schema", () => {
    const valid = themeEnum.safeParse("charcoal");
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data).toBe("charcoal");
    }
  });

  it("validates night-coder as a separate discrete navy theme", () => {
    const valid = themeEnum.safeParse("night-coder");
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data).toBe("night-coder");
    }
  });

  it("supports all discrete themes (day-shift, charcoal, night-coder, blueprint, mono)", () => {
    expect(themeEnum.safeParse("day-shift").success).toBe(true);
    expect(themeEnum.safeParse("charcoal").success).toBe(true);
    expect(themeEnum.safeParse("night-coder").success).toBe(true);
    expect(themeEnum.safeParse("night-coder-charcoal").success).toBe(true);
    expect(themeEnum.safeParse("blueprint").success).toBe(true);
    expect(themeEnum.safeParse("mono").success).toBe(true);
  });

  it("rejects invalid theme names", () => {
    expect(themeEnum.safeParse("sunset-pink").success).toBe(false);
  });
});
