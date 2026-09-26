import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth-guard";
import { env } from "@/lib/env";

// Configure Cloudinary SDK instance with server-only credentials
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    // 1. Authorize: Admin only
    await requireAdmin();

    const body = await req.json().catch(() => ({}));
    const publicId = typeof body.publicId === "string" ? body.publicId.trim() : "";
    const resourceType =
      body.resourceType === "video" ? "video" : body.resourceType === "raw" ? "raw" : "image";

    if (!publicId) {
      return NextResponse.json(
        { ok: false, error: "Public ID is required to delete asset." },
        { status: 400 },
      );
    }

    // Do not delete SVG data URIs, local assets, or external non-Cloudinary URLs
    if (
      publicId.startsWith("data:") ||
      publicId.startsWith("http://") ||
      publicId.startsWith("https://")
    ) {
      return NextResponse.json({
        ok: true,
        message: "External or data URI skipped from Cloudinary deletion.",
      });
    }

    // Call Cloudinary SDK to destroy the asset
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Admin session required." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to delete Cloudinary asset." },
      { status: 500 },
    );
  }
}
