import { z } from "zod";

const envSchema = z.object({
  // Gemini & Platform
  GEMINI_API_KEY: z.string().optional(),
  APP_URL: z.string().url().optional(),

  // Database
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/devden"),
  MONGODB_DB: z.string().min(1).default("devden"),

  // Auth
  AUTH_SECRET: z.string().min(16).default("temporary_secret_at_least_16_characters_long"),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD_HASH: z
    .string()
    .min(10)
    .default("$2a$12$e80yvEa3Rk97o8Q/65ZqeeP1kC8gO1i8w5M4gE0V8c0.Z/1z6Vq4G"),

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
      AUTH_SECRET: process.env.AUTH_SECRET || "temporary_secret_at_least_16_characters_long",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",
    });
