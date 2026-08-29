"use client";

import { useEffect, type RefObject } from "react";
import { getGsap } from "@/lib/gsap";

type Gsap = ReturnType<typeof getGsap>["gsap"];
type Timeline = ReturnType<Gsap["timeline"]>;

/**
 * Shared engine behind every pinned cinematic scene on the landing page
 * (DimensionalH, HumanizeScene, WorkspaceExpansionScene, MyVoiceScene,
 * StudyScene, LibraryScene, ConnectedWorkspaceScene). Centralizing this
 * means every scene shares one definition of "does this viewer get the
 * cinematic treatment" and one cleanup path — a scene component just
 * describes its own timeline.
 *
 * - `track` is the tall scroll runway (sized by the `.cinematic-track`
 *   CSS custom property `--pin-vh`, not inline JS style — see globals.css
 *   — so there's no flash of extra height before this effect runs).
 * - `stage` is the viewport-height element GSAP pins for the scrub.
 * - `build(tl, gsap)` adds tweens to a 0→1 scrubbed timeline. Every
 *   scene's JSX must already render its *settled end state* by default
 *   (matching what `.cinematic-track`/`.cinematic-stage`'s reduced-
 *   motion and small-viewport CSS branches fall back to) — `build`'s
 *   `fromTo` calls are what pull elements OUT of that end state for the
 *   users who do get the scrub, not the other way around.
 *
 * Bails out (no ScrollTrigger, no pin, nothing torn down that needs
 * cleanup) for `prefers-reduced-motion: reduce` and for viewports too
 * small/short to pin comfortably — those viewers see each scene's
 * static end-state markup in ordinary document flow, matching the CSS
 * fallback exactly, never a half-animated frame.
 */
export function usePinnedScene(
  trackRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  build: (tl: Timeline, gsap: Gsap) => void,
  options?: { scrub?: number; minWidth?: number; minHeight?: number }
) {
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const { minWidth = 860, minHeight = 480, scrub = 0.6 } = options ?? {};
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canPin =
      !reduceMotion &&
      window.matchMedia(`(min-width: ${minWidth}px) and (min-height: ${minHeight}px)`).matches;

    if (!canPin) return;

    const { gsap, ScrollTrigger } = getGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub,
          pin: stage,
          anticipatePin: 1,
        },
      });
      build(tl, gsap);
    }, track);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.trigger === track && st.kill());
    };
    // build/options are stable literals defined inline at each call site,
    // not reactive state; re-running this effect on every render would
    // tear down and rebuild the ScrollTrigger pin constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
