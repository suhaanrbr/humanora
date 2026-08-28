"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * The login page's desktop background — one approved, professionally
 * generated artwork (not procedural CSS/SVG; see LoginCosmicScene.tsx,
 * kept in the repo as a fallback but no longer rendered).
 *
 * Renders nothing until confirmed we're within its own width range —
 * phones stay on the lightweight no-image treatment; tablets and
 * desktops get the real artwork, each via its own instance of this
 * component (see AuthShell) so a change scoped to one range (tablet's
 * quality/dim tuning) never re-fetches or re-renders the other.
 * `priority` (needed so this doesn't lazy-load in behind the LCP-
 * critical logo/headline) forces the browser to fetch the image the
 * moment the <img> exists in the DOM, REGARDLESS of CSS `display`
 * state — a CSS-only `hidden md:block` wrapper alone would still cost
 * phone visitors the full download, and would ALSO cost the tablet
 * range a duplicate fetch of the desktop instance's differently-
 * quality-tagged derivative if both mounted at once. Gating the mount
 * itself on a real `matchMedia` check (scoped to THIS instance's own
 * min/max) is the only way to make "only one of these is ever
 * downloading" actually true rather than just visually true.
 */
export function LoginArtworkLayer({
  className,
  minWidth = 768,
  maxWidth,
  quality = 75,
  dim = 0,
}: {
  className?: string;
  /** Lower bound (px, inclusive) of this instance's own range. */
  minWidth?: number;
  /** Upper bound (px, inclusive) of this instance's own range — omit for no ceiling. */
  maxWidth?: number;
  /** Next/Image quality (1-100). Default matches Next's own default (75). */
  quality?: number;
  /** Flat black overlay opacity (0-1) tinted on top of the artwork, e.g. to sit a
   *  touch darker behind a range where the glass panel reads better against less
   *  contrast. 0 (default) draws nothing — pixel-identical to not having this prop. */
  dim?: number;
}) {
  const [inRange, setInRange] = useState(false);

  const query = maxWidth
    ? `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`
    : `(min-width: ${minWidth}px)`;

  /* eslint-disable react-hooks/set-state-in-effect --
     Deliberate: reading a browser-only API (matchMedia) can't happen
     during SSR or the initial client render without a hydration
     mismatch — same accepted pattern as the sessionStorage-restore
     effects elsewhere in this codebase (e.g. HumanizeWorkspace). */
  useEffect(() => {
    const mq = window.matchMedia(query);
    setInRange(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setInRange(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!inRange) return null;

  return (
    <div className={className} aria-hidden="true">
      <Image
        src="/images/login-artwork.webp"
        alt=""
        fill
        priority
        quality={quality}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "50% 50%" }}
      />
      {/* Local readability gradients only — the artwork itself stays
          fully visible in the center. A left-edge wash for the
          headline/copy, a right-edge wash for the login card, both
          confined to their own thirds rather than a wash over the
          whole frame. */}
      <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-[#02030b]/75 via-[#02030b]/25 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[34%] bg-gradient-to-l from-[#02030b]/55 via-[#02030b]/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#02030b]/60 to-transparent" />
      {dim > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: dim }} />}
    </div>
  );
}
