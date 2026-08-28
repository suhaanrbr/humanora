"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * The login page's desktop background — one approved, professionally
 * generated artwork (not procedural CSS/SVG; see LoginCosmicScene.tsx,
 * kept in the repo as a fallback but no longer rendered).
 *
 * Renders nothing until confirmed we're on at least a tablet-width
 * viewport (>= 768px) — phones stay on the lightweight no-image
 * treatment, tablets and desktops get the real artwork.
 * `priority` (needed so this doesn't lazy-load in behind the LCP-
 * critical logo/headline) forces the browser to fetch the image the
 * moment the <img> exists in the DOM, REGARDLESS of CSS `display`
 * state — a `hidden md:block` wrapper alone would still cost phone
 * visitors the full download. Gating the mount itself on a real
 * `matchMedia` check is the only way to make "don't load this on
 * phones" actually true rather than just visually true.
 */
export function LoginArtworkLayer({ className }: { className?: string }) {
  const [isTabletUp, setIsTabletUp] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect --
     Deliberate: reading a browser-only API (matchMedia) can't happen
     during SSR or the initial client render without a hydration
     mismatch — same accepted pattern as the sessionStorage-restore
     effects elsewhere in this codebase (e.g. HumanizeWorkspace). */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsTabletUp(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsTabletUp(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isTabletUp) return null;

  return (
    <div className={className} aria-hidden="true">
      <Image
        src="/images/login-artwork.webp"
        alt=""
        fill
        priority
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
    </div>
  );
}
