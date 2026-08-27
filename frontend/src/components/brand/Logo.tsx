import { useId } from "react";
import { cn } from "@/lib/cn";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";
type LogoTone = "gradient" | "mono-light" | "mono-dark" | "brand";

export interface LogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  /**
   * gradient (default): the full brand gradient mark — the standard
   * treatment everywhere the background is HUMANORA's own dark surface.
   * mono-light: solid white — for placement on photography, video, or
   * any surface where the gradient would lose contrast.
   * mono-dark: solid near-black — for rare light/printed contexts.
   * brand: a single flat brand-purple fill — favicon-safe (gradients in
   * a 16-32px favicon often muddy; a single flat color reads cleaner).
   */
  tone?: LogoTone;
  className?: string;
}

const markSizes: Record<LogoSize, string> = {
  xs: "h-5 w-5",
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const wordmarkSizes: Record<LogoSize, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-3xl",
};

// The mark's own viewBox (0 0 40 40, content spans x=6..34) carries
// ~6 units of dead space to the right of its tallest stroke, on top of
// the plain flex gap — squaring markSizes assumes a square icon
// elsewhere (dashboard rail, favicon), so it isn't safe to crop the
// shared viewBox itself. Instead the lockup below pulls the wordmark in
// with a SMALL negative margin (just enough to cancel that dead space,
// not fuse the two together) so it reads as one properly-spaced
// wordmark rather than either two separate elements or one squashed
// glyph — every other LogoMark usage keeps its untouched square bounds.
const gapSizes: Record<LogoSize, string> = {
  xs: "gap-1",
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2.5",
  xl: "gap-3",
};
const markPullSizes: Record<LogoSize, string> = {
  xs: "-mr-0.5",
  sm: "-mr-1",
  md: "-mr-1.5",
  lg: "-mr-2",
  xl: "-mr-2.5",
};

/**
 * HUMANORA's brand mark — "The Ascent": two uprights of an abstract H,
 * asymmetric in height, joined by a diagonal beam that climbs from the
 * shorter stroke to the taller one. Reads as a real monogram (the
 * product's own initial, not an invented pictograph) while the rising
 * diagonal is what makes it HUMANORA's specifically — the same idea the
 * product is built on, translated into the mark's own geometry: a
 * plain input rising into something more expressive. Deliberately not
 * a sparkle/orb (used everywhere in AI branding already) and not a
 * literal letterform in a container — the strokes ARE the mark, so it
 * sits on any surface without needing a background shape to read.
 *
 * The gradient is a styling choice, not a structural one — the shape
 * itself is legible in flat silhouette (see `tone="mono-*"`), which is
 * what keeps it recognizable down to favicon size.
 */
export function LogoMark({ size = "md", tone = "gradient", className }: { size?: LogoSize; tone?: LogoTone; className?: string }) {
  // useId (not a module-level counter) — this must produce the exact
  // same value during the server render and the client hydration pass
  // for the SAME element, or React flags a hydration mismatch (a
  // counter increments differently across those two passes and briefly
  // shipped this exact bug). useId is supported in Server Components
  // specifically for this reason.
  const gradientId = useId();
  const fill =
    tone === "gradient"
      ? `url(#${gradientId})`
      : tone === "mono-light"
        ? "#ffffff"
        : tone === "mono-dark"
          ? "#0a0a12"
          : "var(--color-brand-purple)";

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn(markSizes[size], "shrink-0", className)}
      aria-hidden="true"
    >
      {tone === "gradient" && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-brand-indigo)" />
            <stop offset="55%" stopColor="var(--color-brand-purple)" />
            <stop offset="100%" stopColor="var(--color-brand-pink)" />
          </linearGradient>
        </defs>
      )}
      <rect x="6" y="13" width="7" height="21" rx="3.5" fill={fill} />
      <rect x="27" y="5" width="7" height="29" rx="3.5" fill={fill} />
      <polygon points="13,19 27,12 27,18 13,25" fill={fill} />
    </svg>
  );
}

/**
 * The full HUMANORA lockup — mark + wordmark. This is what almost every
 * caller should use; reach for `LogoMark` alone only where space is
 * genuinely too tight for the wordmark (a collapsed nav rail, a mobile
 * tab) or where the wordmark would duplicate an adjacent page title.
 *
 * The mark stands in for the wordmark's own "H" rather than sitting
 * beside a full "HUMANORA" — set flush (see `gapSizes`) against
 * "UMANORA" so the two read as one word: the Ascent mark literally IS
 * the H.
 */
export function Logo({ size = "md", showWordmark = true, tone = "gradient", className }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center", gapSizes[size], className)}>
      <LogoMark size={size} tone={tone} className={showWordmark ? markPullSizes[size] : undefined} />
      {showWordmark && (
        <span
          className={cn(
            "font-display font-extrabold tracking-tighter text-foreground",
            wordmarkSizes[size],
            tone === "mono-light" && "text-white"
          )}
        >
          UMANORA
        </span>
      )}
    </div>
  );
}
