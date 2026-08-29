"use client";

import { useRef, useId } from "react";
import { usePinnedScene } from "@/lib/scrollScene";
import { SceneBackdrop } from "@/components/landing/cinematic/SceneBackdrop";
import { CornerFrame } from "@/components/landing/cinematic/CornerFrame";

// Each capability gets its own depth plane, not a node on a wire — a
// real one-line description (not just a label), a color signal that
// carries through to that capability's own later scene, and a "depth"
// tier that controls how blurred/distant/scaled it starts. `index`
// gives each card the same "measured object" micro-label as
// HumanizeScene's document (§01, §02…) instead of a bare icon+text row.
const SURFACES = [
  {
    key: "voice",
    index: "02",
    label: "My Voice",
    hint: "Learns how you actually write.",
    href: "/dashboard/voice",
    top: "16%",
    left: "68%",
    depth: "near",
    color: "var(--color-brand-pink)",
    Icon: VoiceIcon,
  },
  {
    key: "study",
    index: "03",
    label: "Study",
    hint: "Summarize, explain, or take notes.",
    href: "/dashboard/study",
    top: "60%",
    left: "16%",
    depth: "far",
    color: "var(--color-brand-cyan)",
    Icon: StudyIcon,
  },
  {
    key: "library",
    index: "04",
    label: "Library",
    hint: "Every past result, saved automatically.",
    href: "/dashboard/history",
    top: "68%",
    left: "70%",
    depth: "mid",
    color: "var(--color-brand-indigo)",
    Icon: LibraryIcon,
  },
] as const;

const DEPTH_FROM = {
  near: { scale: 0.5, blur: 8, opacity: 0 },
  mid: { scale: 0.35, blur: 12, opacity: 0 },
  far: { scale: 0.25, blur: 16, opacity: 0 },
} as const;
const DEPTH_TO = {
  near: { scale: 1, blur: 0 },
  mid: { scale: 0.88, blur: 1 },
  far: { scale: 0.78, blur: 2 },
} as const;

/**
 * Scene 2: not a node-and-line diagram — a workspace physically
 * unfolding across depth planes. The Humanize document recedes left
 * (continuity with HumanizeScene's own exit state); HUMANORA's other
 * capabilities don't connect to it with drawn lines, they emerge from
 * their own depth — My Voice arrives near and sharp, Study stays
 * smaller/softer/further back, Library settles mid-distance — while an
 * enormous, mostly-out-of-frame H sits behind all of it as environmental
 * architecture, not a small foreground icon. Each surface links to its
 * real route (an anonymous visitor hits the real login gate, same as
 * every other CTA on this page).
 */
export function WorkspaceExpansionScene() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const docRef = useRef<HTMLDivElement | null>(null);
  const hRef = useRef<HTMLDivElement | null>(null);
  const surfaceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const gradientId = useId();

  usePinnedScene(trackRef, stageRef, (tl) => {
    const doc = docRef.current!;
    const h = hRef.current!;
    const label = labelRef.current!;

    tl.fromTo(doc, { scale: 1, x: "0%", opacity: 1 }, { scale: 0.7, x: "-32%", opacity: 0.5, ease: "none", duration: 0.22 }, 0)
      .fromTo(h, { scale: 0.85, opacity: 0.08 }, { scale: 1, opacity: 0.16, ease: "none", duration: 0.4 }, 0);

    surfaceRefs.current.forEach((surface, i) => {
      if (!surface) return;
      const depth = SURFACES[i].depth;
      const from = DEPTH_FROM[depth];
      const to = DEPTH_TO[depth];
      const start = 0.24 + i * 0.16;
      tl.fromTo(
        surface,
        { opacity: from.opacity, scale: from.scale, filter: `blur(${from.blur}px)` },
        { opacity: 1, scale: to.scale, filter: `blur(${to.blur}px)`, ease: "none", duration: 0.28 },
        start
      );
    });

    tl.fromTo(label, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.16 }, 0.82);

    // Hand off to MyVoiceScene (the very next scene): rather than all
    // three surfaces just sitting there until the pin releases, the
    // My Voice surface — the one this scene has already brought
    // nearest/sharpest — grows and drifts toward center in the final
    // beat, while Study/Library recede. It's not literally the same
    // DOM element MyVoiceScene renders, but the enlarging pink surface
    // moving toward center gives the eye something to follow directly
    // into MyVoiceScene's own centered profile card, instead of a cut.
    const voiceSurface = surfaceRefs.current[0];
    const studySurface = surfaceRefs.current[1];
    const librarySurface = surfaceRefs.current[2];
    if (voiceSurface) tl.to(voiceSurface, { scale: 1.3, ease: "none", duration: 0.14 }, 0.86);
    if (studySurface) tl.to(studySurface, { opacity: 0.25, scale: 0.5, ease: "none", duration: 0.14 }, 0.86);
    if (librarySurface) tl.to(librarySurface, { opacity: 0.25, scale: 0.5, ease: "none", duration: 0.14 }, 0.86);
  });

  return (
    <div ref={trackRef} className="cinematic-track" style={{ ["--pin-vh" as string]: "180vh" }}>
      <div ref={stageRef} className="cinematic-stage">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 55% at 50% 45%, rgba(168,85,247,0.12) 0%, transparent 65%)" }}
        />

        <SceneBackdrop word="SYSTEM" index="02 / WORKSPACE" align="right" tint="rgba(168,85,247,0.15)" />

        {/* Enormous, mostly out-of-frame H — environmental architecture
            sitting behind the whole scene rather than a small labeled
            icon connected to everything by wires. */}
        <div
          ref={hRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 max-[859px]:hidden motion-reduce:opacity-[0.12]"
        >
          <svg viewBox="0 0 200 200" className="h-[85vh] w-[85vh] max-h-[900px] max-w-[900px]">
            <defs>
              <linearGradient id={`${gradientId}-edge`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-indigo)" />
                <stop offset="55%" stopColor="var(--color-brand-purple)" />
                <stop offset="100%" stopColor="var(--color-brand-pink)" />
              </linearGradient>
            </defs>
            {/* A much smaller corner radius than LogoMark's own (rx=17
                at icon scale) — at ~near-viewport-height size, that
                radius would be most of the stroke's width, reading as
                a rounded pill/stadium rather than an architectural
                upright. Sharp corners at this scale read as structure. */}
            <rect x="30" y="65" width="35" height="105" rx="3" fill="none" stroke={`url(#${gradientId}-edge)`} strokeWidth="1" />
            <rect x="135" y="25" width="35" height="145" rx="3" fill="none" stroke={`url(#${gradientId}-edge)`} strokeWidth="1" />
            <polygon points="65,95 135,60 135,90 65,125" fill="none" stroke={`url(#${gradientId}-edge)`} strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="absolute inset-0 max-[859px]:static max-[859px]:flex max-[859px]:flex-col max-[859px]:items-center max-[859px]:gap-6 max-[859px]:px-6 max-[859px]:py-10 motion-reduce:static motion-reduce:flex motion-reduce:flex-col motion-reduce:items-center motion-reduce:gap-6 motion-reduce:px-6 motion-reduce:py-10">
          {/* Receded Humanize document — echoes HumanizeScene's exit state. */}
          <div ref={docRef} className="pearl-glass absolute overflow-hidden left-[14%] top-[38%] w-[26%] min-w-[220px] rounded-xl p-5 opacity-100 max-[859px]:!relative max-[859px]:w-full max-[859px]:max-w-sm max-[859px]:!left-auto max-[859px]:!top-auto motion-reduce:!relative motion-reduce:w-full motion-reduce:max-w-sm motion-reduce:!left-auto motion-reduce:!top-auto">
            <CornerFrame color="rgba(59,130,246,0.45)" />
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Humanize</p>
              <span className="font-mono text-[10px] tabular-nums text-white/30">§01</span>
            </div>
            <p className="mt-2 text-sm text-white/70">This approach should meaningfully improve how efficiently the team operates.</p>
          </div>

          {SURFACES.map((s, i) => (
            <a
              key={s.key}
              href={s.href}
              className="focus-ring absolute w-[210px] -translate-x-1/2 -translate-y-1/2 max-[859px]:static max-[859px]:w-full max-[859px]:max-w-sm max-[859px]:!translate-x-0 max-[859px]:!translate-y-0 motion-reduce:static motion-reduce:w-full motion-reduce:max-w-sm motion-reduce:!translate-x-0 motion-reduce:!translate-y-0"
              style={{ top: s.top, left: s.left }}
            >
              {/* GSAP-owned element — scale/opacity/blur only, no other
                  transform on this node, so it never fights the outer
                  anchor's static centering translate. */}
              <div
                ref={(el) => {
                  surfaceRefs.current[i] = el;
                }}
                className="hover-lift relative overflow-hidden rounded-xl border bg-white/[0.05] p-4 opacity-100 backdrop-blur-sm transition-colors hover:border-white/30 max-[859px]:!scale-100 max-[859px]:!blur-none motion-reduce:!scale-100 motion-reduce:!blur-none"
                style={{ borderColor: `color-mix(in srgb, ${s.color} 30%, transparent)` }}
              >
                <CornerFrame color={`color-mix(in srgb, ${s.color} 55%, transparent)`} />
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                    style={{ borderColor: `color-mix(in srgb, ${s.color} 35%, transparent)`, color: s.color }}
                  >
                    <s.Icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-white/30">§{s.index}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-white/90">{s.label}</p>
                <p className="mt-1 text-xs text-white/55">{s.hint}</p>
              </div>
            </a>
          ))}
        </div>

        <div ref={labelRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 text-center opacity-100 max-[859px]:static max-[859px]:translate-x-0 motion-reduce:static motion-reduce:translate-x-0">
          <p className="text-sm text-white/60">One connected workspace — not a bundle of separate tools.</p>
        </div>
      </div>
    </div>
  );
}

function VoiceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3a7 7 0 0 1 7 7v2a9 9 0 0 1-2 5.5M6.6 18A9 9 0 0 1 5 12v-2a7 7 0 0 1 1.2-3.9M9 21a11 11 0 0 0 1.5-5.6V11a1.5 1.5 0 1 1 3 0v1.2M12 17.5c1.7 0 3-1.3 3-3V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StudyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="7" height="16" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="9.5" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 4.5V9h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
