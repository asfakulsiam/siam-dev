import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth-guard";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    // 1. Authorize: Admin only
    await requireAdmin();

    const body = await req.json().catch(() => ({}));
    const folder = typeof body.folder === "string" ? body.folder : "devden/projects";
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 2. Build signed parameters
    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    };

    // Sign using Cloudinary SDK utility
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET,
    );

    return NextResponse.json({
      ok: true,
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Admin session required." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to generate upload signature." },
      { status: 500 },
    );
  }
}
