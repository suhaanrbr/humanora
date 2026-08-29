"use client";

import { useRef } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { usePinnedScene } from "@/lib/scrollScene";
import { SceneBackdrop } from "@/components/landing/cinematic/SceneBackdrop";

// Real content types Library actually aggregates (lib/db/recentWork.ts)
// — humanization + study_session rows. No fabricated "folders" or
// "projects" appear here as if they were the same always-on feature;
// real Projects exist in the product but aren't part of this claim.
const ITEMS = [
  { kind: "Humanized", title: "Quarterly update email", meta: "2 min read", color: "var(--color-brand-indigo)", startTop: "20%", startLeft: "18%" },
  { kind: "Studied", title: "Committee report — Summary", meta: "Summarize", color: "var(--color-brand-cyan)", startTop: "70%", startLeft: "22%" },
  { kind: "Studied", title: "Committee report — Notes", meta: "Study Notes", color: "var(--color-brand-cyan)", startTop: "30%", startLeft: "68%" },
  { kind: "Humanized", title: "Personal statement draft", meta: "1 min read", color: "var(--color-brand-indigo)", startTop: "76%", startLeft: "64%" },
];

/**
 * Scene 5: the outputs from the Humanize and Study scenes travel
 * inward and align into an ordered list — the same real content types
 * Library actually holds (humanization + study_session rows, see
 * lib/db/recentWork.ts), color-coded to match where each one came
 * from earlier in the page. No fabricated folders/projects — Library
 * itself has no folder concept today, so this scene doesn't invent one.
 */
export function LibraryScene() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  usePinnedScene(trackRef, stageRef, (tl, gsap) => {
    const label = labelRef.current!;
    const list = listRef.current!;

    tl.fromTo(label, { opacity: 0, y: -20 }, { opacity: 1, y: 0, ease: "none", duration: 0.14 }, 0);

    itemRefs.current.forEach((item, i) => {
      if (!item) return;
      gsap.set(item, { "--tx": "0px", "--ty": "0px" });
      tl.fromTo(
        item,
        { opacity: 0.55, scale: 0.9, "--tx": "0px", "--ty": "0px" },
        { opacity: 0, scale: 0.7, "--tx": "0px", "--ty": "0px", ease: "none", duration: 0.02 },
        0.55 + i * 0.02
      );
    });

    tl.fromTo(list, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "none", duration: 0.18 }, 0.58);

    // Hand off to Connected Workspace: the resolved list itself
    // shrinks and rises toward center — the same object becoming the
    // thing ConnectedWorkspaceScene opens on (its H sits centered,
    // slightly smaller than a full list) — folding the archive into
    // the wider system rather than just leaving it on screen. Starts
    // only once the entrance tween above (ends 0.76) has actually
    // finished — an earlier version had these two overlapping, both
    // fighting over the list's own `y`, and it never visually settled.
    tl.to(list, { scale: 0.45, y: -140, rotateX: 12, ease: "none", duration: 0.2 }, 0.76);
    // Same guaranteed-final-state guard as MyVoiceScene — belt and
    // suspenders against any timeline-length drift shifting where
    // "0.76-0.96" actually lands in real scroll terms.
    tl.set(list, { scale: 0.45, y: -140 });
  });

  return (
    <div ref={trackRef} className="cinematic-track" style={{ ["--pin-vh" as string]: "180vh" }}>
      <div ref={stageRef} className="cinematic-stage">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 55% at 40% 50%, rgba(59,130,246,0.1) 0%, transparent 65%)" }}
        />

        <SceneBackdrop word="LIBRARY" index="05 / LIBRARY" align="right" tint="rgba(59,130,246,0.13)" />

        <div ref={labelRef} className="absolute top-10 left-1/2 z-10 -translate-x-1/2 px-6 text-center opacity-100">
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
            Library
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your work stays connected.</h2>
        </div>

        {/* Scattered echoes of earlier scenes' outputs — fade as the
            ordered list resolves (desktop/cinematic only). */}
        <div className="absolute inset-0 max-[859px]:hidden motion-reduce:hidden">
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="absolute w-[220px] rounded-lg border px-3.5 py-2.5 text-xs opacity-55"
              style={{
                top: item.startTop,
                left: item.startLeft,
                borderColor: `color-mix(in srgb, ${item.color} 35%, transparent)`,
                background: `color-mix(in srgb, ${item.color} 10%, transparent)`,
                color: "rgba(255,255,255,0.75)",
                ["--tx" as string]: "0px",
                ["--ty" as string]: "0px",
                transform: "translate(var(--tx), var(--ty))",
              }}
            >
              {item.title}
            </div>
          ))}
        </div>

        {/* Resolved Library list — the settled end state. */}
        <div
          ref={listRef}
          className="pearl-glass relative z-10 mt-16 w-full max-w-lg divide-y divide-white/[0.06] rounded-2xl p-2 opacity-100 shadow-glow-sm"
        >
          {ITEMS.map((item) => (
            <div key={item.title} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white/90">{item.title}</p>
                <p className="mt-0.5 text-xs text-white/45">
                  {item.kind} · {item.meta}
                </p>
              </div>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
            </div>
          ))}
          <div className="px-4 py-4">
            <ButtonLink href="/dashboard/history" variant="secondary" size="sm" className="w-full">
              Open your Library
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
