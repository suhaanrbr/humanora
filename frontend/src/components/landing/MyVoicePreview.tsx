"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const traits = [
  { label: "Vocabulary", strength: "Strong" },
  { label: "Sentence Structure", strength: "Strong" },
  { label: "Tone & Style", strength: "Developing" },
  { label: "Writing Patterns", strength: "Strong" },
];

const samples = [
  { name: "Essay_Example.docx", words: "1,245 words" },
  { name: "Personal_Statement.pdf", words: "982 words" },
  { name: "Blog_Post_Sample.txt", words: "1,035 words" },
];

const voiceProfiles = ["Personal", "Academic", "Professional"];

const styleSliders = [
  { left: "Direct", right: "Expressive" },
  { left: "Casual", right: "Formal" },
  { left: "Simple", right: "Sophisticated" },
  { left: "Reserved", right: "Energetic" },
];

const COMPLETENESS = 78;
const RADIUS = 27;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * "My Voice" product preview. Illustrative mock UI, clearly labeled as a
 * demonstration. The completeness percentage is explicitly scoped to
 * profile completeness, never identity or authorship certainty. The ring
 * animates from 0 to its final value the first time it scrolls into view.
 */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function MyVoicePreview() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? COMPLETENESS : 0));

  useEffect(() => {
    if (reducedMotion) return;

    const node = ringRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay so the ring animates just after the card fades in.
          window.setTimeout(() => setProgress(COMPLETENESS), 150);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section id="my-voice" className="bg-ambient-glow-soft section-glow-top py-16 sm:py-20">
      <Container>
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <Badge variant="brand">My Voice</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Write like you.
            <br />
            Even when AI helped draft it.
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            Upload a few writing samples and HUMANORA builds a reusable voice
            profile — vocabulary, sentence structure, tone, and patterns.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {voiceProfiles.map((profile) => (
              <span
                key={profile}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground-muted"
              >
                {profile}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal
          as="div"
          delay={100}
          className="mx-auto mt-12 max-w-4xl"
        >
          <Card className="pearl-glass overflow-hidden shadow-glow-sm">
            <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-6 sm:p-8">
                <p className="mb-4 text-sm font-medium text-foreground">Your Writing Samples</p>
                <div className="flex flex-col gap-2.5">
                  {samples.map((sample) => (
                    <div
                      key={sample.name}
                      className="hover-lift flex items-center justify-between rounded-md border border-border bg-background-elevated px-3.5 py-2.5 hover:border-brand-purple/30 hover:shadow-glow-sm"
                    >
                      <span className="truncate text-sm text-foreground">{sample.name}</span>
                      <span className="shrink-0 text-xs text-foreground-subtle">{sample.words}</span>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="sm" className="mt-4 w-full">
                  + Add More Samples
                </Button>
              </div>

              <div className="p-6 sm:p-8">
                <p className="mb-4 text-sm font-medium text-foreground">Your Voice Profile</p>

                <div ref={ringRef} className="mb-5 flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                      <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="6" />
                      <circle
                        cx="32"
                        cy="32"
                        r={RADIUS}
                        fill="none"
                        stroke="url(#voice-gradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={CIRCUMFERENCE * (1 - progress / 100)}
                        style={{ transition: "stroke-dashoffset 1.1s ease-out" }}
                      />
                      <defs>
                        <linearGradient id="voice-gradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="var(--color-brand-indigo)" />
                          <stop offset="100%" stopColor="var(--color-brand-purple)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-sm font-semibold text-foreground">{progress}%</span>
                  </div>
                  <p className="text-xs text-foreground-muted">
                    Profile completeness — add another sample to strengthen it.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {traits.map((trait, i) => (
                    <Reveal key={trait.label} as="div" delay={200 + i * 90}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-foreground-muted">
                          <CheckIcon className="h-4 w-4 text-success" />
                          {trait.label}
                        </span>
                        <span className="text-foreground-subtle">{trait.strength}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 border-t border-border bg-background-elevated px-6 py-4 sm:px-8">
              <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />
              <p className="text-sm text-foreground-muted">
                The more writing samples you provide, the better HUMANORA can
                match your unique style. This score reflects profile
                completeness, not identity or authorship verification.
              </p>
            </div>

            {/* Fine-grained style controls — UI preview only. Not wired to
                any rewrite logic yet, and clearly labeled as such rather
                than implying they already work. */}
            <div className="border-t border-border p-6 sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Style controls</p>
                <Badge variant="neutral">Coming soon</Badge>
              </div>
              <div className="flex flex-col gap-5">
                {styleSliders.map((slider) => (
                  <div key={`${slider.left}-${slider.right}`}>
                    <div className="mb-2 flex items-center justify-between text-xs text-foreground-subtle">
                      <span>{slider.left}</span>
                      <span>{slider.right}</span>
                    </div>
                    <div
                      className="relative h-1.5 w-full cursor-not-allowed rounded-full bg-background-elevated"
                      aria-disabled="true"
                    >
                      <div className="bg-brand-gradient absolute inset-y-0 left-0 w-1/2 rounded-full opacity-40" />
                      <div className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-background bg-foreground-subtle" style={{ left: "50%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
