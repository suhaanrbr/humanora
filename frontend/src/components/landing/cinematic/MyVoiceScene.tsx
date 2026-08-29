"use client";

import { useRef } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { usePinnedScene } from "@/lib/scrollScene";
import { TRAIT_META, VOICE_TRAITS } from "@/lib/ai/voiceAnalysis";
import { SceneBackdrop } from "@/components/landing/cinematic/SceneBackdrop";

// Illustrative example values only, exactly the same honesty rule the
// old MyVoicePreview card followed — every trait NAME is real (the
// same 8 fields lib/ai/voiceAnalysis.ts actually produces from a
// user's own samples), the VALUES shown here are staged for
// demonstration, never live account data.
const EXAMPLE_VALUES: Record<(typeof VOICE_TRAITS)[number], string> = {
  vocabularyLevel: "moderate",
  sentenceLength: "varied",
  formality: "neutral",
  directness: "balanced",
  punctuationStyle: "standard",
  transitionStyle: "moderate",
  conversationalTone: "conversational",
  rhythmVariation: "varied",
};

const FRAGMENTS = [
  { text: "“Honestly, I think this makes sense.”", top: "16%", left: "10%", rotate: -8 },
  { text: "“It should genuinely help us move faster.”", top: "70%", left: "14%", rotate: 6 },
  { text: "“Without cutting corners, though.”", top: "24%", left: "62%", rotate: 5 },
  { text: "“That's just how I'd put it.”", top: "78%", left: "58%", rotate: -5 },
];

// Ring positions for the 8 trait chips, computed once — a fingerprint-
// like arrangement around the resolved profile card rather than a
// generic vertical list.
const RING_POSITIONS = VOICE_TRAITS.map((_, i) => {
  const angle = (i / VOICE_TRAITS.length) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.round(Math.cos(angle) * 150), y: Math.round(Math.sin(angle) * 130) };
});

/**
 * Scene 3: HUMANORA's real differentiator, built as a genuine
 * transformation rather than a static preview card. Real-sounding
 * writing fragments (illustrative, not a live account) start
 * scattered across the stage; as they converge and fade, the 8 real
 * trait fields HUMANORA's My Voice actually analyzes resolve into a
 * fingerprint-like ring around a center profile card — never a
 * fabricated chart or invented metric, and every value shown is
 * clearly badged "Example."
 *
 * Each trait chip is three nested elements deep on purpose: an outer
 * anchor pinned to the card's center point, a middle element holding
 * the static `translate(-50%, -50%)` centering, and only the innermost
 * element is a GSAP target (animating opacity/scale/x/y). GSAP's x/y
 * tweening writes the whole `transform` property, so it can only ever
 * safely own an element whose transform ISN'T also doing centering
 * math — split across two elements, neither fights the other.
 */
export function MyVoiceScene() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const fragmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const traitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement | null>(null);

  usePinnedScene(trackRef, stageRef, (tl) => {
    const label = labelRef.current!;
    const center = centerRef.current!;
    const footer = footerRef.current!;

    tl.fromTo(label, { opacity: 0, y: -20 }, { opacity: 1, y: 0, ease: "none", duration: 0.14 }, 0);

    fragmentRefs.current.forEach((frag, i) => {
      if (!frag) return;
      tl.to(frag, { opacity: 0, scale: 0.6, ease: "none", duration: 0.3 }, 0.15 + i * 0.04);
    });

    tl.fromTo(center, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, ease: "none", duration: 0.2 }, 0.35);

    // Pop in AT the ring position, not fly there FROM the center — the
    // previous version traveled every chip in a straight line from
    // dead-center out to its ring spot, meaning for most of that
    // journey it was passing directly over the quote text, illegible,
    // overlapping (an actual scroll-through caught this: two chips
    // stacked squarely on top of the sentence mid-transition). Chips
    // are already positioned; opacity/scale is the only motion left.
    traitRefs.current.forEach((trait, i) => {
      if (!trait) return;
      const pos = RING_POSITIONS[i];
      tl.fromTo(
        trait,
        { opacity: 0, scale: 0.4, x: pos.x, y: pos.y },
        { opacity: 1, scale: 1, x: pos.x, y: pos.y, ease: "none", duration: 0.18 },
        0.42 + i * 0.032
      );
    });

    // Hand off to Study: the round profile card is the object that
    // carries forward — its corners square off (circle → document),
    // it shrinks and slides toward the upper-left quadrant (where
    // StudyScene's own source document sits by default), and the
    // trait ring collapses inward with it, as if the fingerprint has
    // folded itself into a single page. Not a fade to a new element —
    // the same DOM node changing shape and place.
    // Staggered slightly and finishing well before progress 1 (not
    // right up against it) — a same-time collapse landing exactly at
    // the pin's last frame risked a couple of chips still mid-flight
    // (spotted in an actual scroll check), which read as debris
    // rather than a clean fold.
    traitRefs.current.forEach((trait, i) => {
      if (!trait) return;
      tl.to(trait, { x: 0, y: 0, scale: 0, ease: "none", duration: 0.12 }, 0.74 + i * 0.012);
    });
    tl.to(
      center,
      { borderRadius: "20px", scale: 0.6, xPercent: -55, yPercent: -70, ease: "none", duration: 0.18 },
      0.76
    ).to(footer, { opacity: 0, y: 20, ease: "none", duration: 0.14 }, 0.76);

    // Guaranteed final state, regardless of exactly where the tweens
    // above land — the entrance tweens above (built per-trait with
    // staggered durations) push this timeline's real total length past
    // "1", which quietly shifts every absolute position number by the
    // same ratio; a scroll check caught the result: half the trait
    // chips never actually reached scale 0. This forces the true end
    // state at the timeline's own last instant, independent of that.
    tl.set(traitRefs.current.filter((t): t is HTMLDivElement => !!t), { scale: 0 });
    tl.set(footer, { opacity: 0 });
  });

  return (
    <div id="my-voice" ref={trackRef} className="cinematic-track" style={{ ["--pin-vh" as string]: "200vh" }}>
      <div ref={stageRef} className="cinematic-stage">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 55% at 30% 60%, rgba(217,70,239,0.14) 0%, transparent 65%)" }}
        />

        <SceneBackdrop word="VOICE" index="03 / VOICE" align="right" tint="rgba(217,70,239,0.16)" />

        <div ref={labelRef} className="absolute top-10 left-10 z-10 max-w-xs opacity-100 max-[859px]:static max-[859px]:mb-8 max-[859px]:max-w-none max-[859px]:px-6 max-[859px]:text-center motion-reduce:static motion-reduce:mb-8 motion-reduce:max-w-none motion-reduce:px-6 motion-reduce:text-center">
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
            My Voice
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Write like you.</h2>
        </div>

        {/* Scattered writing fragments — converge and fade as the
            resolved fingerprint takes over. */}
        <div className="absolute inset-0 max-[859px]:hidden motion-reduce:hidden">
          {FRAGMENTS.map((f, i) => (
            <div
              key={f.text}
              ref={(el) => {
                fragmentRefs.current[i] = el;
              }}
              className="absolute max-w-[240px] rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm italic text-white/50 opacity-0"
              style={{ top: f.top, left: f.left, transform: `rotate(${f.rotate}deg)` }}
            >
              {f.text}
            </div>
          ))}
        </div>

        {/* Resolved voice fingerprint — center summary + trait ring.
            This is the default/settled state for no-JS/reduced-motion/
            mobile viewers; the timeline above only animates viewers
            with the pin into it from the scattered state. */}
        <div className="relative z-10 flex flex-col items-center px-6">
          <div
            ref={centerRef}
            className="pearl-glass relative flex h-[260px] w-[260px] flex-col items-center justify-center rounded-full p-9 text-center opacity-100 backdrop-blur-md max-[859px]:h-auto max-[859px]:w-full max-[859px]:max-w-md max-[859px]:rounded-2xl motion-reduce:h-auto motion-reduce:w-full motion-reduce:max-w-md motion-reduce:rounded-2xl"
            style={{ backgroundColor: "rgba(12,10,24,0.5)" }}
          >
            <span className="mb-2 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/60">
              Example
            </span>
            <p className="text-sm leading-relaxed text-white/85">
              &ldquo;Honestly, I think this approach makes sense — it should genuinely help the team move
              faster without cutting corners.&rdquo;
            </p>

            {/* Ring positioning is desktop-only, enforced with `!` so it
                reliably loses to the mobile override regardless of
                Tailwind's generated rule order for arbitrary variants
                (a real bug: without `!important` here, the plain
                `.absolute`/`.left-1/2` utilities were sometimes winning
                the cascade even inside the max-859px media query,
                leaving all 8 trait chips stacked on top of each other
                and the quote — caught by an actual mobile screenshot). */}
            <div className="max-[859px]:mt-5 max-[859px]:flex max-[859px]:w-full max-[859px]:flex-wrap max-[859px]:justify-center max-[859px]:gap-2 motion-reduce:mt-5 motion-reduce:flex motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-2">
              {VOICE_TRAITS.map((trait, i) => (
                <div
                  key={trait}
                  className="absolute left-1/2 top-1/2 max-[859px]:!static max-[859px]:!left-auto max-[859px]:!top-auto motion-reduce:!static motion-reduce:!left-auto motion-reduce:!top-auto"
                >
                  <div className="-translate-x-1/2 -translate-y-1/2 max-[859px]:!translate-x-0 max-[859px]:!translate-y-0 motion-reduce:!translate-x-0 motion-reduce:!translate-y-0">
                    <div
                      ref={(el) => {
                        traitRefs.current[i] = el;
                      }}
                      className="rounded-full border border-brand-pink/30 bg-brand-pink/[0.12] px-2.5 py-1 text-[11px] whitespace-nowrap capitalize text-white/85 opacity-100 max-[859px]:inline-block motion-reduce:inline-block"
                    >
                      {TRAIT_META[trait].label}: {EXAMPLE_VALUES[trait]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={footerRef} className="opacity-100">
            <p className="mt-8 max-w-md text-center text-sm text-white/60">
              This describes writing style only — never used to verify identity. Every trait is one you
              can review and correct yourself.
            </p>
            <div className="mt-5 flex justify-center">
              <ButtonLink href="/signup" variant="secondary" size="sm">
                Build your real voice profile
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
