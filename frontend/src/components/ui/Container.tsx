import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const SIZE_MAX_WIDTH = {
  // Marketing site's long-standing reading-width container — untouched,
  // so the landing page's line lengths don't shift.
  default: "max-w-7xl",
  // A moderate widen for workspace pages that are mostly text/controls
  // and shouldn't stretch too far (Write, Study, My Voice) — desktop
  // gets more breathing room without the line length or trait grid
  // spreading thin at 1920px.
  medium: "max-w-6xl",
  // Full workspace width for pages that genuinely benefit from more
  // horizontal room on large monitors — Home's composition, Library's
  // scan-a-list density.
  wide: "max-w-[96rem] 2xl:px-12",
} as const;

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Picks the container's max-width. `cn` here is a plain string join
   * (no tailwind-merge/dedup), so a page should get its width from
   * EITHER this prop OR its own `max-w-*` in `className` — never both,
   * since two conflicting max-w utilities in one class list have
   * unspecified precedence in the generated CSS.
   */
  size?: keyof typeof SIZE_MAX_WIDTH;
}

/**
 * Responsive content container with consistent max-width and horizontal
 * padding across breakpoints. Use for landing-page sections and app views.
 */
export function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", SIZE_MAX_WIDTH[size], className)}
      {...props}
    />
  );
}
