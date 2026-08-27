"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { TRAIT_META, VOICE_TRAITS } from "@/lib/ai/voiceAnalysis";

// Illustrative sample data for this example card only — matches the
// REAL traits HUMANORA's My Voice actually analyzes (see
// lib/ai/voiceAnalysis.ts) so this preview never promises something
// the shipped feature doesn't do. No real account's data is shown here.
const exampleTraitValues: Record<(typeof VOICE_TRAITS)[number], string> = {
  vocabularyLevel: "moderate",
  sentenceLength: "varied",
  formality: "neutral",
  directness: "balanced",
  punctuationStyle: "standard",
  transitionStyle: "moderate",
  conversationalTone: "conversational",
  rhythmVariation: "varied",
};

const samples = [
  { name: "Personal essay", words: "1,245 words" },
  { name: "Cover letter draft", words: "982 words" },
  { name: "Blog post", words: "1,035 words" },
];

const COMPLETENESS = 78;
const RADIUS = 27;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * "My Voice" product preview. An illustrative EXAMPLE (clearly badged
 * as such), never live account data — the completeness percentage and
 * sample names are staged for demonstration. Every trait shown here is
 * a real trait HUMANORA's My Voice actually analyzes end to end (see
 * /dashboard/voice), not an invented capability.
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
            Paste a few writing samples and HUMANORA builds a real, structured
            voice profile — vocabulary, sentence rhythm, tone, and more — then
            applies it when you humanize future drafts.
          </p>
        </Reveal>

        <Reveal
          as="div"
          delay={100}
          className="mx-auto mt-12 max-w-4xl"
        >
          <Card className="pearl-glass relative overflow-hidden shadow-glow-sm">
            <Badge variant="neutral" className="absolute right-4 top-4 z-10">
              Example
            </Badge>
            <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-6 sm:p-8">
                <p className="mb-4 text-sm font-medium text-foreground">Writing samples</p>
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
                <ButtonLink href="/signup" variant="secondary" size="sm" className="mt-4 w-full">
                  Build your real voice profile
                </ButtonLink>
              </div>

              <div className="p-6 sm:p-8">
                <p className="mb-4 text-sm font-medium text-foreground">Voice profile</p>

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

                <div className="flex flex-col gap-2">
                  {VOICE_TRAITS.map((trait, i) => (
                    <Reveal key={trait} as="div" delay={200 + i * 70}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground-muted">{TRAIT_META[trait].label}</span>
                        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs capitalize text-foreground-subtle">
                          {exampleTraitValues[trait]}
                        </span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 border-t border-border bg-background-elevated px-6 py-4 sm:px-8">
              <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />
              <p className="text-sm text-foreground-muted">
                This describes writing style only — never used to verify
                identity or authorship. You can review and correct every
                trait HUMANORA infers.
              </p>
            </div>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
