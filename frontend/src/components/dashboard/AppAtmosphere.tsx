/**
 * The authenticated app's persistent background — replaces the old
 * plain `.app-atmosphere` (dot grid + two perfectly circular blurred
 * blobs, which read as "glowing SaaS blobs," not an environment).
 *
 * Layers, back to front:
 *  1. Near-black base + very faint dot grid (unchanged — it was
 *     already restrained and correct).
 *  2. A large, mostly out-of-frame H mark — the same architectural
 *     geometry as the landing page's DimensionalH — as a barely-visible
 *     stroke watermark anchored to one corner, giving the space actual
 *     dimensional identity instead of generic radial glow.
 *  3. Two soft, asymmetric indigo/violet light sources (not circles —
 *     elongated ellipses at odd angles, closer to "light spilling from
 *     off-screen" than "glowing sphere"), still driven by the existing
 *     `--mesh-1`/`--mesh-2` tokens so it stays on-palette.
 *  4. A faint vignette darkening the far edges, so content in the
 *     center of the viewport always reads as the brightest, most
 *     important layer — background recedes, content dominates.
 *
 * Pure CSS + one inline SVG — no WebGL/Three.js, no canvas, no
 * JS-driven animation loop. `prefers-reduced-motion` already disables
 * the two light sources' slow pulse via the existing `.app-atmosphere`
 * media query in globals.css.
 */
export function AppAtmosphere() {
  return (
    <div className="app-atmosphere" aria-hidden="true">
      <svg
        className="app-atmosphere-h"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMaxYMax meet"
        aria-hidden="true"
      >
        <rect x="30" y="65" width="35" height="105" rx="6" />
        <rect x="135" y="25" width="35" height="145" rx="6" />
        <polygon points="65,95 135,60 135,90 65,125" />
      </svg>
    </div>
  );
}
