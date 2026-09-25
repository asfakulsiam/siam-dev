import { z } from "zod";

export const socialLinkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL or route is required"),
});

export const toolboxGroupSchema = z.object({
  group: z.string().min(1, "Group name is required"),
  items: z.array(z.string()).min(1, "At least one item is required"),
});

export const nowSchema = z.object({
  title: z.string().min(2, "Now title is required"),
  body: z.string().min(5, "Now body is required"),
  links: z.array(socialLinkSchema).optional(),
  updatedAt: z.string().min(1, "Updated date is required"),
});

export const photoSchema = z.object({
  publicId: z.string().min(1, "Photo public ID or URL is required"),
  alt: z.string().min(1, "Photo alt text is required for accessibility"),
  mood: z.string().optional(),
});

export const profileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  headline: z.string().min(5, "Headline is required"),
  subheadline: z.string().min(5, "Subheadline is required"),
  bio: z.string().min(10, "Bio is required"),
  location: z.string().min(2, "Location is required"),
  timezone: z.string().min(2, "Timezone is required"),
  availability: z.object({
    open: z.boolean(),
    text: z.string().min(2, "Availability text is required"),
  }),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  socials: z.array(socialLinkSchema).default([]),
  resume: z.object({
    url: z.string().url("Resume must be a valid URL"),
    updatedAt: z.string().min(1, "Resume update date required"),
  }),
  now: nowSchema,
  toolbox: z.array(toolboxGroupSchema).default([]),
  photos: z.array(photoSchema).default([]),
  activePhotoId: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const profileInputSchema = profileSchema.omit({
  id: true,
  updatedAt: true,
});

export type Photo = z.infer<typeof photoSchema>;
export type ProfileDocument = z.infer<typeof profileSchema>;
export type ProfileInput = z.infer<typeof profileInputSchema>;
