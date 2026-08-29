"use client";

import { useRef } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { usePinnedScene } from "@/lib/scrollScene";
import { SceneBackdrop } from "@/components/landing/cinematic/SceneBackdrop";

const CAPABILITY_NODES = [
  { label: "Write", href: "/dashboard/humanize", top: "22%", left: "24%" },
  { label: "My Voice", href: "/dashboard/voice", top: "20%", left: "76%" },
  { label: "Study", href: "/dashboard/study", top: "78%", left: "26%" },
  { label: "Library", href: "/dashboard/history", top: "80%", left: "74%" },
] as const;

// The real capability set from the product's own feature set — folded
// in here rather than repeated as a separate "Features" section
// further down the page.
const CAPABILITIES = [
  "Advanced Humanizer",
  "My Voice",
  "Preserve Meaning",
  "Academic Mode",
  "Multi-Language",
  "Writing Analysis",
];

const NAV_DOCK = ["Home", "Write", "Study", "My Voice", "Library"];

/**
 * Scene 6 — the visual climax. Everything the previous scenes showed
 * individually (Write, My Voice, Study, Library) is revealed together
 * around HUMANORA's own H, connected by the same navigation a real
 * signed-in user has (see AppShell's rail) — a deliberate camera
 * pull-back rather than a dashboard screenshot. The six real product
 * capabilities (previously a standalone "Features" section) surface
 * here as a supporting ring, since this is the moment that's actually
 * about "everything HUMANORA is," not a new topic.
 */
export function ConnectedWorkspaceScene() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const capsRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);

  usePinnedScene(trackRef, stageRef, (tl) => {
    tl.fromTo(
      groupRef.current!,
      { opacity: 0.35, scale: 1.25, filter: "blur(3px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", ease: "none", duration: 0.45 },
      0
    )
      .fromTo(labelRef.current!, { opacity: 0, y: -20 }, { opacity: 1, y: 0, ease: "none", duration: 0.16 }, 0.05)
      .fromTo(capsRef.current!, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.2 }, 0.5)
      .fromTo(dockRef.current!, { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "none", duration: 0.15 }, 0.55)
      // Hand off to ProductShowcase: the nav dock — already a row of
      // real destination pills, the same shape as ProductShowcase's
      // own mode-tab row — widens and rises to where that tab row
      // sits, while the H/capability constellation above it shrinks
      // and settles behind it. The dock becomes the tab bar; the
      // system it was floating in becomes the panel behind it.
      .to(groupRef.current!, { scale: 0.85, y: -40, opacity: 0.5, ease: "none", duration: 0.18 }, 0.76)
      .to(capsRef.current!, { opacity: 0, y: -10, ease: "none", duration: 0.16 }, 0.76)
      .to(dockRef.current!, { scale: 1.15, y: -30, ease: "none", duration: 0.18 }, 0.76);
    tl.set(groupRef.current!, { scale: 0.85, y: -40, opacity: 0.5 });
    tl.set(capsRef.current!, { opacity: 0, y: -10 });
    tl.set(dockRef.current!, { scale: 1.15, y: -30 });
  });

  return (
    <div ref={trackRef} className="cinematic-track" style={{ ["--pin-vh" as string]: "190vh" }}>
      <div ref={stageRef} className="cinematic-stage">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 45%, rgba(168,85,247,0.16) 0%, transparent 70%), radial-gradient(40% 40% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 65%)",
          }}
        />

        <SceneBackdrop word="HUMANORA" index="06 / WORKSPACE" align="left" tint="rgba(168,85,247,0.12)" />

        <div ref={labelRef} className="absolute top-10 left-1/2 z-10 -translate-x-1/2 px-6 text-center opacity-100">
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
            One workspace
          </span>
        </div>

        <div ref={groupRef} className="relative flex h-full w-full items-center justify-center opacity-100 max-[859px]:h-auto max-[859px]:flex-col max-[859px]:gap-8 max-[859px]:py-16 motion-reduce:h-auto motion-reduce:flex-col motion-reduce:gap-8 motion-reduce:py-16">
          <div className="pointer-events-none flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] shadow-glow-md max-[859px]:static motion-reduce:static">
            <LogoMark size="lg" />
          </div>

          <div className="absolute inset-0 max-[859px]:static max-[859px]:flex max-[859px]:flex-col max-[859px]:items-center max-[859px]:gap-4 motion-reduce:static motion-reduce:flex motion-reduce:flex-col motion-reduce:items-center motion-reduce:gap-4">
            {CAPABILITY_NODES.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="focus-ring hover-lift absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-sm transition-colors hover:border-white/30 max-[859px]:static max-[859px]:!translate-x-0 max-[859px]:!translate-y-0 motion-reduce:static motion-reduce:!translate-x-0 motion-reduce:!translate-y-0"
                style={{ top: n.top, left: n.left }}
              >
                {n.label}
              </a>
            ))}
          </div>
        </div>

        <div
          ref={capsRef}
          className="pointer-events-none absolute bottom-28 left-1/2 z-10 flex max-w-xl -translate-x-1/2 flex-wrap justify-center gap-2 px-6 opacity-100 max-[859px]:static max-[859px]:mt-8 max-[859px]:translate-x-0 motion-reduce:static motion-reduce:mt-8 motion-reduce:translate-x-0"
        >
          {CAPABILITIES.map((c) => (
            <span key={c} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/50">
              {c}
            </span>
          ))}
        </div>

        <div
          ref={dockRef}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-white/15 bg-white/[0.06] p-1.5 opacity-100 backdrop-blur-md max-[859px]:static max-[859px]:mt-6 max-[859px]:translate-x-0 max-[859px]:flex-wrap max-[859px]:justify-center motion-reduce:static motion-reduce:mt-6 motion-reduce:translate-x-0 motion-reduce:flex-wrap motion-reduce:justify-center"
        >
          {NAV_DOCK.map((item) => (
            <span key={item} className="rounded-full px-3.5 py-1.5 text-xs font-medium text-white/70">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
