"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckoutButton } from "@/components/payments/CheckoutButton";
import { PLANS, PAID_PLAN_IDS, type PlanId } from "@/lib/config/plans";
import { cn } from "@/lib/cn";

type StudyMode = "summarize" | "explain" | "notes";
type ExplainDepth = "simple" | "standard" | "detailed";
type WorkspaceState = "idle" | "processing" | "done" | "error";

const MODES: { value: StudyMode; label: string; placeholder: string; example: string }[] = [
  {
    value: "summarize",
    label: "Summarize",
    placeholder: "Paste your lecture notes, an article, or a reading — HUMANORA will summarize it.",
    example:
      "The mitochondria is the organelle responsible for producing ATP through cellular respiration. It has a double membrane structure: the outer membrane is smooth, while the inner membrane is folded into cristae, which increase surface area for the electron transport chain. Mitochondria also contain their own DNA, separate from the cell's nuclear DNA, supporting the endosymbiotic theory that they originated from free-living bacteria.",
  },
  {
    value: "explain",
    label: "Explain",
    placeholder: "Paste a topic or passage you want explained, at whatever depth you need.",
    example:
      "Supply and demand is the economic model of price determination in a market. It postulates that the unit price for a particular good will vary until it settles at a point where the quantity demanded by consumers equals the quantity supplied by producers, resulting in an economic equilibrium.",
  },
  {
    value: "notes",
    label: "Study Notes",
    placeholder: "Paste your material and HUMANORA will turn it into structured revision notes.",
    example:
      "Photosynthesis occurs in two stages: the light-dependent reactions, which take place in the thylakoid membrane and produce ATP and NADPH, and the Calvin cycle, which occurs in the stroma and uses that ATP and NADPH to fix carbon dioxide into glucose. Chlorophyll absorbs light most strongly in the blue and red wavelengths, which is why plants appear green.",
  },
];

const DEPTHS: { value: ExplainDepth; label: string }[] = [
  { value: "simple", label: "Simple" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

const MAX_CHARS = 30_000;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * HUMANORA's Study workspace — Summarize / Explain / Study Notes as
 * three modes of one shared "input -> options -> generate -> result"
 * workspace, deliberately built on the same visual and interaction
 * language as HumanizeWorkspace (floating toolbar, borderless editor,
 * shimmer-then-reveal result) rather than a differently-styled page —
 * one workspace system, not a second product bolted on. Draws from the
 * SAME shared monthly word allowance as Humanize (see
 * docs/AI_COST_MODEL.md) — there is no separate "Study quota".
 */
export function StudyWorkspace({ plan }: { plan: PlanId }) {
  const [mode, setMode] = useState<StudyMode>("summarize");
  const [depth, setDepth] = useState<ExplainDepth>("standard");
  const [text, setText] = useState("");
  const [state, setState] = useState<WorkspaceState>("idle");
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const currentMode = MODES.find((m) => m.value === mode)!;

  async function run() {
    if (!text.trim() || state === "processing") return;
    setState("processing");
    setErrorMessage("");
    try {
      const response = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode, depth }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setOutput(data.output as string);
      setState("done");
    } catch {
      setErrorMessage("Couldn't reach HUMANORA. Check your connection and try again.");
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setOutput("");
    setErrorMessage("");
    setCopied(false);
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // no error UI needed for a clipboard failure
    }
  }

  return (
    <Container size="medium" className="mx-auto pb-36 md:pb-24 lg:pb-10">
      <div className="sticky top-14 z-30 -mx-4 mb-6 px-4 pt-4 sm:-mx-6 sm:px-6 md:top-4 lg:mx-0 lg:px-0">
        <div className="pearl-glass flex flex-wrap items-center gap-2 rounded-full px-2.5 py-2 shadow-glow-sm">
          <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1 text-xs">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => {
                  setMode(m.value);
                  reset();
                }}
                aria-pressed={mode === m.value}
                className={cn(
                  "focus-ring press-feedback cursor-pointer rounded-full px-3.5 py-1.5 font-medium transition-colors",
                  mode === m.value ? "bg-brand-gradient text-white" : "text-foreground-muted hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === "explain" && (
            <>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
              <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1 text-xs">
                {DEPTHS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDepth(d.value)}
                    aria-pressed={depth === d.value}
                    className={cn(
                      "focus-ring press-feedback cursor-pointer rounded-full px-2.5 py-1 font-medium transition-colors",
                      depth === d.value ? "bg-brand-gradient text-white" : "text-foreground-muted hover:text-foreground"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-x-10 gap-y-8 xl:gap-x-14",
          (state === "processing" || state === "done" || state === "error") && "lg:grid-cols-2"
        )}
      >
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Material</p>
            <span className="text-xs text-foreground-subtle">
              {text.length}/{MAX_CHARS}
            </span>
          </div>
          <div className="focus-within:ring-brand-purple/40 rounded-xl transition-shadow focus-within:ring-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              rows={6}
              disabled={state === "processing"}
              placeholder={currentMode.placeholder}
              className="min-h-[38vh] w-full resize-none rounded-xl bg-transparent p-1 text-xl leading-relaxed text-foreground placeholder:text-foreground-subtle focus:outline-none disabled:opacity-60 sm:min-h-[300px] lg:min-h-[420px] xl:min-h-[480px]"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-foreground-subtle">
            <span>{wordCount(text)} words</span>
            {state === "idle" && !text && (
              <button
                type="button"
                onClick={() => setText(currentMode.example)}
                className="focus-ring press-feedback cursor-pointer text-foreground-muted underline underline-offset-2 hover:text-foreground"
              >
                Try an example
              </button>
            )}
          </div>
        </div>

        {(state === "processing" || state === "done" || state === "error") && (
          <div className="lg:border-l lg:border-border lg:pl-10">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-brand-gradient text-xs font-semibold uppercase tracking-wide">
                {currentMode.label} result
              </p>
              {state === "done" && (
                <button
                  type="button"
                  onClick={copyResult}
                  className="focus-ring press-feedback inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground-muted transition-colors hover:border-brand-purple/30 hover:text-foreground"
                >
                  {copied ? "Copied" : "Copy result"}
                </button>
              )}
            </div>

            {state === "processing" && (
              <div>
                <p className="mb-4 text-sm font-medium text-foreground-muted">
                  Working on it<span className="animate-ellipsis">...</span>
                </p>
                <div className="flex flex-col gap-3" aria-hidden="true">
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-full" />
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-11/12" />
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-full" />
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-4/5" />
                </div>
              </div>
            )}

            {state === "error" && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
                <p className="text-sm text-foreground">{errorMessage}</p>
                <Button variant="secondary" size="sm" onClick={run} className="mt-3">
                  Try again
                </Button>
              </div>
            )}

            {state === "done" && (
              <p className="animate-sweep-in whitespace-pre-wrap text-lg leading-relaxed text-foreground">
                {output}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-lg md:bottom-0 lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="hidden text-xs text-foreground-subtle sm:block">
            Draws from your {plan} plan&apos;s shared monthly word allowance — the same one Humanize uses.
          </p>
          {state === "done" || state === "error" ? (
            <Button variant="secondary" size="md" onClick={reset} className="ml-auto lg:ml-0">
              New material
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={run}
              loading={state === "processing"}
              disabled={!text.trim()}
              className="ml-auto w-full sm:w-auto lg:ml-0"
            >
              {state === "processing" ? "Working..." : `Generate ${currentMode.label.toLowerCase()}`}
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}

/**
 * Shown in place of the workspace on the free plan — Study draws from
 * the same paid-plan word allowance as Humanize, so it simply isn't
 * available on Free rather than having its own separate free tier.
 * Mirrors the pattern already established for My Voice's free-plan
 * screen: lead with what it is and why it matters, THEN the plan
 * requirement.
 */
export function StudyUpsell() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 text-center">
      <div>
        <Badge variant="brand">Study</Badge>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Turn material into something you can actually study from
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-foreground-muted">
          Paste lecture notes, a reading, or a topic — HUMANORA summarizes it, explains it at the
          depth you need, or turns it into structured revision notes. Grounded in what you actually
          gave it, never invented.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MODES.map((m) => (
          <div key={m.value} className="rounded-lg border border-border bg-surface p-4 text-left">
            <p className="text-sm font-semibold text-foreground">{m.label}</p>
            <p className="mt-1 text-xs text-foreground-subtle">{m.placeholder}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-sm font-medium text-foreground">Available on every paid plan</p>
        <p className="mt-1 text-xs text-foreground-subtle">
          Uses the same monthly word allowance as Humanize — no separate quota to track.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          {PAID_PLAN_IDS.map((id) => (
            <CheckoutButton key={id} planId={id} variant={id === "pro" ? "primary" : "secondary"} size="sm">
              {PLANS[id].name} · ₹{PLANS[id].monthlyPriceInr}
            </CheckoutButton>
          ))}
        </div>
      </div>
    </div>
  );
}
