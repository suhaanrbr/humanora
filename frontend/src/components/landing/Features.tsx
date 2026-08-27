"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const capabilities = [
  {
    title: "Advanced Humanizer",
    description: "Rewrite stiff AI-assisted drafts into more natural language — the transformation you just saw above, running on every mode and strength HUMANORA offers.",
    icon: WandIcon,
  },
  {
    title: "My Voice",
    description: "Adapt rewriting toward your own writing preferences and style, learned from samples you provide.",
    icon: FingerprintIcon,
  },
  {
    title: "Preserve Meaning",
    description: "Protect important facts, terminology, quotations, and citations while the language around them changes.",
    icon: ShieldIcon,
  },
  {
    title: "Academic Mode",
    description: "Improve clarity and tone for academic writing, with citations kept intact.",
    icon: CapIcon,
  },
  {
    title: "Multi-Language",
    description: "Built on an architecture designed to extend beyond English over time.",
    icon: GlobeIcon,
  },
  {
    title: "Writing Analysis",
    description: "Review characteristics of your writing, such as readability, tone, and structure.",
    icon: ChartIcon,
  },
];

/**
 * "Capability dock" — a single app-window chrome (matching the
 * ProductShowcase/LiveDemo browser-bar language) housing a horizontal
 * row of capability pills. Selecting one swaps a single detail panel,
 * rather than presenting six identical cards side by side — the same
 * interaction shape already established in WritingModes/ProductShowcase,
 * reused here instead of a generic feature grid.
 */
export function Features() {
  const [active, setActive] = useState(0);
  const Active = capabilities[active];

  return (
    <section id="features" className="section-tint-lavender section-glow-top py-16 sm:py-20">
      <Container>
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to write naturally
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            A focused toolkit for turning AI-assisted drafts into writing that
            sounds like you — without losing what matters.
          </p>
        </Reveal>

        <Reveal
          as="div"
          delay={100}
          className="pearl-glass mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl shadow-glow-sm"
        >
          <div className="flex items-center gap-2 border-b border-border bg-background-elevated px-5 py-3 sm:px-7">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="ml-3 text-xs text-foreground-subtle">HUMANORA — Capabilities</span>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 border-b border-border px-4 py-4 sm:px-7">
            {capabilities.map((cap, i) => (
              <button
                key={cap.title}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className={cn(
                  "focus-ring press-feedback flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  active === i
                    ? "border-transparent bg-brand-gradient text-white shadow-glow-sm"
                    : "border-border bg-surface text-foreground-muted hover:border-brand-purple/30 hover:text-foreground"
                )}
              >
                <cap.icon className="h-4 w-4 shrink-0" />
                {cap.title}
              </button>
            ))}
          </div>

          <div key={active} className="animate-fade-in-up flex items-start gap-4 p-7 sm:p-9">
            <div className="bg-brand-gradient inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white shadow-glow-sm">
              <Active.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{Active.title}</p>
              <p className="mt-1.5 text-base leading-relaxed text-foreground-muted">
                {Active.description}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

type IconProps = { className?: string };

function WandIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 20 15 9M17 3l1.2 2.6L21 7l-2.6 1.2L17 11l-1.2-2.8L13 7l2.8-1.4L17 3ZM6 13l.8 1.7L8.5 15l-1.7.8L6 17.5l-.8-1.7L3.5 15l1.7-.8L6 13Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FingerprintIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3a7 7 0 0 1 7 7v2a9 9 0 0 1-2 5.5M6.6 18A9 9 0 0 1 5 12v-2a7 7 0 0 1 1.2-3.9M9 21a11 11 0 0 0 1.5-5.6V11a1.5 1.5 0 1 1 3 0v1.2M12 17.5c1.7 0 3-1.3 3-3V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.4 3 7.7 7 10 4-2.3 7-5.6 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m12 4 9 4.5-9 4.5-9-4.5L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11M21 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.5 5.3 3.5 8.5s-1.3 6.2-3.5 8.5c-2.2-2.3-3.5-5.3-3.5-8.5S9.8 5.8 12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
