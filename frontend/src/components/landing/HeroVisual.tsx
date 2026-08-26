/**
 * Hero product visual: an "Original → HUMANORA → Humanized" transformation
 * system, explicitly labeled so the flow reads at a glance. Pure CSS/SVG —
 * no image assets, no animation library. All motion is `prefers-reduced-
 * motion`-gated (see globals.css) so it degrades to a calm, static layout.
 */
export function HeroVisual() {
  const particles = [
    { top: "60%", left: "16%", delay: "0s" },
    { top: "38%", left: "10%", delay: "0.8s" },
    { top: "74%", left: "26%", delay: "1.6s" },
    { top: "28%", left: "22%", delay: "2.4s" },
  ];

  return (
    <div className="relative mx-auto flex h-[460px] w-full max-w-lg items-center justify-center sm:h-[540px]">
      {/* Ambient glow — light emerging from the dark */}
      <div
        aria-hidden="true"
        className="animate-pulse-slow absolute -left-10 top-4 h-64 w-64 rounded-full bg-brand-indigo/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-pulse-slower absolute -right-8 bottom-6 h-72 w-72 rounded-full bg-brand-purple/20 blur-3xl"
      />

      {/* Outer + inner orbit rings, counter-rotating for a layered,
          sophisticated processor feel rather than a single spinning ring */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="animate-spin-slow absolute h-[380px] w-[380px] opacity-25 sm:h-[460px] sm:w-[460px]"
      >
        <circle cx="200" cy="200" r="190" fill="none" stroke="url(#orbit-gradient)" strokeWidth="1.5" strokeDasharray="4 10" />
        <defs>
          <linearGradient id="orbit-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-indigo)" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="animate-spin-slow-reverse absolute h-[300px] w-[300px] opacity-30 sm:h-[360px] sm:w-[360px]"
      >
        <circle cx="200" cy="200" r="150" fill="none" stroke="var(--color-brand-purple)" strokeWidth="1" strokeDasharray="1 14" />
      </svg>

      {/* Flowing dashed connectors: Original → core → Humanized, a faint
          animated "current" rather than a static line */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 460">
        <path
          d="M110 110 Q170 150 190 210"
          fill="none"
          stroke="var(--color-brand-indigo)"
          strokeWidth="1.5"
          strokeDasharray="3 9"
          className="animate-flow-dash"
        />
        <path
          d="M215 250 Q250 300 290 340"
          fill="none"
          stroke="var(--color-brand-purple)"
          strokeWidth="1.5"
          strokeDasharray="3 9"
          className="animate-flow-dash"
        />
      </svg>

      {/* Particles drifting toward the core */}
      {particles.map((particle, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="animate-drift-particle absolute h-1 w-1 rounded-full bg-brand-purple/70"
          style={{
            top: particle.top,
            left: particle.left,
            animationDelay: particle.delay,
            ["--drift-to" as string]: "translate(70px, -150px)",
          }}
        />
      ))}

      {/* "Original" card — opaque pearl-glass, never see-through: a
          transformation demo only works if "before" is clearly legible. */}
      <div
        aria-hidden="true"
        className="pearl-glass animate-float-gentle absolute left-0 top-8 hidden w-48 -rotate-6 rounded-lg p-4 sm:block"
      >
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-foreground-subtle">
          Original
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="block h-1.5 w-full rounded-full bg-line" />
          <span className="block h-1.5 w-5/6 rounded-full bg-line" />
          <span className="block h-1.5 w-full rounded-full bg-line" />
          <span className="block h-1.5 w-3/4 rounded-full bg-line" />
        </div>
      </div>

      {/* Central HUMANORA core — layered rings + inner glyph instead of a
          flat rounded square, for a more sophisticated "processor" feel */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div
          className="pearl-glass animate-tilt-3d relative flex h-28 w-28 items-center justify-center rounded-full !border-brand-purple/30 shadow-glow-md sm:h-32 sm:w-32"
          style={{ perspective: "600px" }}
        >
          <div className="absolute inset-2 rounded-full border border-brand-indigo/20" />
          <div className="bg-brand-gradient animate-pulse-slow flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-glow-sm sm:h-16 sm:w-16 sm:text-2xl">
            H
          </div>
        </div>
        <div className="pearl-glass rounded-full px-3 py-1">
          <p className="text-xs font-medium text-foreground-muted">
            Humanizing<span className="animate-ellipsis">...</span>
          </p>
        </div>
      </div>

      {/* Neutral floating status badge — echoes the tooltip in the
          reference composition without a fabricated percentage claim */}
      <div
        aria-hidden="true"
        className="pearl-glass animate-float-gentle absolute right-2 top-2 hidden rounded-full !border-brand-purple/30 px-3.5 py-1.5 shadow-glow-sm sm:block"
      >
        <p className="text-brand-gradient text-xs font-semibold">Humanized</p>
      </div>

      {/* "Humanized" card — a faint violet tint distinguishes the result
          side from the plain "Original" card, opaque like it. */}
      <div
        aria-hidden="true"
        className="pearl-glass surface-violet-tint animate-float-gentle-delayed absolute bottom-6 right-0 w-52 rotate-3 rounded-lg !border-brand-purple/30 p-4 shadow-glow-sm"
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
