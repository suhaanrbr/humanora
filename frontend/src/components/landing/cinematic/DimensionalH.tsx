"use client";

import { useRef, useId } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { usePinnedScene } from "@/lib/scrollScene";

/**
 * HUMANORA's cinematic arrival — the site's signature dimensional
 * moment. A sculptural build of the brand H (same two-upright +
 * diagonal-beam geometry as LogoMark, just rendered large and lit)
 * exists in near-darkness, tilted away in perspective. Scrolling
 * through this section's extra height scrubs one GSAP timeline: the H
 * turns to face the viewer, sharpens, and settles — then recedes as
 * the real headline/CTA (already present in the DOM, not injected by
 * JS) take the foreground, handing off into Pillars below.
 *
 * Resolution-independent by construction — the H is inline SVG, so it
 * stays razor-sharp at any pixel density up to 4K+ with zero extra
 * asset weight. No canvas/WebGL, so there's no devicePixelRatio budget
 * to manage here at all.
 */
export function DimensionalH() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const hRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const glimpseRef = useRef<HTMLDivElement | null>(null);
  const gradientId = useId();

  usePinnedScene(trackRef, stageRef, (tl) => {
    const h = hRef.current!;
    const copy = copyRef.current!;
    const glimpse = glimpseRef.current!;
    tl.fromTo(
      h,
      { opacity: 0.4, scale: 0.6, rotateY: 42, rotateX: 16, z: -300, filter: "blur(7px)" },
      { opacity: 1, scale: 1, rotateY: 0, rotateX: 0, z: 0, filter: "blur(0px)", ease: "none", duration: 0.55 },
      0
    )
      // Copy starts already legible (not full-black at first paint) —
      // a visitor's very first frame must show the headline/CTA, not
      // require a scroll to reveal it. Only a light settle-in remains.
      .fromTo(copy, { opacity: 0.75, y: 16 }, { opacity: 1, y: 0, ease: "none", duration: 0.25 }, 0.1)
      // Recede, never vanish — the previous version faded the H to
      // 0.22 opacity and the headline all the way to 0, so the LAST
      // pinned frame (the one frozen on screen right up until the
      // unpin) was an almost-empty viewport: no legible headline, a
      // barely-visible H, and a plain glass rectangle standing in for
      // "the product." That is precisely the dead-scroll transition
      // the rest of the page suffers from — fixed by keeping both
      // clearly present through the handoff, de-emphasized rather than
      // gone, so there is always a meaningful visual up to the instant
      // HumanizeScene (already fully legible by default) takes over.
      .to(h, { opacity: 0.4, scale: 1.2, rotateY: -10, filter: "blur(4px)", ease: "none", duration: 0.25 }, 0.72)
      .to(copy, { opacity: 0.5, y: -14, ease: "none", duration: 0.18 }, 0.74)
      .fromTo(glimpse, { opacity: 0, scale: 0.92 }, { opacity: 0.9, scale: 1, ease: "none", duration: 0.26 }, 0.68);
  });

  return (
    <div id="hero" ref={trackRef} className="cinematic-track" style={{ ["--pin-vh" as string]: "130vh" }}>
      <div ref={stageRef} className="cinematic-stage">
        {/* Ambient environment — near-black with a soft, off-center key
            light. Pure CSS gradients, no image asset, so it's crisp at
            any resolution and costs nothing to load. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 30% 28%, rgba(168,85,247,0.16) 0%, transparent 60%), radial-gradient(45% 40% at 78% 70%, rgba(59,130,246,0.10) 0%, transparent 65%)",
          }}
        />

        {/* A soft, out-of-focus glimpse of the real product, revealed
            only in the timeline's final beat — a preview of the kind of
            document view ProductShowcase renders in full clarity
            further down the page. Cheap continuity: a hint of the real
            UI, not an empty glass rectangle. */}
        <div
          ref={glimpseRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 max-[859px]:hidden motion-reduce:hidden"
        >
          {/* A faint mock of the coming Humanize document, not an empty
              glass rectangle — the previous version was just a blank
              panel, which read as "empty screen" rather than "product
              arriving." */}
          <div className="pearl-glass flex h-[46vh] w-[70vw] max-w-3xl flex-col gap-3 rounded-2xl p-8 blur-[2px]">
            <span className="block h-3 w-2/3 rounded-full bg-white/10" />
            <span className="block h-3 w-full rounded-full bg-white/[0.06]" />
            <span className="block h-3 w-5/6 rounded-full bg-white/[0.06]" />
          </div>
        </div>

        <div
          ref={hRef}
          aria-hidden="true"
          className="pointer-events-none absolute opacity-100 max-[859px]:static max-[859px]:mb-8 motion-reduce:static motion-reduce:mb-8"
          style={{ transformStyle: "preserve-3d" }}
        >
          <svg viewBox="0 0 200 200" className="dimensional-h-mark drop-shadow-[0_0_60px_rgba(168,85,247,0.35)]">
            <defs>
              <linearGradient id={`${gradientId}-fill`} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#241a3d" />
                <stop offset="55%" stopColor="#3d2461" />
                <stop offset="100%" stopColor="#5a2a6b" />
              </linearGradient>
              <linearGradient id={`${gradientId}-edge`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-indigo)" />
                <stop offset="55%" stopColor="var(--color-brand-purple)" />
                <stop offset="100%" stopColor="var(--color-brand-pink)" />
              </linearGradient>
            </defs>
            <rect x="30" y="65" width="35" height="105" rx="17" fill={`url(#${gradientId}-fill)`} stroke={`url(#${gradientId}-edge)`} strokeWidth="1.5" />
            <rect x="135" y="25" width="35" height="145" rx="17" fill={`url(#${gradientId}-fill)`} stroke={`url(#${gradientId}-edge)`} strokeWidth="1.5" />
            <polygon points="65,95 135,60 135,90 65,125" fill={`url(#${gradientId}-fill)`} stroke={`url(#${gradientId}-edge)`} strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>

        <div ref={copyRef} className="relative z-10 mx-auto max-w-xl px-6 text-center opacity-100">
          <h1 className="font-display text-hero font-bold tracking-tight text-white">
            AI drafts.
            <br />
            <span className="text-brand-gradient text-brand-gradient-glow">Human impact.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-white/70">
            Humanora transforms AI text into natural, human writing that sounds like you.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/dashboard/humanize" variant="primary" size="lg">
              Humanize Text Now
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="#showcase" variant="secondary" size="lg">
              <PlayIcon className="h-4 w-4" />
              See It In Action
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 12h16m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9v6l5-3-5-3Z" fill="currentColor" />
    </svg>
  );
}
