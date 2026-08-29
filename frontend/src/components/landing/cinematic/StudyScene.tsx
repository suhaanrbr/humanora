"use client";

import { useRef } from "react";
import { usePinnedScene } from "@/lib/scrollScene";
import { SceneBackdrop } from "@/components/landing/cinematic/SceneBackdrop";

const SOURCE_LINES = [
  "The committee reviewed quarterly performance across all regional offices.",
  "Revenue grew steadily, though customer retention lagged behind targets.",
  "Three structural changes were proposed to address the retention gap.",
];

const MODES = [
  {
    key: "summarize",
    label: "Summarize",
    body: "Revenue grew, but retention lagged — three structural changes were proposed to close the gap.",
  },
  {
    key: "explain",
    label: "Explain",
    body: "In plain terms: the business made more money, but kept fewer customers than hoped. Leadership responded with three specific changes meant to fix that second problem.",
  },
  {
    key: "notes",
    label: "Study Notes",
    bullets: ["Revenue: grew steadily", "Retention: below target", "Response: 3 structural changes proposed"],
  },
] as const;

/**
 * Scene 4: one real document, physically reorganizing into HUMANORA's
 * three actual Study modes — Summarize, Explain, Study Notes — instead
 * of three separate feature cards. Desktop/cinematic viewers get a
 * single document crossfading through all three states as they scroll;
 * mobile/reduced-motion/no-JS viewers get the same three real states
 * stacked as an ordinary, fully-legible comparison — never hidden
 * behind an animation that has to run for the content to be readable.
 */
export function StudyScene() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const sourceRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const docCardRef = useRef<HTMLDivElement | null>(null);

  usePinnedScene(trackRef, stageRef, (tl) => {
    const label = labelRef.current!;
    const source = sourceRef.current!;
    const docCard = docCardRef.current!;

    tl.fromTo(label, { opacity: 0, y: -20 }, { opacity: 1, y: 0, ease: "none", duration: 0.12 }, 0)
      .fromTo(source, { opacity: 1, y: 0 }, { opacity: 0, y: -30, ease: "none", duration: 0.18 }, 0.1);

    const starts = [0.28, 0.52, 0.76];
    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      // Only the active mode's panel is visible at a time — each one
      // fades in at its start beat and fades out as the next begins.
      tl.fromTo(panel, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.16 }, starts[i]);
      if (i < starts.length - 1) {
        tl.to(panel, { opacity: 0, ease: "none", duration: 0.16 }, starts[i + 1]);
      }
      const tab = tabRefs.current[i];
      if (tab) tl.to(tab, { opacity: 1, ease: "none", duration: 0.1 }, starts[i]);
    });

    // Hand off to Library: the same document card that just held
    // Summarize/Explain/Notes shrinks and slides down-right, toward
    // where Library's own archive resolves below — the finished
    // study material physically travelling into storage, not a cut
    // to a new card with the old one simply gone.
    tl.to(docCard, { scale: 0.4, xPercent: 55, yPercent: 70, borderRadius: "14px", ease: "none", duration: 0.16 }, 0.8);
    tl.set(docCard, { scale: 0.4, xPercent: 55, yPercent: 70 });
  });

  return (
    <div ref={trackRef} className="cinematic-track" style={{ ["--pin-vh" as string]: "200vh" }}>
      <div ref={stageRef} className="cinematic-stage">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 55% at 65% 40%, rgba(34,211,238,0.12) 0%, transparent 65%)" }}
        />

        <SceneBackdrop word="STUDY" index="04 / STUDY" align="left" tint="rgba(34,211,238,0.15)" />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6">
          <div ref={labelRef} className="mb-8 text-center opacity-100">
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
              Study
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              One source. Three ways to learn it.
            </h2>
          </div>

          {/* Mode tabs — highlight tracks whichever panel is active. */}
          <div className="mb-4 flex gap-2 opacity-100 max-[859px]:hidden">
            {MODES.map((m, i) => (
              <span
                key={m.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                className="rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-sm font-medium text-white/40 opacity-40 transition-colors"
              >
                {m.label}
              </span>
            ))}
          </div>

          <div ref={docCardRef} className="pearl-glass relative w-full min-h-[220px] rounded-2xl p-7 shadow-glow-md sm:p-9">
            {/* Source document — fades out once the scene begins
                reorganizing it (desktop/cinematic only). */}
            <div ref={sourceRef} className="opacity-100 max-[859px]:hidden">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-white/50">Source</p>
              <div className="flex flex-col gap-2.5">
                {SOURCE_LINES.map((line) => (
                  <p key={line} className="text-base text-white/70">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* The three real Study modes — absolutely stacked and
                crossfaded on desktop/cinematic; a plain static stack
                (all three always visible, fully readable) on mobile,
                reduced-motion, or no-JS. */}
            <div className="relative flex flex-col gap-8 min-[860px]:min-h-[200px] max-[859px]:static max-[859px]:mt-0 motion-reduce:static max-[859px]:flex motion-reduce:flex motion-reduce:flex-col motion-reduce:gap-8">
              {MODES.map((mode, i) => (
                <div
                  key={mode.key}
                  ref={(el) => {
                    panelRefs.current[i] = el;
                  }}
                  className="opacity-0 max-[859px]:static max-[859px]:opacity-100 motion-reduce:static motion-reduce:opacity-100 min-[860px]:absolute min-[860px]:inset-0"
                >
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-cyan">{mode.label}</p>
                  {"body" in mode ? (
                    <p className="text-base leading-relaxed text-white/85">{mode.body}</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {mode.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-base text-white/85">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-cyan" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
