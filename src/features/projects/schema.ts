import { z } from "zod";

export const projectCategoryEnum = z.enum([
  "Design Systems",
  "Full-Stack",
  "Web Applications",
  "Open Source",
]);

export const projectMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"),
  description: z.string().optional(),
});

export const projectDeliverableSchema = z.object({
  title: z.string().min(1, "Deliverable title is required"),
  description: z.string().min(1, "Deliverable description is required"),
});

export const projectSectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  subtitle: z.string().optional(),
  content: z.array(z.string()).min(1, "Section content cannot be empty"),
  takeaways: z.array(z.string()).optional(),
});

export const coverImageSchema = z.object({
  src: z.string().min(1, "Cover image source is required"),
  alt: z.string().min(1, "Cover image alt text is required"),
  aspectRatio: z.string().default("16/9"),
});

export const projectLinksSchema = z.object({
  live: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const projectArchitectureSchema = z.object({
  stack: z.array(z.string()).min(1, "At least one technology stack item is required"),
  decisions: z.array(z.string()).min(1, "At least one architectural decision is required"),
});

/**
 * Complete Project Schema (representing database documents and serialized representations)
 */
export const projectSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  tagline: z.string().min(5, "Tagline must be at least 5 characters").max(200),
  category: projectCategoryEnum,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  year: z.string().min(4).max(10),
  timeline: z.string().min(2).max(50),
  role: z.string().min(2).max(100),
  client: z.string().min(2).max(100),
  summary: z.string().min(10).max(1000),
  coverImage: coverImageSchema,
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  metrics: z.array(projectMetricSchema).min(1, "At least one metric is required"),
  deliverables: z.array(projectDeliverableSchema).default([]),
  problem: z.string().min(10, "Problem statement is required"),
  solution: z.string().min(10, "Solution statement is required"),
  architecture: projectArchitectureSchema,
  sections: z.array(projectSectionSchema).default([]),
  links: projectLinksSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const projectInputSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProjectDocument = z.infer<typeof projectSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectCategory = z.infer<typeof projectCategoryEnum>;
