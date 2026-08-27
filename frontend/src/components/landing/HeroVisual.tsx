/**
 * Hero product showcase — a layered composition of REAL HUMANORA
 * interface fragments (not abstract decoration, and not invented
 * metrics): a compact replica of the actual Humanize result card
 * anchors the center, with three satellite panels mirroring features
 * that genuinely exist and compute real values — Readability
 * (lib/ai/readability.ts), Meaning Check (lib/ai/meaningCheck.ts), and
 * My Voice traits (lib/ai/voiceAnalysis.ts). Deliberately does NOT
 * include anything resembling an "AI detection score" or "% human" —
 * HUMANORA makes no detector-evasion claim, so no panel here implies
 * one, even decoratively.
 *
 * Pure CSS/SVG, no animation library — every motion class is gated
 * under prefers-reduced-motion in globals.css, so this degrades to a
 * calm, fully static layout for anyone who asks for less motion.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[500px] w-full max-w-lg items-center justify-center sm:h-[580px]">
      {/* Ambient glow — light emerging from the dark, sets the depth
          the floating panels sit inside without being visual noise */}
      <div
        aria-hidden="true"
        className="animate-pulse-slow absolute -left-10 top-4 h-64 w-64 rounded-full bg-brand-indigo/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-pulse-slower absolute -right-8 bottom-6 h-72 w-72 rounded-full bg-brand-purple/20 blur-3xl"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="animate-spin-slow absolute h-[380px] w-[380px] opacity-[0.12] sm:h-[460px] sm:w-[460px]"
      >
        <circle cx="200" cy="200" r="190" fill="none" stroke="url(#orbit-gradient)" strokeWidth="1.5" strokeDasharray="4 10" />
        <defs>
          <linearGradient id="orbit-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-indigo)" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Central anchor: a compact, real replica of the Humanize result
          card — mode badge, before/after lines, word count. This is
          the "product" in the composition; everything else orbits it. */}
      <div
        className="pearl-glass animate-tilt-3d relative z-10 w-72 rounded-xl p-5 shadow-glow-md sm:w-80"
        style={{ perspective: "800px" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground-subtle">
            Professional
          </span>
          <span className="text-[10px] text-foreground-subtle">Balanced</span>
        </div>
        <p className="mb-3 text-[11px] uppercase tracking-wide text-foreground-subtle">Original</p>
        <div className="mb-4 flex flex-col gap-1.5">
          <span className="block h-1.5 w-full rounded-full bg-line" />
          <span className="block h-1.5 w-5/6 rounded-full bg-line" />
        </div>
        <p className="text-brand-gradient mb-3 text-[11px] font-semibold uppercase tracking-wide">
          HUMANORA result
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="bg-brand-gradient block h-1.5 w-full rounded-full opacity-70" />
          <span className="bg-brand-gradient block h-1.5 w-11/12 rounded-full opacity-70" />
          <span className="bg-brand-gradient block h-1.5 w-4/5 rounded-full opacity-70" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] text-foreground-subtle">
          <span>42 words</span>
          <span className="text-success">3 variations</span>
        </div>
      </div>

      {/* Readability panel — real feature (Flesch score), floats behind
          the top-left corner of the anchor card */}
      <div
        aria-hidden="true"
        className="pearl-glass animate-float-gentle-delayed-3 absolute left-0 top-6 z-20 hidden w-40 -rotate-6 rounded-lg p-3.5 shadow-glow-sm sm:block"
      >
        <p className="mb-2 text-[9px] font-medium uppercase tracking-wide text-foreground-subtle">Readability</p>
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-border)" strokeWidth="3.5" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 15}
              strokeDashoffset={2 * Math.PI * 15 * (1 - 0.82)}
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-foreground">Easy</p>
            <p className="text-[10px] text-foreground-subtle">82 / 100</p>
          </div>
        </div>
      </div>

      {/* Meaning Check panel — real feature, floats above-right,
          overlapping the anchor card's corner */}
      <div
        aria-hidden="true"
        className="pearl-glass animate-float-gentle absolute right-0 top-0 z-20 hidden w-44 rotate-3 rounded-lg p-3.5 shadow-glow-sm sm:block"
      >
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <p className="text-[9px] font-medium uppercase tracking-wide text-foreground-subtle">Meaning check</p>
        </div>
        <div className="flex flex-col gap-1.5 text-[10px] text-foreground-muted">
          <span>✓ Date: March 5</span>
          <span>✓ Number: 1,000</span>
          <span>✓ Link preserved</span>
        </div>
      </div>

      {/* My Voice panel — real feature (actual trait vocabulary), floats
          at the bottom, overlapping the anchor card's lower edge */}
      <div
        aria-hidden="true"
        className="pearl-glass surface-violet-tint animate-float-gentle-delayed-2 absolute -bottom-4 left-4 z-20 hidden w-52 rounded-lg !border-brand-purple/30 p-3.5 shadow-glow-sm sm:block"
      >
        <p className="text-brand-gradient mb-2 text-[9px] font-semibold uppercase tracking-wide">My Voice</p>
        <div className="flex flex-wrap gap-1.5">
          {["Conversational", "Direct", "Varied rhythm"].map((trait) => (
            <span
              key={trait}
              className="rounded-full border border-brand-purple/30 bg-background-elevated px-2 py-0.5 text-[9px] text-foreground-muted"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
