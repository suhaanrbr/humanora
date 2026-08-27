"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { writingModes } from "@/lib/config/modes";
import { cn } from "@/lib/cn";

/**
 * HUMANORA's writing-mode architecture, presented as a floating toolbar
 * sitting above a document fragment — a mode reads like it's controlling
 * a real document, not selecting an item from a marketing list. Picking a
 * mode swaps a corner tag and a short line of mode-appropriate sample text
 * (no output is generated; the working mode selector lives in the
 * Humanize product itself — see ProductShowcase for that interaction).
 */
export function WritingModes() {
  const [active, setActive] = useState(0);
  const mode = writingModes[active];

  return (
    <section id="writing-modes" className="section-glow-top py-16 sm:py-20">
      <Container>
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Six ways to sound like yourself
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            Every rewrite starts with a mode — pick the one that matches
            what you&apos;re writing.
          </p>
        </Reveal>

        <Reveal as="div" delay={100} className="relative mx-auto mt-16 max-w-3xl sm:mt-14">
          {/* Floating toolbar — sits half-outside the document card it
              controls, the same "floating window" language as the hero,
              scaled down into a functional-looking control strip. */}
          <div className="pearl-glass absolute -top-16 left-1/2 z-10 flex w-[calc(100%-1.5rem)] -translate-x-1/2 flex-wrap justify-center gap-1.5 rounded-2xl p-1.5 shadow-glow-sm sm:-top-7 sm:w-auto sm:rounded-full">
            {writingModes.map((m, i) => (
              <button
                key={m.name}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className={cn(
                  "focus-ring press-feedback cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active === i
                    ? "border-transparent bg-brand-gradient text-white shadow-glow-sm"
                    : "border-transparent text-foreground-muted hover:text-foreground"
                )}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div key={active} className="animate-fade-in-up rounded-xl border border-border bg-surface pt-24 pb-9 text-center shadow-glow-sm sm:pt-14">
            <p className="mx-auto -mt-1 mb-2 w-fit rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {mode.name} mode
            </p>
            <p className="mx-auto mt-3 max-w-md px-6 text-base text-foreground-muted">
              {mode.description}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
