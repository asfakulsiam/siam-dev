import { describe, it, expect } from "vitest";
import { getDuotonePhotoUrl } from "@/lib/cloudinary";

describe("Phase G: Cursor-Reactive Photo & Duotone System", () => {
  it("resolves duotone tint URL with primary accent tint for backdrop blending", () => {
    const duotoneUrl = getDuotonePhotoUrl("devden/portraits/hero-portrait", "2f4bff");
    expect(duotoneUrl).toContain("e_grayscale");
    expect(duotoneUrl).toContain("e_tint:60:2f4bff");
    expect(duotoneUrl).toContain("devden/portraits/hero-portrait");
  });

  it("handles base64 data URIs or direct URLs safely without mangling", () => {
    const dataUri = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg==";
    const resolved = getDuotonePhotoUrl(dataUri);
    expect(resolved).toBe(dataUri);
  });

  it("returns empty string on empty/undefined photo identifier", () => {
    expect(getDuotonePhotoUrl("")).toBe("");
    expect(getDuotonePhotoUrl(undefined)).toBe("");
  });
});
