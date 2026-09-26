import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  settingsSchema,
  settingsInputSchema,
  memeAssetSchema,
} from "@/features/appearance/schema";
import { staticSettings, defaultMemeSVGs } from "@/features/appearance/data";
import { getSettings, getMeme } from "@/features/appearance/queries";
import { updateSettingsAction } from "@/features/appearance/actions";

// Mock auth-guard and db for unit isolation
vi.mock("@/lib/auth-guard", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { role: "admin" } }),
}));

vi.mock("@/lib/db", () => ({
  getCollection: vi.fn().mockResolvedValue({
    findOne: vi.fn().mockResolvedValue(null),
    updateOne: vi.fn().mockResolvedValue({ acknowledged: true }),
  }),
  sanitizeDocument: vi.fn((doc) => doc),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

describe("Appearance & Meme System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Schema Validation", () => {
    it("validates baseline staticSettings successfully", () => {
      const parsed = settingsSchema.safeParse(staticSettings);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.defaultTheme).toBe("day-shift");
        expect(parsed.data.memes.waiting.type).toBe("image");
      }
    });

    it("rejects meme asset missing alt text", () => {
      const invalid = {
        type: "image",
        publicId: "devden/memes/waiting",
        alt: "", // Empty alt violates schema
      };
      const parsed = memeAssetSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("validates video meme asset with posterPublicId", () => {
      const validVideo = {
        type: "video",
        publicId: "devden/memes/waiting-clip",
        posterPublicId: "devden/memes/waiting-poster",
        alt: "Looping video of comic impatience",
      };
      const parsed = memeAssetSchema.safeParse(validVideo);
      expect(parsed.success).toBe(true);
    });

    it("enforces all 6 meme state keys in settingsInputSchema", () => {
      const incomplete = {
        defaultTheme: "blueprint",
        memes: {
          waiting: {
            type: "image",
            publicId: "test",
            alt: "test alt",
          },
        },
      };
      const parsed = settingsInputSchema.safeParse(incomplete);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Queries & Fallbacks", () => {
    it("returns static fallback settings when DB returns empty", async () => {
      const settings = await getSettings();
      expect(settings.defaultTheme).toBe("day-shift");
      expect(settings.memes.waiting.publicId).toBe(defaultMemeSVGs.waiting);
    });

    it("retrieves specific meme state asset", async () => {
      const notFoundMeme = await getMeme("notFound");
      expect(notFoundMeme).toBeDefined();
      expect(notFoundMeme.type).toBe("image");
      expect(notFoundMeme.alt).toContain("detective");
    });
  });

  describe("Server Actions", () => {
    it("updates settings successfully when admin is authorized and input is valid", async () => {
      const validPayload = {
        defaultTheme: "night-coder" as const,
        memes: staticSettings.memes,
      };

      const res = await updateSettingsAction(validPayload);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.updated).toBe(true);
      }
    });

    it("supports video meme assets with poster frame in all slots", async () => {
      const memesWithVideo = {
        ...staticSettings.memes,
        waiting: {
          type: "video" as const,
          publicId: "devden/memes/waiting-loop",
          posterPublicId: "devden/memes/waiting-poster",
          alt: "Waiting loop animation",
        },
      };

      const res = await updateSettingsAction({
        defaultTheme: "day-shift" as const,
        memes: memesWithVideo,
      });

      expect(res.ok).toBe(true);
    });

    it("returns error response on invalid input payload", async () => {
      const invalidPayload = {
        defaultTheme: "invalid-theme-name",
      };

      const res = await updateSettingsAction(invalidPayload);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toBeDefined();
      }
    });
  });
});
