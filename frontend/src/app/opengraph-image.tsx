import { ImageResponse } from "next/og";
import { SITE_TAGLINE } from "@/lib/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build/request time (Next.js's opengraph-image
 * convention) — no external image asset needed, no design tool
 * dependency, and it can never go stale relative to the brand name.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          backgroundColor: "#12110f",
          color: "#ece5d8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, letterSpacing: -1 }}>
          Humanora<span style={{ color: "#e06a4e" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, lineHeight: 1.04, letterSpacing: -2, maxWidth: 940 }}>
            Write with AI. Sound like yourself.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#bcb3a3" }}>{SITE_TAGLINE}</div>
        </div>
        <div style={{ display: "flex", height: 2, width: 120, backgroundColor: "#e06a4e" }} />
      </div>
    ),
    { ...size }
  );
}
