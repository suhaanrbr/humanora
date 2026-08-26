import { cn } from "@/lib/cn";

export interface HumanoraRibbonProps {
  className?: string;
  /** Adds the flowing dash animation (respects prefers-reduced-motion). */
  animated?: boolean;
}

/**
 * HUMANORA's signature visual motif: a single flowing line that drifts
 * from a tight, mechanical wave into a looser, more natural curve —
 * structured AI text resolving into human rhythm, rendered as pure line
 * rather than any literal robot/brain/circuit imagery. Reused sparingly
 * across the hero background, section dividers, and processing states.
 */
export function HumanoraRibbon({ className, animated = false }: HumanoraRibbonProps) {
  return (
    <svg
      viewBox="0 0 600 120"
      fill="none"
      aria-hidden="true"
      className={cn("overflow-visible", className)}
    >
      <defs>
        <linearGradient id="humanora-ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand-indigo)" />
          <stop offset="55%" stopColor="var(--color-brand-violet)" />
          <stop offset="100%" stopColor="var(--color-brand-purple)" />
        </linearGradient>
      </defs>
      {/* Left half: tight, even, mechanical rhythm. Right half: the same
          line loosens into an irregular, organic curve. One continuous
          path — the transformation is the point. */}
      <path
        d="M0 60
           Q15 40 30 60 T60 60 T90 60 T120 60
           Q145 30 175 55 T225 65
           Q260 90 300 50
           Q340 15 385 70
           Q425 115 470 55
           Q515 5 560 65
           Q580 90 600 60"
        stroke="url(#humanora-ribbon)"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={animated ? "animate-flow-dash" : undefined}
        strokeDasharray={animated ? "3 9" : undefined}
      />
    </svg>
  );
}
