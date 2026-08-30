"use client";

import { useId } from "react";

/**
 * The authenticated app's persistent background — replaces the old
 * plain `.app-atmosphere` (dot grid + two perfectly circular blurred
 * blobs, which read as "glowing SaaS blobs," not an environment).
 *
 * Layers, back to front:
 *  1. Near-black base + very faint dot grid (unchanged — it was
 *     already restrained and correct).
 *  2. Two H marks at different depths/scales — the same architectural
 *     geometry as the landing page's DimensionalH, one large anchored
 *     bottom-right, one smaller/fainter top-left — each drifting
 *     through a slow, near-imperceptible rotation (4 minutes per
 *     revolution) so the space reads as occupied/alive rather than a
 *     flat printed backdrop, without ever being something a user
 *     consciously watches while working.
 *  3. Two soft, asymmetric indigo/violet light sources (not circles —
 *     elongated ellipses at odd angles, closer to "light spilling from
 *     off-screen" than "glowing sphere"), still driven by the existing
 *     `--mesh-1`/`--mesh-2` tokens so it stays on-palette.
 *  4. A faint vignette darkening the far edges, so content in the
 *     center of the viewport always reads as the brightest, most
 *     important layer — background recedes, content dominates.
 *
 * Pure CSS + inline SVG — no WebGL/Three.js, no canvas, no JS-driven
 * animation loop (the rotation is a CSS keyframe, gated off entirely
 * under `prefers-reduced-motion` in globals.css). Deliberately NOT a
 * scroll-pinned cinematic scene like the landing page — this sits
 * behind real work (Write, Study, tables, forms), so motion here has
 * to stay strictly ambient and never compete for attention or degrade
 * scroll/typing performance.
 */
export function AppAtmosphere() {
  const gradientId = useId();

  return (
    <div className="app-atmosphere" aria-hidden="true">
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id={`${gradientId}-edge`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-indigo)" />
            <stop offset="55%" stopColor="var(--color-brand-purple)" />
            <stop offset="100%" stopColor="var(--color-brand-pink)" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        className="app-atmosphere-h-echo"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        stroke={`url(#${gradientId}-edge)`}
      >
        <rect x="30" y="65" width="35" height="105" rx="6" />
        <rect x="135" y="25" width="35" height="145" rx="6" />
        <polygon points="65,95 135,60 135,90 65,125" />
      </svg>

      <svg
        className="app-atmosphere-h"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMaxYMax meet"
        aria-hidden="true"
        stroke={`url(#${gradientId}-edge)`}
      >
        <rect x="30" y="65" width="35" height="105" rx="6" />
        <rect x="135" y="25" width="35" height="145" rx="6" />
        <polygon points="65,95 135,60 135,90 65,125" />
      </svg>
    </div>
  );
}
