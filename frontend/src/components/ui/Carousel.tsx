"use client";

import { Children, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

export interface CarouselProps {
  /** Accessible name for the carousel region. */
  label: string;
  children: ReactNode;
  /** Width classes for each slide, e.g. "w-full" or "w-[85%] lg:w-1/3". */
  slideClassName?: string;
  /** Classes for the scrolling track — set the gap here. */
  trackClassName?: string;
  className?: string;
  /** Milliseconds between automatic advances. Omit for no autoplay. */
  autoplay?: number;
  /** Dots suit one slide per view; a progress rule suits several. */
  indicator?: "dots" | "progress";
  /** Extra content placed at the start of the controls row. */
  controlsLead?: ReactNode;
}

/**
 * A scroll-snap carousel: native scrolling (touch, trackpad, shift-wheel
 * and arrow keys all work), with previous/next buttons and dots or a
 * progress rule. Optional autoplay stops while the carousel is hovered
 * or focused, can be paused with its own button, and never runs for
 * reduced-motion readers.
 */
export function Carousel({
  label,
  children,
  slideClassName = "w-full",
  trackClassName = "gap-4",
  className,
  autoplay,
  indicator = "dots",
  controlsLead,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const reducedMotion = useReducedMotion();

  const slideEls = useCallback(
    () => Array.from(trackRef.current?.children ?? []) as HTMLElement[],
    []
  );

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const els = slideEls();
    if (els.length === 0) return;
    const max = track.scrollWidth - track.clientWidth;
    const left = track.scrollLeft;
    const end = left >= max - 2;
    setAtStart(left <= 2);
    setAtEnd(end);
    setProgress(max > 0 ? Math.min(1, left / max) : 1);

    const origin = els[0].offsetLeft;
    let best = 0;
    let bestDistance = Infinity;
    els.forEach((el, i) => {
      const distance = Math.abs(el.offsetLeft - origin - left);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    setActive(end && max > 0 ? els.length - 1 : best);
  }, [slideEls]);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const els = slideEls();
      if (!track || els.length === 0) return;
      const target = els[Math.max(0, Math.min(index, els.length - 1))];
      track.scrollTo({ left: target.offsetLeft - els[0].offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [slideEls, reducedMotion]
  );

  // Re-measure whenever the track resizes (this also takes the first
  // measurement, once the slides are laid out).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  const autoplaying = Boolean(autoplay) && !reducedMotion && !userPaused && count > 1;

  useEffect(() => {
    if (!autoplaying || engaged) return;
    const id = window.setTimeout(() => goTo(atEnd ? 0 : active + 1), autoplay);
    return () => window.clearTimeout(id);
  }, [autoplaying, engaged, active, atEnd, autoplay, goTo]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEngaged(false);
      }}
    >
      <div
        ref={trackRef}
        onScroll={measure}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-live={autoplaying && !engaged ? "off" : "polite"}
        // `relative` so absolutely positioned descendants (e.g. sr-only
        // labels) are clipped by the track instead of widening the page.
        className={cn("carousel-track focus-ring relative flex snap-x snap-mandatory overflow-x-auto rounded-lg", trackClassName)}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className={cn("shrink-0 snap-start", slideClassName)}
          >
            {slide}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-5 flex items-center gap-4">
          {controlsLead}
          {indicator === "dots" ? (
            <div className="-mx-1 flex items-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === active ? "true" : undefined}
                  className="focus-ring group grid h-6 min-w-6 place-items-center rounded-sm"
                >
                  <span
                    className={cn(
                      "block h-1 rounded-full transition-all duration-300",
                      i === active ? "w-6 bg-brand-purple" : "w-2.5 bg-border-strong group-hover:bg-foreground-subtle"
                    )}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="h-0.5 flex-1 rounded-full bg-border" aria-hidden="true">
              <div
                className="carousel-progress h-0.5 rounded-full bg-brand-purple"
                style={{ transform: `scaleX(${Math.max(0.08, progress)})` }}
              />
            </div>
          )}

          <div className={cn("flex items-center gap-2", indicator === "dots" && "ml-auto")}>
            {autoplay && !reducedMotion && (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-border text-foreground-subtle transition-colors hover:border-border-strong hover:text-foreground"
              >
                {userPaused ? <PlayIcon className="h-3 w-3" /> : <PauseIcon className="h-3 w-3" />}
              </button>
            )}
            <ArrowButton direction="prev" disabled={atStart} onClick={() => goTo(active - 1)} />
            <ArrowButton direction="next" disabled={atEnd} onClick={() => goTo(active + 1)} />
          </div>
        </div>
      )}
    </section>
  );
}

function ArrowButton({ direction, disabled, onClick }: { direction: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
      className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:border-brand-purple hover:text-brand-purple disabled:pointer-events-none disabled:opacity-35"
    >
      <svg viewBox="0 0 16 16" fill="none" className={cn("h-3.5 w-3.5", direction === "prev" && "rotate-180")} aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <rect x="2" y="1.5" width="2.5" height="9" rx="0.75" fill="currentColor" />
      <rect x="7.5" y="1.5" width="2.5" height="9" rx="0.75" fill="currentColor" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path d="M3 1.8v8.4a.6.6 0 0 0 .9.5l6.6-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z" fill="currentColor" />
    </svg>
  );
}
