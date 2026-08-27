/**
 * The login page's cinematic environment — a deep-space composition
 * built entirely from CSS gradients + one inline SVG (no external
 * image assets, so there's nothing to compress, size-shift, or lazy-
 * load, and it costs nothing extra over the plain gradient background
 * it replaces). Four depth layers, back to front:
 *
 *   1. base gradient       — the near-black navy foundation
 *   2. stars + haze        — a repeating star-dot pattern, blurred
 *                            blue/violet nebula blobs, a small "planet"
 *   3. structure + path    — an abstract spire silhouette and a
 *                            glowing curved path flowing toward it
 *   4. (rendered by the caller) — the actual HUMANORA left-column copy
 *      and login card sit in DOM order above this, so this component
 *      only ever renders decorative, aria-hidden layers.
 *
 * All motion is gated under prefers-reduced-motion (see globals.css's
 * existing pattern for pulse-slow/float-gentle) and kept extremely
 * subtle: a slow drift on the light path, nothing else moves.
 */
export function LoginCosmicScene({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      {/* Layer 1 — base gradient: near-black navy, brightest low and
          center-right (near the structure), falling to darkness at the
          edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 68% 78%, #131a3d 0%, #0a0e26 35%, #050714 62%, #02030b 100%)",
        }}
      />

      {/* Layer 2 — stars: a repeating dot field, the same primitive
          used for .app-atmosphere's grid, just sparser and starrier. */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)," +
            "radial-gradient(1px 1px at 70% 15%, rgba(255,255,255,0.4) 0%, transparent 60%)," +
            "radial-gradient(1.5px 1.5px at 45% 55%, rgba(255,255,255,0.35) 0%, transparent 60%)," +
            "radial-gradient(1px 1px at 85% 65%, rgba(255,255,255,0.4) 0%, transparent 60%)," +
            "radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.3) 0%, transparent 60%)," +
            "radial-gradient(1.5px 1.5px at 60% 85%, rgba(255,255,255,0.3) 0%, transparent 60%)," +
            "radial-gradient(1px 1px at 30% 10%, rgba(255,255,255,0.35) 0%, transparent 60%)," +
            "radial-gradient(1px 1px at 92% 40%, rgba(255,255,255,0.3) 0%, transparent 60%)",
        }}
      />

      {/* Nebula haze — blue and violet, soft and low-opacity */}
      <div className="absolute -left-16 top-0 h-[55%] w-[55%] rounded-full bg-brand-indigo/[0.09] blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-[60%] w-[60%] rounded-full bg-brand-purple/[0.1] blur-[110px]" />

      {/* A small distant planet, upper-right */}
      <div
        className="absolute right-[12%] top-[10%] h-16 w-16 rounded-full opacity-80 sm:h-20 sm:w-20"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #6d7fe0 0%, #3a4a9e 40%, #1a2050 75%, transparent 100%)",
          boxShadow: "0 0 30px 4px rgba(91, 110, 220, 0.15)",
        }}
      />

      {/* Layer 3 — the distant structure + the glowing path, as one SVG
          so they can share the same perspective and light source. An
          abstract spire (not a literal castle/spaceship) built from a
          few tapering triangles, with a curved gradient-stroked path
          sweeping toward its base. */}
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="spire-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-violet)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-brand-indigo)" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="path-glow" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-brand-indigo)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" stopOpacity="0.7" />
          </linearGradient>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Abstract spire cluster — a knowledge structure, not a castle */}
        <g opacity="0.8">
          <polygon points="520,430 545,150 570,430" fill="url(#spire-fill)" />
          <polygon points="565,430 585,230 605,430" fill="url(#spire-fill)" opacity="0.8" />
          <polygon points="480,430 500,280 520,430" fill="url(#spire-fill)" opacity="0.7" />
          <circle cx="545" cy="150" r="3" fill="var(--color-brand-cyan)" opacity="0.8" />
        </g>
        {/* A breathing point of light at the structure's peak — the only
            other motion besides the path, and barely perceptible. */}
        <circle cx="545" cy="150" r="3" fill="var(--color-brand-cyan)" className="animate-pulse-slow" style={{ transformOrigin: "545px 150px" }} />

        {/* The light path — flows from lower-left foreground toward the
            structure's base, per the brief's "raw draft -> refinement
            -> human expression" metaphor. */}
        <path
          d="M -20 560 C 150 560, 220 480, 320 460 S 460 440, 545 430"
          fill="none"
          stroke="url(#path-glow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#soft-glow)"
          className="animate-path-flow"
          pathLength={1}
          strokeDasharray="0.2 0.06"
        />
      </svg>

      {/* Horizon illumination — a warm-cool line of light where the
          path meets the structure, grounding the whole composition. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-indigo/[0.06] to-transparent" />
    </div>
  );
}
