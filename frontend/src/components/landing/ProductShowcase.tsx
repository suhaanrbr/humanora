"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/cn";

type ShowcaseTab = "humanize" | "voice" | "meaning" | "readability";

const TABS: { id: ShowcaseTab; label: string }[] = [
  { id: "humanize", label: "Humanize" },
  { id: "voice", label: "My Voice" },
  { id: "meaning", label: "Meaning Check" },
  { id: "readability", label: "Readability" },
];

const ORIGINAL_TEXT =
  "It should be noted that the implementation of the aforementioned strategy will likely result in a significant improvement to overall operational efficiency.";
const HUMANIZED_TEXT =
  "This approach should meaningfully improve how efficiently the team operates.";

/**
 * The landing page's one meaningfully interactive product demonstration
 * — everything it shows reflects real HUMANORA behavior (the same
 * mode/strength/My Voice/meaning-check/readability system built into
 * the actual product), just driven by static example content instead
 * of a live Gemini call — no anonymous AI access exists anywhere on
 * this site by design (see /api/humanize's compulsory-auth rule), and
 * this section never pretends otherwise.
 *
 * The "Humanize" tab carries HUMANORA's signature interaction: a
 * left-to-right light sweep that visibly reveals the natural rewrite
 * underneath the stiff original — the core product concept (an AI
 * draft becoming human) translated directly into a single motion
 * instead of an abstract effect. Replaying it just remounts the
 * animated element (a fresh `key`), no state machine needed.
 */
export function ProductShowcase() {
  const [tab, setTab] = useState<ShowcaseTab>("humanize");
  const [sweepKey, setSweepKey] = useState(0);

  function selectTab(next: ShowcaseTab) {
    setTab(next);
    if (next === "humanize") setSweepKey((k) => k + 1);
  }

  return (
    <section id="showcase" className="section-glow-top bg-ambient-glow-soft py-20 sm:py-28">
      <Container>
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <Badge variant="brand">See it think</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            One workspace. Four ways to make writing sound like you.
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            This is the real HUMANORA workspace, driven by example text — sign up to run it on your
            own writing.
          </p>
        </Reveal>

        <Reveal as="div" delay={100} className="mx-auto mt-12 max-w-3xl">
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTab(t.id)}
                className={cn(
                  "focus-ring press-feedback cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  tab === t.id
                    ? "border-transparent bg-brand-gradient text-white"
                    : "border-border bg-surface text-foreground-muted hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="pearl-glass relative overflow-hidden rounded-xl p-6 shadow-glow-md sm:p-8">
            {tab === "humanize" && (
              <div key={sweepKey} className="relative">
                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  Original → Humanized
                </p>
                <div className="relative text-lg leading-relaxed">
                  <p className="text-foreground-muted">{HUMANIZED_TEXT}</p>
                  <p
                    aria-hidden="true"
                    className="animate-sweep-reveal absolute inset-0 text-foreground-subtle"
                  >
                    {ORIGINAL_TEXT}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSweepKey((k) => k + 1)}
                  className="focus-ring press-feedback mt-6 cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-foreground"
                >
                  Replay transformation
                </button>
              </div>
            )}

            {tab === "voice" && (
              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  My Voice — learned from your own writing
                </p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {["Conversational", "Direct", "Varied rhythm", "Moderate transitions"].map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full border border-brand-purple/30 bg-background-elevated px-3 py-1 text-xs text-foreground-muted"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-foreground">
                  &ldquo;Honestly, I think this approach makes sense — it should genuinely help the team
                  move faster without cutting corners.&rdquo;
                </p>
                <p className="mt-3 text-xs text-foreground-subtle">Rewritten in your own voice, not a generic tone.</p>
              </div>
            )}

            {tab === "meaning" && (
              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  Meaning check — every rewrite, checked against the original
                </p>
                <p className="mb-5 text-lg leading-relaxed text-foreground-muted">
                  Revenue grew <strong className="text-foreground">25%</strong> to reach{" "}
                  <strong className="text-foreground">$1,000</strong> by{" "}
                  <strong className="text-foreground">March 5, 2026</strong>.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Percentage: 25%", "Number: $1,000", "Date: March 5, 2026"].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-foreground-muted"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tab === "readability" && (
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 36 36" className="h-20 w-20 shrink-0 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="var(--color-success)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={2 * Math.PI * 15 * (1 - 0.82)}
                  />
                </svg>
                <div>
                  <p className="text-2xl font-bold text-foreground">Easy · 82/100</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    A real Flesch Reading Ease score, computed from the actual rewrite — not an
                    estimate.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <ButtonLink href="/signup" variant="primary" size="md">
              Try it on your own writing
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
