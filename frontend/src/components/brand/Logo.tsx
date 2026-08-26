import { cn } from "@/lib/cn";

type LogoSize = "sm" | "md" | "lg";

export interface LogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
}

const markSizes: Record<LogoSize, string> = {
  sm: "h-7 w-7 text-sm",
  md: "h-9 w-9 text-base",
  lg: "h-12 w-12 text-xl",
};

const wordmarkSizes: Record<LogoSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

/**
 * HUMANORA logo mark: a gradient-filled rounded square with an "H" glyph,
 * optionally paired with the wordmark. Matches the reference brand treatment.
 */
export function Logo({ size = "md", showWordmark = true, className }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "bg-brand-gradient inline-flex shrink-0 items-center justify-center rounded-lg font-bold text-white shadow-glow-sm",
          markSizes[size]
        )}
      >
        H
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            wordmarkSizes[size]
          )}
        >
          HUMANORA
        </span>
      )}
    </div>
  );
}
