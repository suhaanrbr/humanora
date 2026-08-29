"use client";

import { useEffect, useId, useRef } from "react";
import { getGsap } from "@/lib/gsap";

/**
 * The one thing that makes the cinematic sequence read as a single
 * environment instead of seven sealed rooms: this mounts ONCE, fixed
 * behind every scene (`.cinematic-stage` is now transparent — see
 * globals.css), and owns:
 *
 *  - the single near-black base paint the whole sequence shares
 *    (previously every scene painted its own opaque background,
 *    which is the actual reason a "hand-off" between two scenes could
 *    never read as continuous — one scene's opaque wall covered
 *    whatever the next scene was trying to reveal behind it), and
 *  - one persistent H silhouette, driven by a SINGLE ScrollTrigger
 *    spanning the entire cinematic sequence (not one per scene), that
 *    slowly rotates/drifts/breathes the whole way from Arrival to
 *    ConnectedWorkspace. It never fully appears or disappears — it's
 *    the thread the eye can follow through every scene's own local
 *    lighting and content, the same way a room's architecture stays
 *    visible under different lighting as you walk through it.
 *
 * Deliberately still CSS/SVG + GSAP, not WebGL: one rotating/
 * translating SVG shape costs nothing meaningful on top of what the
 * scenes already do, and a real depth/lighting difference here would
 * need genuine 3D geometry lighting to justify the added engineering
 * and mobile GPU cost — a single flat shape doesn't clear that bar.
 * Free — GSAP/ScrollTrigger, already the project's stack.
 */
export function LandingCinematicEnvironment({ containerId }: { containerId: string }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hRef = useRef<HTMLDivElement | null>(null);
  const gradientId = useId();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const h = hRef.current;
    const container = document.getElementById(containerId);
    if (!wrapper || !h || !container) return;

    const { gsap, ScrollTrigger } = getGsap();

    // Reduced-motion: no thread animation, and — just as importantly —
    // no risk of this fixed layer ever being left visible past the
    // cinematic act with nothing to turn it off (the ScrollTrigger
    // below is what normally does that). Hide it outright and stop;
    // reduced-motion visitors get each scene's own static content
    // without the shared ambient layer, never a stray dark backdrop
    // bleeding into Pricing/Footer.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wrapper, { autoAlpha: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          // This layer is `position: fixed` (it has to be, to stay put
          // behind every pinned scene as the user scrolls through
          // them) — which means, left unchecked, it would just as
          // happily keep covering the ENTIRE rest of the page after
          // the cinematic act ends, painting Pricing/Trust/Footer's
          // real backgrounds over with this near-black layer (a real
          // bug I caught in Light theme: Pricing rendered on a solid
          // black void because nothing ever told this layer to stop).
          // `autoAlpha` (opacity+visibility) toggled exactly at the
          // container's own start/end keeps it strictly confined to
          // the cinematic act, never bleeding into ordinary sections.
          onLeave: () => gsap.set(wrapper, { autoAlpha: 0 }),
          onLeaveBack: () => gsap.set(wrapper, { autoAlpha: 0 }),
          onEnter: () => gsap.set(wrapper, { autoAlpha: 1 }),
          onEnterBack: () => gsap.set(wrapper, { autoAlpha: 1 }),
        },
      })
        .fromTo(h, { rotate: -8, xPercent: -6, yPercent: -10, opacity: 0.5 }, { rotate: 10, xPercent: 4, yPercent: 6, opacity: 0.85, ease: "none" }, 0)
        .to(h, { rotate: -4, xPercent: -2, yPercent: 12, opacity: 0.55, ease: "none" }, 0.55);
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.trigger === container && st.kill());
    };
  }, [containerId]);

  return (
    <div ref={wrapperRef} className="cinematic-world" aria-hidden="true">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 15%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(55% 45% at 85% 85%, rgba(217,70,239,0.05) 0%, transparent 60%)",
        }}
      />
      {/* Outer element owns static centering (a plain CSS transform);
          the inner ref is GSAP's exclusive target (rotate/xPercent/
          yPercent/opacity) — split across two elements so neither
          fights the other for the `transform` property, the same
          pattern used throughout the scene files. */}
      <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] max-h-[820px] max-w-[820px] -translate-x-1/2 -translate-y-1/2 max-[859px]:hidden">
        <div ref={hRef} className="h-full w-full opacity-70">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <defs>
              <linearGradient id={`${gradientId}-thread`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-indigo)" />
                <stop offset="50%" stopColor="var(--color-brand-purple)" />
                <stop offset="100%" stopColor="var(--color-brand-pink)" />
              </linearGradient>
            </defs>
            <rect x="30" y="65" width="35" height="105" rx="4" fill="none" stroke={`url(#${gradientId}-thread)`} strokeOpacity={0.14} strokeWidth="1" />
            <rect x="135" y="25" width="35" height="145" rx="4" fill="none" stroke={`url(#${gradientId}-thread)`} strokeOpacity={0.14} strokeWidth="1" />
            <polygon points="65,95 135,60 135,90 65,125" fill="none" stroke={`url(#${gradientId}-thread)`} strokeOpacity={0.14} strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
