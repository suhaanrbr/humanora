"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Keys its child on the current route so navigating between /login and
 * /signup — which, thanks to the shared (auth) layout, never remounts
 * AuthShell or the artwork — still gets a deliberate, restrained
 * transition on the one thing that DOES change: the glass panel's
 * content. Reuses the same fade+lift keyframe already defined for the
 * marketing header's nav-panel switch (globals.css's
 * animate-nav-panel-fade-in — opacity + a few px of translateY, ~160ms,
 * gated under prefers-reduced-motion) rather than inventing a second
 * transition language for what is visually the same kind of moment:
 * one surface's content swapping in place.
 */
export function AuthPanelTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Always centered, never `lg:justify-end` — this component is shared
  // by BOTH the desktop two-column grid and the stacked tablet/phone
  // layout in AuthShell. In the desktop grid the wrapping column is
  // exactly the panel's own max-width, so `justify-end` was always
  // visually inert there (no room to shift). But at 1024-1279px the
  // *stacked* tablet layout is what's active, and its wrapper spans the
  // full viewport width — there `justify-end` had real room to work
  // with, and shoved the panel to the far right instead of centering
  // it. `justify-center` is correct (and visually identical to the old
  // `justify-end`) in the desktop case, and fixes the tablet one.
  return (
    <div key={pathname} className="animate-nav-panel-fade-in flex w-full justify-center">
      {children}
    </div>
  );
}
