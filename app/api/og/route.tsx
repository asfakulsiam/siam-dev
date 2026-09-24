import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title") || "Asfakul — Web Designer & Full-Stack Developer";
    const category = searchParams.get("category") || "Dev Den Portfolio";
    const description =
      searchParams.get("description") ||
      "Craft, typography, and considered web applications built with precision.";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#0B1220",
            padding: "80px",
            color: "#FFFFFF",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle Accent Glow / Grid lines */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              backgroundColor: "#2F4BFF",
            }}
          />

          {/* Top Bar: Brand & Category Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#2F4BFF",
                }}
              />
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "#FFFFFF",
                }}
              >
                ASFAKUL <span style={{ color: "#4A5468" }}>/</span> DEV DEN
              </span>
            </div>

            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid #1F293D",
                backgroundColor: "#131C2E",
                fontSize: "18px",
                fontWeight: 600,
                color: "#8AA2FF",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {category}
            </div>
          </div>

          {/* Center: Main Headline & Description */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxWidth: "1000px",
            }}
          >
            <h1
              style={{
                fontSize: title.length > 40 ? "56px" : "68px",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "24px",
                lineHeight: 1.5,
                color: "#9AA6BD",
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>

          {/* Bottom Bar: Location, Status, and Web Domain */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #1F293D",
              paddingTop: "32px",
              color: "#9AA6BD",
              fontSize: "20px",
              fontFamily: "monospace",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                }}
              />
              <span>Available for select engineering contracts</span>
            </div>
            <span>Bangladesh · GMT+6</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
