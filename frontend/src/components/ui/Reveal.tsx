"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in milliseconds, applied via inline transition-delay. */
  delay?: number;
  as?: keyof HTMLElementTagNameMap;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scroll-triggered entrance animation. Adds `.is-visible` (see globals.css
 * `.reveal`) once the element enters the viewport, via IntersectionObserver.
 *
 * Reduced-motion users skip the hidden state entirely — the element is
 * rendered visible from the initial render, so no observer runs for them.
 */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // Cast: `Tag` is a dynamic intrinsic element name, and TypeScript can't
  // narrow JSX.IntrinsicElements union props (ref types differ per tag)
  // to something assignable at this generality. Every caller passes plain
  // HTML tags (div/span/p), so this is safe in practice.
  const Component = Tag as unknown as "div";

  return (
    <Component
      ref={ref as RefObject<HTMLDivElement | null>}
      className={cn(!reducedMotion && "reveal", visible && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
