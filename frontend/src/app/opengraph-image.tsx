import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config/site";

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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#07070d",
          backgroundImage: "radial-gradient(circle at 30% 20%, rgba(124,58,237,0.35), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 800,
              color: "white",
              backgroundImage: "linear-gradient(135deg, #6366f1, #a855f7)",
            }}
          >
            H
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: "white", letterSpacing: -1 }}>{SITE_NAME}</div>
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#c9c9d9" }}>{SITE_TAGLINE}</div>
      </div>
    ),
    { ...size }
  );
}
