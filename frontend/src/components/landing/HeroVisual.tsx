/**
 * Hero product visual: a glowing "before → after" document transformation
 * card with the HUMANORA mark at the center. Pure CSS/SVG — no image
 * assets, no animation library. Respects prefers-reduced-motion via
 * Tailwind's motion-safe: variant (animations are simply absent otherwise).
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center sm:h-[480px]">
      {/* Ambient glow blobs */}
      <div
        aria-hidden="true"
        className="animate-pulse-slow absolute -left-8 top-4 h-56 w-56 rounded-full bg-brand-indigo/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-pulse-slower absolute -right-6 bottom-8 h-64 w-64 rounded-full bg-brand-purple/25 blur-3xl"
      />

      {/* Orbit ring */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="animate-spin-slow absolute h-[340px] w-[340px] opacity-40 sm:h-[400px] sm:w-[400px]"
      >
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="url(#orbit-gradient)"
          strokeWidth="1.5"
          strokeDasharray="4 10"
        />
        <defs>
          <linearGradient id="orbit-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-indigo)" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" />
          </linearGradient>
        </defs>
      </svg>

      {/* "Before" card, tucked behind and to the left */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-6 hidden w-48 -rotate-6 rounded-lg border border-border bg-surface/80 p-4 shadow-card backdrop-blur sm:block"
      >
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-foreground-subtle">
          Original
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="block h-1.5 w-full rounded-full bg-white/10" />
          <span className="block h-1.5 w-5/6 rounded-full bg-white/10" />
          <span className="block h-1.5 w-full rounded-full bg-white/10" />
          <span className="block h-1.5 w-3/4 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Central HUMANORA mark card */}
      <div className="relative z-10 flex flex-col items-center gap-4 rounded-xl border border-border-strong bg-surface/90 p-8 shadow-glow-md backdrop-blur">
        <div className="bg-brand-gradient flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-glow-sm">
          H
        </div>
        <p className="text-xs font-medium text-foreground-muted">
          Humanizing<span className="animate-ellipsis">...</span>
        </p>
      </div>

      {/* "After" card, in front and to the right */}
      <div
        aria-hidden="true"
        className="absolute bottom-4 right-0 w-52 rotate-3 rounded-lg border border-brand-purple/30 bg-surface p-4 shadow-glow-sm"
      >
        <p className="text-brand-gradient mb-2 text-[10px] font-semibold uppercase tracking-wide">
          Humanized
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="bg-brand-gradient block h-1.5 w-full rounded-full opacity-70" />
          <span className="bg-brand-gradient block h-1.5 w-4/5 rounded-full opacity-70" />
          <span className="bg-brand-gradient block h-1.5 w-full rounded-full opacity-70" />
        </div>
      </div>
    </div>
  );
}
