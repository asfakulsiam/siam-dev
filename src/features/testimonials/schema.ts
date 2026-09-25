import { z } from "zod";

export const authorPhotoSchema = z.object({
  publicId: z.string().min(1, "Photo identifier or URL is required"),
  alt: z.string().min(1, "Alt text is required for accessibility"),
});

export const testimonialSchema = z.object({
  id: z.string().min(1, "ID is required"),
  quote: z
    .string()
    .min(1, "Quote is required")
    .max(400, "Quote must not exceed 400 characters"),
  authorName: z.string().min(1, "Author name is required"),
  authorRole: z.string().optional(),
  authorPhoto: authorPhotoSchema.optional(),
  order: z.number().int().default(0),
  published: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const testimonialInputSchema = testimonialSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type AuthorPhoto = z.infer<typeof authorPhotoSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
