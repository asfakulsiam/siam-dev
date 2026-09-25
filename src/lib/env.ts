import { z } from "zod";

const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/devden"),
  MONGODB_DB: z.string().min(1).default("devden"),

  // Auth
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters long")
    .default("temporary_secret_at_least_32_characters_long_for_security"),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD_HASH: z
    .string()
    .min(10)
    .default("$2b$10$ID9Nz3EliuQr3LspBB5Qiu21z/FdV5v0DBvodnp7N2qmyV9U68.5W"),
  TEST_ADMIN_PASSWORD: z
    .string()
    .optional()
    .default("test-admin-ci-password-1234"),

  // Resend Email
  RESEND_API_KEY: z.string().optional().default("re_placeholder"),
  RESEND_FROM: z.string().default("hello@example.com"),
  CONTACT_TO_EMAIL: z.string().email().default("asfakul@example.com"),

  // Cloudinary Media
  CLOUDINARY_CLOUD_NAME: z.string().default("placeholder_cloud"),
  CLOUDINARY_API_KEY: z.string().default("placeholder_key"),
  CLOUDINARY_API_SECRET: z.string().default("placeholder_secret"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().default("placeholder_cloud"),

  // Site & Security
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  IP_HASH_SALT: z.string().min(8).default("default_dev_salt_string"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  if (process.env.NODE_ENV === "production" && process.env.STRICT_ENV === "true") {
    throw new Error("Invalid environment variables");
  }
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : envSchema.parse({
      ...process.env,
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/devden",
      MONGODB_DB: process.env.MONGODB_DB || "devden",
      AUTH_SECRET:
        process.env.AUTH_SECRET ||
        "temporary_secret_at_least_32_characters_long_for_security",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",
    });
