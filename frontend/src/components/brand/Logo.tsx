import { cn } from "@/lib/cn";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";
type LogoTone = "default" | "mono-light" | "mono-dark";

export interface LogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  /**
   * default: paper-colored type with the accent full stop — the
   * standard treatment on Humanora's own ink surface.
   * mono-light / mono-dark: a single color throughout, for placement
   * where the accent would be lost (photography, print).
   */
  tone?: LogoTone;
  className?: string;
}

const markSizes: Record<LogoSize, string> = {
  xs: "h-5 w-5 text-[0.8rem]",
  sm: "h-7 w-7 text-[1.05rem]",
  md: "h-9 w-9 text-[1.35rem]",
  lg: "h-12 w-12 text-[1.8rem]",
  xl: "h-16 w-16 text-[2.4rem]",
};

const wordmarkSizes: Record<LogoSize, string> = {
  xs: "text-base",
  sm: "text-[1.375rem]",
  md: "text-[1.625rem]",
  lg: "text-[2rem]",
  xl: "text-[2.5rem]",
};

function toneColor(tone: LogoTone) {
  if (tone === "mono-light") return "text-white";
  if (tone === "mono-dark") return "text-[#12110f]";
  return "text-wordmark";
}

/**
 * Humanora's compact mark: a serif capital H set inside a hairline
 * square, with the accent full stop. Used only where the full wordmark
 * genuinely doesn't fit (a collapsed nav rail, the mobile app bar).
 */
export function LogoMark({ size = "md", tone = "default", className }: { size?: LogoSize; tone?: LogoTone; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "font-display relative inline-flex shrink-0 items-center justify-center rounded-sm border border-current/30 leading-none",
        markSizes[size],
        toneColor(tone),
        className
      )}
    >
      <span className="translate-y-[0.04em] font-medium">H</span>
      {tone === "default" && (
        <span className="absolute bottom-[14%] right-[12%] h-[0.14em] w-[0.14em] rounded-full bg-brand-purple" />
      )}
    </span>
  );
}

/**
 * The Humanora wordmark: "Humanora." set in Newsreader, the full stop
 * in the accent color. The full stop is the whole idea — a finished
 * sentence, edited and done.
 */
export function Logo({ size = "md", showWordmark = true, tone = "default", className }: LogoProps) {
  if (!showWordmark) return <LogoMark size={size} tone={tone} className={className} />;

  return (
    <span
      className={cn(
        "font-display inline-flex items-baseline font-medium leading-none tracking-[-0.02em]",
        wordmarkSizes[size],
        toneColor(tone),
        className
      )}
    >
      Humanora
      <span className={tone === "default" ? "text-brand-purple" : undefined}>.</span>
    </span>
  );
}
