"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { writingModes } from "@/lib/config/modes";
import { cn } from "@/lib/cn";

/**
 * HUMANORA's writing-mode architecture, presented as a selectable filter
 * strip rather than a static list — selecting a mode just highlights its
 * description here (no output is generated; the real mode selector lives
 * in the Humanize product itself, see LiveDemo for a working preview).
 */
export function WritingModes() {
  const [active, setActive] = useState(0);

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

        <Reveal as="div" delay={100} className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-wrap justify-center gap-2">
            {writingModes.map((mode, i) => (
              <button
                key={mode.name}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className={cn(
                  "focus-ring press-feedback cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active === i
                    ? "border-transparent bg-brand-gradient text-white shadow-glow-sm"
                    : "border-border bg-surface text-foreground-muted hover:border-brand-purple/30 hover:text-foreground"
                )}
              >
                {mode.name}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-surface p-7 text-center sm:p-9">
            <p className="text-lg font-semibold text-foreground">{writingModes[active].name}</p>
            <p className="mt-2 text-base text-foreground-muted">
              {writingModes[active].description}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
