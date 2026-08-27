import { cn } from "@/lib/cn";

/**
 * A single shimmering placeholder line — wraps the existing
 * `.skeleton-line`/`.animate-sweep-shimmer` treatment (already proven
 * in HumanizeWorkspace/StudyWorkspace's processing state) as a real
 * component instead of two literal class names copy-pasted per call
 * site. Reduced-motion users get the static gradient with no shimmer
 * (`.animate-sweep-shimmer` is itself gated in globals.css).
 */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("skeleton-line animate-sweep-shimmer block h-3 w-full", className)} aria-hidden="true" />;
}

/** A short stack of skeleton lines with the last line narrower — the
 * common "a paragraph is loading" shape, so callers don't hand-tune
 * widths per instance. */
export function SkeletonLines({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={i === count - 1 ? "w-4/5" : undefined} />
      ))}
    </div>
  );
}
