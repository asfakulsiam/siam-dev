/**
 * Cloudinary & Image Optimization Utility
 * 
 * Provides transformation helpers, responsive width calculations,
 * Low-Quality Image Placeholders (LQIP), and Cloudinary URL generation.
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low" | number;
  format?: "auto" | "webp" | "avif" | "png" | "jpg";
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale" | "crop";
  gravity?: "auto" | "center" | "face" | "north" | "south";
  blur?: number;
  dpr?: number | "auto";
}

/**
 * Checks if a given URL is a Cloudinary hosted asset
 */
export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes("res.cloudinary.com");
}

/**
 * Parses Cloudinary URL into base URL, existing transformations, and public asset ID
 */
export function parseCloudinaryUrl(url: string): {
  baseUrl: string;
  cloudName: string;
  resourceType: string;
  deliveryType: string;
  publicId: string;
} | null {
  if (!isCloudinaryUrl(url)) return null;

  try {
    const regex = /https:\/\/res\.cloudinary\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(?:v\d+\/)?(.+)$/;
    const match = url.match(regex);

    if (!match || match.length < 5) return null;

    const cloudName = match[1] ?? "";
    const resourceType = match[2] ?? "image";
    const deliveryType = match[3] ?? "upload";
    const publicId = match[4] ?? "";

    const baseUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/${deliveryType}`;

    return {
      baseUrl,
      cloudName,
      resourceType,
      deliveryType,
      publicId,
    };
  } catch {
    return null;
  }
}

/**
 * Builds an optimized Cloudinary delivery URL with specified transformations
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
    gravity = "auto",
    blur,
    dpr = "auto",
  } = options;

  const transforms: string[] = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (dpr) transforms.push(`dpr_${dpr}`);
  if (crop) transforms.push(`c_${crop}`);
  if (gravity && crop !== "scale" && crop !== "fit") transforms.push(`g_${gravity}`);
  if (width) transforms.push(`w_${Math.round(width)}`);
  if (height) transforms.push(`h_${Math.round(height)}`);
  if (blur) transforms.push(`e_blur:${blur}`);

  const transformString = transforms.join(",");

  // Insert transformations into Cloudinary URL
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const beforeUpload = url.substring(0, uploadIndex + "/upload/".length);
  const afterUpload = url.substring(uploadIndex + "/upload/".length);

  return `${beforeUpload}${transformString}/${afterUpload}`;
}

/**
 * Generates a lightweight base64 blur placeholder (LQIP) for Next.js image loading
 */
export function getBlurPlaceholderUrl(url: string): string {
  if (!isCloudinaryUrl(url)) {
    // Generate a neutral inline SVG data URI for local/external fallback
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="#1a202c"/></svg>'
    )}`;
  }

  return getOptimizedCloudinaryUrl(url, {
    width: 32,
    quality: 30,
    blur: 1000,
    format: "webp",
  });
}

/**
 * Standard responsive breakpoints for srcset generation
 */
export const RESPONSIVE_IMAGE_SIZES = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
