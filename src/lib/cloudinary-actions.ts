"use server";

import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth-guard";
import { env } from "@/lib/env";
import { isCloudinaryUrl, parseCloudinaryUrl } from "@/lib/cloudinary";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Server action to delete an uploaded Cloudinary asset when replaced or removed.
 * Strictly requires admin authorization and skips local/SVG data URIs and non-Cloudinary links.
 */
export async function deleteCloudinaryAssetAction(
  publicIdOrUrl: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<{ ok: boolean; message?: string }> {
  try {
    await requireAdmin();

    if (!publicIdOrUrl) {
      return { ok: false, message: "No asset publicId provided." };
    }

    // Skip inline SVGs or data URIs
    if (publicIdOrUrl.startsWith("data:")) {
      return { ok: true, message: "Data URI skipped from Cloudinary deletion." };
    }

    let targetPublicId = publicIdOrUrl;
    let targetResourceType: "image" | "video" | "raw" = resourceType;

    // If a full Cloudinary URL was provided, extract the canonical publicId & resourceType
    if (isCloudinaryUrl(publicIdOrUrl)) {
      const parsed = parseCloudinaryUrl(publicIdOrUrl);
      if (parsed) {
        targetPublicId = parsed.publicId;
        if (parsed.resourceType === "video" || parsed.resourceType === "raw") {
          targetResourceType = parsed.resourceType as "video" | "raw";
        }
      } else {
        // Strip extension if needed
        const match = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        if (match?.[1]) {
          targetPublicId = match[1];
        }
      }
    } else if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
      // Non-Cloudinary external URL
      return { ok: true, message: "External non-Cloudinary URL skipped." };
    }

    // Strip trailing file extensions if present on raw public ID
    const cleanPublicId = targetPublicId.replace(/\.(jpg|jpeg|png|webp|avif|gif|mp4|webm|svg)$/i, "");

    await cloudinary.uploader.destroy(cleanPublicId, {
      resource_type: targetResourceType,
      invalidate: true,
    });

    return { ok: true };
  } catch (err) {
    console.warn("Failed to delete Cloudinary asset:", publicIdOrUrl, err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to delete Cloudinary asset.",
    };
  }
}
