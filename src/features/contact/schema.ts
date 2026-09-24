import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
  projectType: z.enum(
    ["Design System", "Full-Stack Web App", "Frontend Engineering", "Consulting / Audit", "Other"],
    {
      message: "Please select a valid project type",
    },
  ),
  timeline: z.string().max(50).optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(3000, "Message must be less than 3,000 characters")
    .trim(),
  // Honeypot field: must remain empty
  honeypot: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

export const contactMessageSchema = contactFormSchema.extend({
  id: z.string().optional(),
  ipHash: z.string(),
  status: z.enum(["unread", "read", "replied", "archived"]).default("unread"),
  createdAt: z.string(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ContactMessage = z.infer<typeof contactMessageSchema>;
