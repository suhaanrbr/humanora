/**
 * The login page's cinematic environment — a deep-space/fantasy-
 * landscape composition built entirely from CSS gradients + one
 * inline SVG (no external image assets, so there's nothing to
 * compress, size-shift, or lazy-load). Depth layers, back to front:
 *
 *   1. base gradient    — near-black navy foundation, brightest low
 *                          and center (near the structure/horizon)
 *   2. stars + nebula    — a star-dot field, a wispy nebula swirl,
 *                          a small distant planet
 *   3. structure + land  — mountain silhouettes, an abstract spire
 *                          cluster, and a glowing path crossing a
 *                          reflective ground plane toward it
 *   4. (rendered by the caller) — the actual HUMANORA copy and login
 *      card sit above this in DOM order; every layer here is
 *      aria-hidden and purely decorative.
 *
 * All motion is gated under prefers-reduced-motion (see globals.css's
 * existing pulse-slow/float-gentle/path-flow pattern) and kept to one
 * slow drift on the light path — nothing else moves.
 */
export function LoginCosmicScene({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      {/* Layer 1 — base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 100% at 55% 85%, #1c2350 0%, #10133a 28%, #080a24 52%, #03040f 78%, #01010a 100%)",
        }}
      />

      {/* Layer 2 — stars */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: [
            "radial-gradient(1px 1px at 8% 20%, rgba(255,255,255,0.55) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 18% 45%, rgba(255,255,255,0.4) 0%, transparent 60%)",
            "radial-gradient(1.5px 1.5px at 32% 12%, rgba(255,255,255,0.5) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 48% 30%, rgba(255,255,255,0.35) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 62% 8%, rgba(255,255,255,0.4) 0%, transparent 60%)",
            "radial-gradient(1.5px 1.5px at 75% 22%, rgba(255,255,255,0.4) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 88% 15%, rgba(255,255,255,0.4) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 95% 45%, rgba(255,255,255,0.35) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 4% 60%, rgba(255,255,255,0.3) 0%, transparent 60%)",
            "radial-gradient(1.5px 1.5px at 25% 70%, rgba(255,255,255,0.3) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 55% 55%, rgba(255,255,255,0.3) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,0.3) 0%, transparent 60%)",
          ].join(","),
        }}
      />

      {/* Nebula haze + wispy swirl */}
      <div className="absolute -left-16 top-0 h-[55%] w-[55%] rounded-full bg-brand-indigo/[0.09] blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-[65%] w-[65%] rounded-full bg-brand-purple/[0.11] blur-[110px]" />
      <svg viewBox="0 0 1000 1000" className="absolute right-[8%] top-[6%] h-[45%] w-[45%] opacity-40">
        <defs>
          <linearGradient id="nebula-swirl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-cyan)" stopOpacity="0.5" />
            <stop offset="60%" stopColor="var(--color-brand-purple)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 850 60 C 700 40, 620 140, 660 260 C 700 380, 560 420, 480 360"
          fill="none"
          stroke="url(#nebula-swirl)"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>

      {/* A small distant planet, upper-right */}
      <div
        className="absolute right-[10%] top-[8%] h-16 w-16 rounded-full opacity-85 sm:h-20 sm:w-20"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #7a8bea 0%, #3a4a9e 42%, #171b45 78%, transparent 100%)",
          boxShadow: "0 0 34px 5px rgba(91, 110, 220, 0.18)",
        }}
      />

      {/* Right-edge particle/wave threads — thin gradient-stroked lines
          drifting down the right side, echoing the reference without
          crossing into the text/card area. */}
      <svg viewBox="0 0 400 1000" preserveAspectRatio="none" className="absolute -right-4 top-0 h-full w-[30%] opacity-50">
        <defs>
          <linearGradient id="edge-wave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-purple)" stopOpacity="0" />
            <stop offset="35%" stopColor="var(--color-brand-purple)" stopOpacity="0.6" />
            <stop offset="70%" stopColor="var(--color-brand-indigo)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-brand-indigo)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M 380 0 C 320 180, 360 340, 300 500 S 260 760, 340 1000" fill="none" stroke="url(#edge-wave)" strokeWidth="1.5" />
        <path d="M 300 0 C 260 220, 300 380, 240 560 S 200 800, 260 1000" fill="none" stroke="url(#edge-wave)" strokeWidth="1" opacity="0.6" />
      </svg>

      {/* Layer 3 — mountains, structure, and the glowing path over a
          reflective ground plane. One SVG so everything shares the
          same horizon and light source. */}
      <svg viewBox="0 0 1400 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="spire-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-violet)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-brand-indigo)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="mountain-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2f5c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#12142e" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="path-glow" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-brand-indigo)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="ground-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-purple)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" stopOpacity="0" />
          </linearGradient>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Distant mountain range, flanking the structure */}
        <polygon points="0,620 120,480 260,600 380,440 520,610 620,560 620,900 0,900" fill="url(#mountain-fill)" opacity="0.55" />
        <polygon points="780,610 900,470 1020,600 1150,460 1300,590 1400,540 1400,900 780,900" fill="url(#mountain-fill)" opacity="0.55" />

        {/* Abstract spire cluster — a knowledge structure, several
            tapering needles of varying height, not a literal castle */}
        <g opacity="0.85">
          <polygon points="640,600 660,520 675,600" fill="url(#spire-fill)" opacity="0.6" />
          <polygon points="670,600 690,380 710,600" fill="url(#spire-fill)" opacity="0.75" />
          <polygon points="700,600 725,220 750,600" fill="url(#spire-fill)" />
          <polygon points="740,600 758,340 778,600" fill="url(#spire-fill)" opacity="0.8" />
          <polygon points="770,600 785,460 800,600" fill="url(#spire-fill)" opacity="0.6" />
        </g>
        <circle cx="725" cy="220" r="3" fill="var(--color-brand-cyan)" opacity="0.9" className="animate-pulse-slow" style={{ transformOrigin: "725px 220px" }} />

        {/* Reflective ground plane beneath the path */}
        <rect x="0" y="640" width="1400" height="260" fill="url(#ground-fade)" />

        {/* The light path — flows from lower-left foreground toward the
            structure's base across the reflective ground. */}
        <path
          d="M -20 860 C 220 850, 340 760, 460 720 S 620 660, 725 605"
          fill="none"
          stroke="url(#path-glow)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#soft-glow)"
          className="animate-path-flow"
          pathLength={1}
          strokeDasharray="0.2 0.06"
        />
        {/* A faint reflection of the path in the ground */}
        <path
          d="M -20 880 C 220 872, 340 810, 460 785 S 620 745, 725 705"
          fill="none"
          stroke="url(#path-glow)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.25"
        />
      </svg>

      {/* Horizon illumination */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-brand-indigo/[0.08] to-transparent" />
    </div>
  );
}
