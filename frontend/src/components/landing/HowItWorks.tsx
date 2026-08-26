"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

const STEP_DELAY_MS = 450;

/**
 * Three-stage visual workflow. When the section enters the viewport, the
 * stages activate in sequence (01 → line → 02 → line → 03), completing in
 * roughly 1–1.3s. Reduced-motion users see all three active immediately.
 */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [activeStep, setActiveStep] = useState(() => (prefersReducedMotion() ? 3 : 0));

  useEffect(() => {
    if (reducedMotion) return;

    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setActiveStep(1);
        window.setTimeout(() => setActiveStep(2), STEP_DELAY_MS);
        window.setTimeout(() => setActiveStep(3), STEP_DELAY_MS * 2);
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="section-tint-cool section-glow-top py-16 sm:py-20"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How HUMANORA works
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            Three simple steps from draft to a natural, human-sounding result.
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-5xl">
          <div
            aria-hidden="true"
            className="absolute left-[16.5%] right-[16.5%] top-6 hidden h-px overflow-hidden bg-border lg:block"
          >
            <div
              className="h-full bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-indigo transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(0, (activeStep - 1)) * 50}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-6">
            <Stage
              number="01"
              title="Add your draft"
              description="Paste your text or upload a document — including AI-assisted drafts you want to sound more natural."
              active={activeStep >= 1}
            >
              <MiniEditor />
            </Stage>
            <Stage
              number="02"
              title="Choose your style"
              description="Pick a mode like Academic or Professional, set a rewriting strength, and optionally apply your My Voice profile."
              active={activeStep >= 2}
            >
              <MiniControls />
            </Stage>
            <Stage
              number="03"
              title="Get your HUMANORA result"
              description="Compare original and rewritten text side by side, with a check for preserved meaning and facts."
              active={activeStep >= 3}
            >
              <MiniComparison />
            </Stage>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stage({
  number,
  title,
  description,
  active,
  children,
}: {
  number: string;
  title: string;
  description: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center text-center transition-[opacity,transform] duration-500 ease-out lg:items-start lg:text-left",
        active ? "opacity-100" : "opacity-40 motion-safe:translate-y-2"
      )}
    >
      <div
        className={cn(
          "bg-brand-gradient relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white transition-shadow duration-500",
          active ? "shadow-glow-md" : "shadow-none"
        )}
      >
        {number}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{description}</p>
      <div className="mt-6 w-full max-w-[300px]">{children}</div>
    </div>
  );
}

function MiniEditor() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col gap-2">
        <span className="block h-2 w-full rounded-full bg-line" />
        <span className="block h-2 w-5/6 rounded-full bg-line" />
        <span className="block h-2 w-full rounded-full bg-line" />
        <span className="block h-2 w-2/3 rounded-full bg-line" />
      </div>
    </div>
  );
}

function MiniControls() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 text-left">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground-subtle">Mode</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-foreground">Academic</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground-subtle">Strength</span>
        <div className="h-1.5 flex-1 rounded-full border border-border">
          <div className="bg-brand-gradient h-full w-2/3 rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground-subtle">My Voice</span>
        <span className="relative inline-flex h-4 w-7 items-center rounded-full bg-brand-gradient">
          <span className="ml-3.5 h-3 w-3 rounded-full bg-white" />
        </span>
      </div>
    </div>
  );
}

function MiniComparison() {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-col gap-2">
        <span className="block h-2 w-full rounded-full bg-line" />
        <span className="block h-2 w-4/5 rounded-full bg-line" />
        <span className="block h-2 w-full rounded-full bg-line" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="bg-brand-gradient block h-2 w-full rounded-full opacity-70" />
        <span className="bg-brand-gradient block h-2 w-4/5 rounded-full opacity-70" />
        <span className="bg-brand-gradient block h-2 w-full rounded-full opacity-70" />
      </div>
    </div>
  );
}
