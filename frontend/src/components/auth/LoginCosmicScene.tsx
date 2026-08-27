/**
 * The login page's cinematic environment — pure CSS gradients/masks +
 * one inline SVG (still no external image assets). Rebuilt for
 * atmospheric depth rather than flat SVG geometry: every silhouette
 * (mountains, tower) is mask-faded into the mist instead of ending in
 * a hard edge, and there is no flat "ground plane" rectangle anywhere
 * — the sky-to-horizon transition is one continuous gradient.
 *
 * Depth layers, back to front:
 *   1. base gradient      — near-black cosmic base, darkest at the edges
 *   2. stars + planet     — distant, low-contrast
 *   3. nebula/mist         — organic blurred blob shapes around the tower
 *   4. mountains            — three atmospheric-perspective layers,
 *                             each mask-faded top and bottom into haze
 *   5. tower                 — layered blurred silhouette masses + a
 *                             few thin illuminated spires with rim light,
 *                             its base dissolving into the mist layer
 *   6. light path            — one continuous tapering glow, brightest
 *                             in the foreground, with a soft reflection
 *   7. horizon glow          — a soft radial wash where path meets tower,
 *                             the only thing standing in for "ground"
 *
 * Motion: one slow cloud drift and one slow path-glow flow — nothing
 * else moves, both gated under prefers-reduced-motion.
 */
export function LoginCosmicScene({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      {/* Layer 1 — base gradient. Atmospheric perspective: the horizon
          band (where the tower sits) is the brightest point; everything
          radiates out into near-black. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 54% 74%, #171d47 0%, #0f1236 24%, #090b28 46%, #050614 68%, #01010a 100%)",
        }}
      />

      {/* Layer 2 — stars, low contrast, denser away from the horizon */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: [
            "radial-gradient(1px 1px at 8% 18%, rgba(255,255,255,0.5) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 18% 42%, rgba(255,255,255,0.35) 0%, transparent 60%)",
            "radial-gradient(1.5px 1.5px at 32% 10%, rgba(255,255,255,0.45) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 48% 26%, rgba(255,255,255,0.3) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 62% 6%, rgba(255,255,255,0.35) 0%, transparent 60%)",
            "radial-gradient(1.5px 1.5px at 75% 18%, rgba(255,255,255,0.35) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 88% 12%, rgba(255,255,255,0.35) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 95% 38%, rgba(255,255,255,0.3) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 4% 55%, rgba(255,255,255,0.25) 0%, transparent 60%)",
            "radial-gradient(1px 1px at 55% 48%, rgba(255,255,255,0.25) 0%, transparent 60%)",
          ].join(","),
        }}
      />

      {/* Planet — darker body, a single thin rim-light arc rather than
          cartoon sphere shading, soft outer glow only. */}
      <div
        className="absolute right-[10%] top-[9%] h-16 w-16 rounded-full opacity-75 sm:h-[4.5rem] sm:w-[4.5rem]"
        style={{
          background: "radial-gradient(circle at 50% 50%, #1c2145 0%, #12153a 55%, #0a0c24 100%)",
          boxShadow:
            "inset -6px -4px 10px 0 rgba(0,0,0,0.5), inset 3px 2px 6px 0 rgba(120,140,230,0.25), 0 0 24px 2px rgba(91,110,220,0.12)",
        }}
      />

      {/* Layer 3 — nebula/mist: organic, asymmetric blurred shapes (not
          circles) layered mainly around and behind the tower, kept off
          the left edge so headline contrast stays high. Given a slow
          drift so the atmosphere reads as alive without being busy. */}
      <div className="login-cloud-drift absolute inset-0">
        <div
          className="absolute left-[38%] top-[8%] h-[38%] w-[42%] opacity-[0.16] blur-[70px]"
          style={{
            background: "radial-gradient(ellipse at center, var(--color-brand-purple) 0%, transparent 70%)",
            borderRadius: "50% 45% 55% 50% / 55% 50% 50% 45%",
          }}
        />
        <div
          className="absolute left-[52%] top-[2%] h-[30%] w-[34%] opacity-[0.14] blur-[60px]"
          style={{
            background: "radial-gradient(ellipse at center, var(--color-brand-indigo) 0%, transparent 70%)",
            borderRadius: "45% 55% 50% 50% / 50% 45% 55% 50%",
          }}
        />
        <div
          className="absolute left-[30%] top-[20%] h-[26%] w-[30%] opacity-[0.1] blur-[55px]"
          style={{
            background: "radial-gradient(ellipse at center, var(--color-brand-cyan) 0%, transparent 70%)",
            borderRadius: "55% 45% 45% 55% / 45% 55% 45% 55%",
          }}
        />
      </div>
      <div className="absolute -left-16 top-0 h-[45%] w-[45%] rounded-full bg-brand-indigo/[0.06] blur-[100px]" />

      {/* Right-edge energy threads — fewer, fainter, wider apart; framing
          the login card rather than competing with it. */}
      <svg viewBox="0 0 400 1000" preserveAspectRatio="none" className="absolute -right-4 top-0 h-full w-[26%] opacity-30">
        <defs>
          <linearGradient id="edge-wave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-purple)" stopOpacity="0" />
            <stop offset="40%" stopColor="var(--color-brand-purple)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-brand-indigo)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M 360 0 C 300 220, 340 420, 280 620 S 240 860, 320 1000" fill="none" stroke="url(#edge-wave)" strokeWidth="1.25" />
      </svg>

      {/* Layers 4-6 — mountains, tower, and the light path, all in one
          SVG so they share a horizon and a light source. Every solid
          shape here is mask-faded (via gradient fill opacity + blur
          filters), never a flat, hard-edged fill. */}
      <svg viewBox="0 0 1400 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="mtn-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141833" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#141833" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mtn-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#232a5c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#232a5c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mtn-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#05060f" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#05060f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tower-mass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1f4a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1c1f4a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tower-spire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-cyan)" stopOpacity="0.55" />
            <stop offset="35%" stopColor="var(--color-brand-violet)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-brand-violet)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="path-core" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#8fb4ff" stopOpacity="0.95" />
            <stop offset="55%" stopColor="var(--color-brand-indigo)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--color-brand-purple)" stopOpacity="0.7" />
          </linearGradient>
          <mask id="fade-bottom">
            <rect x="0" y="0" width="1400" height="900" fill="white" />
            <rect x="0" y="620" width="1400" height="280" fill="url(#fade-mask-gradient)" />
          </mask>
          <linearGradient id="fade-mask-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
          <filter id="soften-1" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="soften-2" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="path-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Mountains — atmospheric perspective, each mask-faded so
            nothing ends in a hard line against the sky or the mist. */}
        <g mask="url(#fade-bottom)">
          <polygon points="0,600 100,510 240,590 360,470 500,600 600,570 600,900 0,900" fill="url(#mtn-far)" filter="url(#soften-1)" />
          <polygon points="800,590 940,480 1080,580 1220,460 1400,570 1400,900 800,900" fill="url(#mtn-far)" filter="url(#soften-1)" />
          <polygon points="60,660 200,580 340,650 460,560 560,660 560,900 60,900" fill="url(#mtn-mid)" filter="url(#soften-2)" opacity="0.8" />
          <polygon points="840,650 960,570 1100,640 1240,550 1360,640 1360,900 840,900" fill="url(#mtn-mid)" filter="url(#soften-2)" opacity="0.8" />
          <polygon points="0,760 180,700 320,750 420,700 560,760 560,900 0,900" fill="url(#mtn-near)" opacity="0.9" />
          <polygon points="860,750 1000,700 1140,745 1260,700 1400,750 1400,900 860,900" fill="url(#mtn-near)" opacity="0.9" />
        </g>

        {/* Tower — a wide, soft distant mass first (depth), then a
            handful of narrower illuminated spires with rim light on
            top, the whole cluster mask-faded into the mist at its
            base rather than sitting on a hard ground line. */}
        <g mask="url(#fade-bottom)">
          <ellipse cx="710" cy="560" rx="140" ry="220" fill="url(#tower-mass)" filter="url(#soften-1)" />
          <polygon points="655,600 668,380 682,600" fill="url(#tower-spire)" filter="url(#soften-2)" opacity="0.6" />
          <polygon points="690,600 715,190 740,600" fill="url(#tower-spire)" filter="url(#soften-2)" />
          <polygon points="725,600 745,320 765,600" fill="url(#tower-spire)" filter="url(#soften-2)" opacity="0.7" />
          <polygon points="755,600 770,440 785,600" fill="url(#tower-spire)" filter="url(#soften-2)" opacity="0.5" />
          {/* Thin bright rim-light edges — static, not animated */}
          <line x1="715" y1="190" x2="712" y2="600" stroke="var(--color-brand-cyan)" strokeWidth="0.75" opacity="0.5" filter="url(#soften-2)" />
          <circle cx="715" cy="190" r="2.5" fill="var(--color-brand-cyan)" opacity="0.8" />
        </g>

        {/* Light path — a soft wide glow underneath a crisp tapering
            core, plus a faint reflection. Fully continuous, no
            segmented dashes. */}
        <path
          d="M -30 820 C 200 815, 340 760, 460 715 C 560 680, 640 640, 712 605"
          fill="none"
          stroke="url(#path-core)"
          strokeWidth="18"
          strokeLinecap="round"
          filter="url(#path-glow)"
          opacity="0.35"
        />
        <path
          d="M -30 820 C 200 815, 340 760, 460 715 C 560 680, 640 640, 712 605"
          fill="none"
          stroke="url(#path-core)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="animate-path-flow"
          pathLength={1}
          strokeDasharray="0.85 0.06"
        />
        <path
          d="M -30 840 C 200 836, 340 792, 460 758 C 560 730, 640 698, 712 668"
          fill="none"
          stroke="url(#path-core)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.2"
        />
      </svg>

      {/* Horizon glow — the only stand-in for "ground": one soft radial
          wash centered where the path meets the tower, blending
          continuously into the base gradient with no visible edge. */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(50% 40% at 50% 78%, rgba(139,92,246,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#050614]/70 to-transparent" />
    </div>
  );
}
