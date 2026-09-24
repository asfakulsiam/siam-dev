import { z } from "zod";

export const experienceTypeEnum = z.enum(["Full-Time", "Contract", "Open Source", "Advisory"]);

export const experienceItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  role: z.string().min(2, "Role is required"),
  organization: z.string().min(2, "Organization is required"),
  period: z.string().min(2, "Period is required"),
  location: z.string().min(2, "Location is required"),
  type: experienceTypeEnum,
  description: z.string().min(10, "Description is required"),
  achievements: z.array(z.string()).default([]),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  sortOrder: z.number().int().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const experienceInputSchema = experienceItemSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const philosophyPrincipleSchema = z.object({
  title: z.string().min(1, "Principle title is required"),
  statement: z.string().min(5, "Principle statement is required"),
  details: z.string().min(10, "Principle details are required"),
});

export type ExperienceDocument = z.infer<typeof experienceItemSchema>;
export type ExperienceInput = z.infer<typeof experienceInputSchema>;
export type PhilosophyPrinciple = z.infer<typeof philosophyPrincipleSchema>;
