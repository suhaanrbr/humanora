"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up from 0 on mount — restrained (600ms,
 * ease-out, runs once), not a constant/looping effect. `display` is the
 * exact final string to render (so "1,240" or "3.5 hrs" formatting is
 * untouched) — this only interpolates the leading numeric portion of it
 * for the animation, then snaps to the real `display` value at the end
 * so there's never a rounding mismatch with the real number.
 */
export function CountUp({ value, display }: { value: number; display: string }) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
  const ref = useRef<HTMLSpanElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect --
     Deliberate: this drives a requestAnimationFrame loop, an external
     browser API React has no hook for — there is no way to synchronize
     with rAF's per-frame callback other than setState inside it, the
     same class of exception as every other rAF-driven animation. */
  useEffect(() => {
    if (prefersReducedMotion() || value === 0) {
      setShown(value);
      return;
    }
    const duration = 600;
    const start = performance.now();
    let frame: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const finished = shown >= value;
  return (
    <span ref={ref} suppressHydrationWarning>
      {finished ? display : shown.toLocaleString()}
    </span>
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}
