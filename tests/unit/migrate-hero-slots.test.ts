import { describe, it, expect, vi } from "vitest";
import { migrateHeroSlots } from "../../scripts/migrate-hero-slots";

describe("migrateHeroSlots (Phase U Idempotent Migration)", () => {
  it("migrates legacy hero-primary and hero-secondary into slot.light when slots are empty", async () => {
    let storedDoc: any = {
      _id: "profile-1",
      name: "Asfakul",
      photos: [
        {
          publicId: "legacy-primary-id",
          alt: "Primary portrait alt text",
          role: "hero-primary",
          accentColor: "#2F4BFF",
        },
        {
          publicId: "legacy-secondary-id",
          alt: "Secondary workspace alt text",
          role: "hero-secondary",
          accentColor: "#8AA2FF",
        },
      ],
    };

    const updateOneMock = vi.fn().mockImplementation((_filter, update) => {
      storedDoc = { ...storedDoc, ...update.$set };
      return Promise.resolve({ modifiedCount: 1 });
    });

    const mockDb: any = {
      collection: () => ({
        findOne: vi.fn().mockResolvedValue(storedDoc),
        updateOne: updateOneMock,
      }),
    };

    // Run 1: Should migrate both slots into .light
    const result1 = await migrateHeroSlots(mockDb);
    expect(result1.modified).toBe(true);
    expect(result1.updatedSlots?.heroPrimary).toBe(true);
    expect(result1.updatedSlots?.heroSecondary).toBe(true);

    expect(updateOneMock).toHaveBeenCalledTimes(1);
    expect(storedDoc.heroPrimary).toEqual({
      light: {
        publicId: "legacy-primary-id",
        alt: "Primary portrait alt text",
        accentColor: "#2F4BFF",
      },
    });
    expect(storedDoc.heroSecondary).toEqual({
      light: {
        publicId: "legacy-secondary-id",
        alt: "Secondary workspace alt text",
        accentColor: "#8AA2FF",
      },
    });

    // Run 2: Idempotency check - must be a true no-op
    updateOneMock.mockClear();
    const result2 = await migrateHeroSlots(mockDb);
    expect(result2.modified).toBe(false);
    expect(updateOneMock).not.toHaveBeenCalled();
    expect(result2.reason).toContain("No-op");
  });

  it("preserves an existing dark variant and does not overwrite it", async () => {
    let storedDoc: any = {
      _id: "profile-1",
      photos: [
        {
          publicId: "legacy-primary-id",
          alt: "Primary portrait alt text",
          role: "hero-primary",
        },
      ],
      heroPrimary: {
        dark: {
          publicId: "custom-dark-primary",
          alt: "Dark custom portrait",
          accentColor: "#FFE14D",
        },
      },
    };

    const updateOneMock = vi.fn().mockImplementation((_filter, update) => {
      storedDoc = { ...storedDoc, ...update.$set };
      return Promise.resolve({ modifiedCount: 1 });
    });

    const mockDb: any = {
      collection: () => ({
        findOne: vi.fn().mockResolvedValue(storedDoc),
        updateOne: updateOneMock,
      }),
    };

    // Run 1: Fills .light, preserves .dark
    const res1 = await migrateHeroSlots(mockDb);
    expect(res1.modified).toBe(true);
    expect(storedDoc.heroPrimary.dark).toEqual({
      publicId: "custom-dark-primary",
      alt: "Dark custom portrait",
      accentColor: "#FFE14D",
    });
    expect(storedDoc.heroPrimary.light).toEqual({
      publicId: "legacy-primary-id",
      alt: "Primary portrait alt text",
      accentColor: "auto",
    });

    // Run 2: Second run must do nothing
    updateOneMock.mockClear();
    const res2 = await migrateHeroSlots(mockDb);
    expect(res2.modified).toBe(false);
    expect(updateOneMock).not.toHaveBeenCalled();
  });
});
