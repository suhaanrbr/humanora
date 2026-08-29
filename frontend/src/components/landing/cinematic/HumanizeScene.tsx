"use client";

import { useRef } from "react";
import { usePinnedScene } from "@/lib/scrollScene";
import { writingModes } from "@/lib/config/modes";
import { SceneBackdrop } from "@/components/landing/cinematic/SceneBackdrop";
import { CornerFrame } from "@/components/landing/cinematic/CornerFrame";

const ORIGINAL_TEXT =
  "It should be noted that the implementation of the aforementioned strategy will likely result in a significant improvement to overall operational efficiency.";
const HUMANIZED_TEXT = "This approach should meaningfully improve how efficiently the team operates.";

/**
 * Scene 1 of the cinematic body: the actual writing transformation, as
 * a single floating document plane rather than a UI screenshot. The
 * stiff original sits as an overlay clipped away (left→right) to
 * reveal the humanized rewrite beneath it as the user scrolls — one
 * continuous editorial reveal, not a fake "AI thinking" percentage or
 * a typewriter gimmick. The real writing-mode names (lib/config/modes)
 * surface at the end as a row of labels — the seed WorkspaceExpansion-
 * Scene picks up and fans outward into HUMANORA's other capabilities.
 *
 * Default (no-JS / reduced-motion / small-viewport) markup already
 * shows the settled end state: humanized text fully revealed, mode
 * labels visible — GSAP only pulls it back into the "original, hidden"
 * start state for viewers who get the scrubbed scene.
 */
export function HumanizeScene() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const docRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const modesRef = useRef<HTMLDivElement | null>(null);

  usePinnedScene(trackRef, stageRef, (tl) => {
    const label = labelRef.current!;
    const doc = docRef.current!;
    const overlay = overlayRef.current!;
    const modes = modesRef.current!;

    tl.fromTo(label, { opacity: 0, y: -20 }, { opacity: 1, y: 0, ease: "none", duration: 0.14 }, 0)
      .fromTo(
        doc,
        { opacity: 0.3, scale: 0.88, y: 40, filter: "blur(4px)" },
        { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", ease: "none", duration: 0.3 },
        0
      )
      .fromTo(
        overlay,
        { clipPath: "inset(0 0% 0 0)" },
        { clipPath: "inset(0 100% 0 0)", ease: "none", duration: 0.45 },
        0.2
      )
      .fromTo(modes, { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "none", duration: 0.2 }, 0.72)
      .to(doc, { scale: 0.92, x: "-8%", opacity: 0.85, ease: "none", duration: 0.2 }, 0.78);
  });

  return (
    <div id="how-it-works" ref={trackRef} className="cinematic-track" style={{ ["--pin-vh" as string]: "190vh" }}>
      <div ref={stageRef} className="cinematic-stage">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 55% at 70% 25%, rgba(59,130,246,0.16) 0%, transparent 65%)" }}
        />

        <SceneBackdrop word="WRITE" index="01 / WRITE" align="left" tint="rgba(59,130,246,0.16)" />

        {/* Asymmetric frame: label upper-left, document plane offset
            right of center — deliberately not a centered stack, so the
            giant "WRITE" backdrop reads through the negative space on
            the left rather than sitting behind dead-center content. */}
        <div className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div ref={labelRef} className="opacity-100 lg:pr-6">
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
              Humanize
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              AI drafts.
              <br />
              <span className="text-brand-gradient">Human impact.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm text-white/55">
              The same rewrite HUMANORA runs on your own drafts — clarity, tone, and voice, not a
              detector score.
            </p>
          </div>

          <div className="lg:justify-self-end lg:pl-6">
            <div ref={docRef} className="pearl-glass relative w-full max-w-lg rounded-2xl p-7 shadow-glow-md opacity-100 sm:p-9">
              <CornerFrame color="rgba(59,130,246,0.55)" />
              <div className="mb-5 flex items-center justify-between border-b border-white/[0.07] pb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
                  Original <span className="text-brand-cyan">→</span> Humanized
                </p>
                <span className="font-mono text-[10px] tabular-nums text-white/30">§01</span>
              </div>
              <div className="relative text-lg leading-relaxed">
                <p className="text-white/90">{HUMANIZED_TEXT}</p>
                {/* An opaque wipe panel, not see-through text-on-text —
                    two different paragraphs sharing a baseline with only
                    color-opacity between them reads as illegible double-
                    exposure once real content replaces placeholder
                    lines. This slides away (clip-path) to reveal the
                    humanized text underneath, like lifting a printed
                    page off the one beneath it. */}
                <div
                  ref={overlayRef}
                  aria-hidden="true"
                  className="absolute inset-0 flex items-start bg-[#0c0e1a]"
                  style={{ clipPath: "inset(0 100% 0 0)" }}
                >
                  <p className="text-white/60">{ORIGINAL_TEXT}</p>
                </div>
              </div>
            </div>

            <div id="writing-modes" ref={modesRef} className="mt-6 flex flex-wrap gap-2 scroll-mt-24 opacity-100">
              {writingModes.slice(0, 4).map((mode) => (
                <span
                  key={mode.name}
                  className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-sm font-medium text-white/70"
                >
                  {mode.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
