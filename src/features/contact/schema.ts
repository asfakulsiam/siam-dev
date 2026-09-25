import { z } from "zod";

// Strict email regex requiring local-part, @, domain name, and at least 2-character TLD
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Please provide a valid email address")
    .email("Please provide a valid email address")
    .regex(
      EMAIL_REGEX,
      "Please provide a valid email address with a domain (e.g. name@example.com)",
    )
    .max(255, "Email must be less than 255 characters"),
  projectType: z.enum(
    [
      "Design System",
      "Full-Stack Web App",
      "Frontend Engineering",
      "Consulting / Audit",
      "Other",
    ],
    {
      message: "Please select a project scope",
    },
  ),
  timeline: z.string().max(50).optional(),
  message: z
    .string()
    .trim()
    .min(
      10,
      "Message must be at least 10 characters so I can understand your project needs",
    )
    .max(3000, "Message must be less than 3,000 characters"),
  // Honeypot field: must remain empty (spam bot trap)
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
