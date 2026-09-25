import { NextResponse } from "next/server";
import { isMongoConnected } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for CI/CD and deployment monitoring.
 * Returns 200 if MongoDB is connected, or 503 if disconnected.
 */
export async function GET() {
  const connected = await isMongoConnected();

  if (!connected) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "healthy",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
}
