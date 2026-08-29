"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * GSAP + ScrollTrigger, registered exactly once regardless of how many
 * cinematic components mount/unmount. Not a React hook (no "use" rules
 * apply) despite the historical GSAP-ecosystem naming convention — it's
 * a plain accessor safe to call from inside effects/callbacks. (React strict-mode double-invokes
 * effects in dev; registering twice is harmless but pointless). Both
 * are 100% free — GSAP's entire plugin set, ScrollTrigger included,
 * became license-free for all use in 2025 (previously "Club GreenSock"
 * gated), so this carries no recurring cost.
 */
export function getGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}
