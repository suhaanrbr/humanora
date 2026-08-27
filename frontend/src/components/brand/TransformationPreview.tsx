import { cn } from "@/lib/cn";

/**
 * A small, restrained echo of the real Humanize result card — used
 * anywhere HUMANORA needs to say "this is what we do" without repeating
 * the Hero or ProductShowcase compositions verbatim (auth panels, the
 * Dashboard onboarding state). No animation, no tilt, no glow stack —
 * those are reserved for the landing page's showcase moments; here it's
 * quiet supporting material, not a second hero.
 */
export function TransformationPreview({ className }: { className?: string }) {
  return (
    <div className={cn("pearl-glass rounded-xl p-4 shadow-glow-sm", className)}>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-foreground-subtle">
          Professional
        </span>
        <span className="text-[9px] text-foreground-subtle">Balanced</span>
      </div>
      <p className="mb-2 text-[9px] uppercase tracking-wide text-foreground-subtle">Original</p>
      <div className="mb-3 flex flex-col gap-1.5">
        <span className="block h-1.5 w-full rounded-full bg-line" />
        <span className="block h-1.5 w-4/5 rounded-full bg-line" />
      </div>
      <p className="text-brand-gradient mb-2 text-[9px] font-semibold uppercase tracking-wide">
        HUMANORA result
      </p>
      <div className="flex flex-col gap-1.5">
        <span className="bg-brand-gradient block h-1.5 w-full rounded-full opacity-70" />
        <span className="bg-brand-gradient block h-1.5 w-11/12 rounded-full opacity-70" />
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
        <span className="text-[9px] text-foreground-subtle">My Voice applied</span>
      </div>
    </div>
  );
}
