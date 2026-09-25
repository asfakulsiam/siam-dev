import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  testimonialSchema,
  testimonialInputSchema,
  authorPhotoSchema,
} from "@/features/testimonials/schema";
import { staticTestimonials } from "@/features/testimonials/data";
import { getTestimonials } from "@/features/testimonials/queries";
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  togglePublishTestimonialAction,
} from "@/features/testimonials/actions";

describe("Phase I: Testimonials Schema & Data Model", () => {
  it("validates a compliant testimonial object", () => {
    const valid = {
      id: "tst-1",
      quote: "Asfakul engineered our design token pipeline with exceptional rigor and typographic craft.",
      authorName: "Marcus Vance",
      authorRole: "Staff Engineer at Stride",
      authorPhoto: {
        publicId: "devden/testimonials/marcus-vance",
        alt: "Marcus Vance portrait",
      },
      order: 0,
      published: true,
    };

    const res = testimonialSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.authorName).toBe("Marcus Vance");
      expect(res.data.published).toBe(true);
      expect(res.data.order).toBe(0);
    }
  });

  it("enforces quote length cap of max 400 characters", () => {
    const overLimitQuote = "A".repeat(401);
    const res = testimonialSchema.safeParse({
      id: "tst-too-long",
      quote: overLimitQuote,
      authorName: "Elena Rostova",
    });
    expect(res.success).toBe(false);
  });

  it("requires quote to be non-empty", () => {
    const res = testimonialSchema.safeParse({
      id: "tst-empty",
      quote: "",
      authorName: "Elena Rostova",
    });
    expect(res.success).toBe(false);
  });

  it("requires authorName to be non-empty", () => {
    const res = testimonialSchema.safeParse({
      id: "tst-no-author",
      quote: "Great collaborator and engineer.",
      authorName: "",
    });
    expect(res.success).toBe(false);
  });

  it("requires alt text if authorPhoto is provided (WCAG 2.2 accessibility rule)", () => {
    const missingAlt = {
      publicId: "devden/testimonials/photo",
      alt: "",
    };
    expect(authorPhotoSchema.safeParse(missingAlt).success).toBe(false);

    const validPhoto = {
      publicId: "devden/testimonials/photo",
      alt: "Portrait of collaborator",
    };
    expect(authorPhotoSchema.safeParse(validPhoto).success).toBe(true);
  });

  it("defaults published to false and order to 0", () => {
    const minimal = {
      id: "tst-min",
      quote: "Thoughtful systems thinker and frontend architect.",
      authorName: "David Chen",
    };
    const res = testimonialSchema.safeParse(minimal);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.published).toBe(false);
      expect(res.data.order).toBe(0);
    }
  });
});

describe("Phase I: Zero-Invented-Content Rule & Query Integrity", () => {
  it("ships with strictly zero seeded static testimonials", () => {
    expect(staticTestimonials).toEqual([]);
    expect(staticTestimonials.length).toBe(0);
  });

  it("returns static empty array when database is offline during build/pre-rendering", async () => {
    const res = await getTestimonials(true);
    expect(Array.isArray(res)).toBe(true);
    expect(res).toEqual([]);
  });
});

describe("Phase I: Admin Authorization Protection", () => {
  it("rejects unauthorized creation attempt with UNAUTHORIZED message", async () => {
    const res = await createTestimonialAction({
      id: "tst-hack",
      quote: "Unauthenticated injection test",
      authorName: "Attacker",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/Unauthorized/i);
    }
  });

  it("rejects unauthorized update attempt", async () => {
    const res = await updateTestimonialAction("tst-1", {
      quote: "Updated quote",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/Unauthorized/i);
    }
  });

  it("rejects unauthorized delete attempt", async () => {
    const res = await deleteTestimonialAction("tst-1");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/Unauthorized/i);
    }
  });

  it("rejects unauthorized publish toggle attempt", async () => {
    const res = await togglePublishTestimonialAction("tst-1", true);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/Unauthorized/i);
    }
  });
});
