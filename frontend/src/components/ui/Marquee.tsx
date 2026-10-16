import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A horizontal ticker that scrolls on a loop (styles: `.marquee` in
 * globals.css). The content is rendered twice so the loop is seamless;
 * the second copy is hidden from screen readers and taken out of the tab
 * order, so everything is announced and focusable exactly once. Pauses
 * on hover and focus, and sits still for reduced-motion readers.
 */
export function Marquee({
  children,
  reverse = false,
  duration = 40,
  className,
  trackClassName,
}: {
  children: ReactNode;
  /** Scroll right-to-left (default) or left-to-right. */
  reverse?: boolean;
  /** Seconds for one full loop. Higher is slower. */
  duration?: number;
  className?: string;
  trackClassName?: string;
}) {
  return (
    <div
      className={cn("marquee", className)}
      data-reverse={reverse || undefined}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div className={cn("marquee-track", trackClassName)}>{children}</div>
      <div className={cn("marquee-track", trackClassName)} aria-hidden="true" inert>
        {children}
      </div>
    </div>
  );
}
