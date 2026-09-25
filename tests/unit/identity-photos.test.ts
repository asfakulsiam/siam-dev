import { describe, it, expect, vi, beforeEach } from "vitest";
import { photoSchema, profileSchema } from "@/features/profile/schema";
import { staticProfile, defaultIdentityPhotoSVG } from "@/features/profile/data";
import { getProfile, getActivePhoto } from "@/features/profile/queries";
import { getDuotonePhotoUrl } from "@/lib/cloudinary";

vi.mock("@/lib/db", () => ({
  getCollection: vi.fn().mockResolvedValue({
    findOne: vi.fn().mockResolvedValue(null),
  }),
  sanitizeDocument: vi.fn((doc) => doc),
}));

describe("Phase C: Identity & Photo System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Photo Schema Validation", () => {
    it("validates a valid photo with publicId and alt text", () => {
      const validPhoto = {
        publicId: "devden/portraits/asfakul-working",
        alt: "Asfakul in studio lighting at desk",
        mood: "working",
      };
      const parsed = photoSchema.safeParse(validPhoto);
      expect(parsed.success).toBe(true);
    });

    it("rejects a photo when alt text is missing or empty", () => {
      const invalidPhoto = {
        publicId: "devden/portraits/asfakul-working",
        alt: "", // Violates mandatory alt text rule
      };
      const parsed = photoSchema.safeParse(invalidPhoto);
      expect(parsed.success).toBe(false);
    });

    it("validates full profile schema with photos and activePhotoId", () => {
      const parsed = profileSchema.safeParse(staticProfile);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.photos.length).toBeGreaterThan(0);
        expect(parsed.data.activePhotoId).toBeDefined();
      }
    });
  });

  describe("Photo Queries & Fallbacks", () => {
    it("returns static default photo when database returns null", async () => {
      const active = await getActivePhoto();
      expect(active).toBeDefined();
      expect(active.publicId).toBe(defaultIdentityPhotoSVG);
      expect(active.alt).toContain("Asfakul");
    });

    it("retrieves full profile with active photo", async () => {
      const profile = await getProfile();
      expect(profile.photos).toBeDefined();
      expect(profile.photos.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Cloudinary Duotone Transformation", () => {
    it("returns empty string on undefined input", () => {
      expect(getDuotonePhotoUrl(undefined)).toBe("");
    });

    it("generates duotone tint transformation on valid Cloudinary public ID", () => {
      const duotone = getDuotonePhotoUrl("devden/portraits/hero", "2f4bff");
      expect(duotone).toContain("e_grayscale");
      expect(duotone).toContain("e_tint:60:2f4bff");
    });
  });
});
