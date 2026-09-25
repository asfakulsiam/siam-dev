import { z } from "zod";

export const themeEnum = z.enum([
  "day-shift",
  "charcoal",
  "night-coder-charcoal",
  "night-coder",
  "blueprint",
  "mono",
]);
export type Theme = z.infer<typeof themeEnum>;

export const memeAssetSchema = z.object({
  type: z.enum(["image", "video"]),
  publicId: z.string().min(1, "Asset public ID or URL is required"),
  alt: z.string().min(1, "Alt text is required for accessibility"),
  posterPublicId: z.string().optional(),
});

export const settingsInputSchema = z.object({
  defaultTheme: themeEnum,
  memes: z.object({
    waiting: memeAssetSchema,
    sending: memeAssetSchema,
    success: memeAssetSchema,
    error: memeAssetSchema,
    notFound: memeAssetSchema,
    loading: memeAssetSchema,
  }),
});

export const settingsSchema = settingsInputSchema.extend({
  id: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MemeAsset = z.infer<typeof memeAssetSchema>;
export type SettingsInput = z.infer<typeof settingsInputSchema>;
export type SettingsDocument = z.infer<typeof settingsSchema>;
