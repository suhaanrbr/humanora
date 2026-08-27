"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * A circular progress indicator — extracted from what was three
 * near-identical hand-coded `<svg>` rings (My Voice's profile-
 * completeness ring, the dashboard usage ring, the readability ring).
 * Real progress only: this renders whatever `percent` it's given, it
 * never invents a value.
 */
export function ProgressRing({
  percent,
  size = 64,
  strokeWidth = 6,
  label,
  className,
}: {
  /** 0-100. Values outside that range are clamped, never overflow the ring. */
  percent: number;
  size?: number;
  strokeWidth?: number;
  /** Rendered centered inside the ring — usually a percentage or short stat. */
  label?: string;
  className?: string;
}) {
  const gradientId = useId();
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ height: size, width: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" role="img" aria-label={label ? `${label}, ${clamped}%` : `${clamped}%`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          style={{ transition: `stroke-dashoffset var(--motion-duration-deliberate) var(--motion-ease-standard)` }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-indigo)" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" />
          </linearGradient>
        </defs>
      </svg>
      {label && <span className="absolute text-sm font-semibold text-foreground">{label}</span>}
    </div>
  );
}
