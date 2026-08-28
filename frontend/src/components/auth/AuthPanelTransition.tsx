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
  return (
    <div key={pathname} className="animate-nav-panel-fade-in w-full lg:flex lg:justify-end">
      {children}
    </div>
  );
}
