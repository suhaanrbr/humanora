"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HumanoraRibbon } from "@/components/brand/HumanoraRibbon";
import { CheckoutButton } from "@/components/payments/CheckoutButton";
import { writingModes } from "@/lib/config/modes";
import { PLANS, PAID_PLAN_IDS, FREE_TRIAL_MAX_CHARS, type PlanId } from "@/lib/config/plans";
import { cn } from "@/lib/cn";
import type { RewriteStrength, WritingMode } from "@/lib/ai/humanize";
import type { MeaningCheckResult } from "@/lib/ai/meaningCheck";
import type { ReadabilityScore } from "@/lib/ai/readability";

const DRAFT_STORAGE_KEY = "humanora-draft";
const MAX_CHARS = 5000 * 6; // Ultra's ceiling — the API enforces the real per-plan limit server-side

const strengths: { value: RewriteStrength; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "balanced", label: "Balanced" },
  { value: "strong", label: "Strong" },
];

type WorkspaceState = "idle" | "processing" | "done" | "error" | "paywall";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface VoiceProfileOption {
  id: string;
  name: string;
  isDefault: boolean;
}

export function HumanizeWorkspace({
  plan,
  voiceProfiles,
}: {
  plan: PlanId;
  voiceProfiles: VoiceProfileOption[];
}) {
  // Starts empty on both server and the client's first render (SSR-safe,
  // no hydration mismatch), then restored from sessionStorage — see
  // effect below — if the user was sent to the paywall and came back.
  // Never put this in the URL or send it to analytics; sessionStorage is
  // private to this browser tab and cleared when the tab closes.
  const [text, setText] = useState("");
  const [mode, setMode] = useState<WritingMode>("professional");
  const [strength, setStrength] = useState<RewriteStrength>("balanced");
  const [state, setState] = useState<WorkspaceState>("idle");
  const [output, setOutput] = useState("");
  const [outputs, setOutputs] = useState<string[]>([]);
  const [activeVariation, setActiveVariation] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [meaningCheck, setMeaningCheck] = useState<MeaningCheckResult | null>(null);
  const [readability, setReadability] = useState<ReadabilityScore | null>(null);

  const voiceAvailable = plan !== "free" && voiceProfiles.length > 0;
  const [voiceProfileId, setVoiceProfileId] = useState<string>(
    voiceProfiles.find((p) => p.isDefault)?.id ?? voiceProfiles[0]?.id ?? ""
  );
  const customInstructionsAvailable = PLANS[plan].customInstructions;
  const [customInstructions, setCustomInstructions] = useState("");
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);

  // Restore once on mount, then persist on every subsequent edit via
  // handleTextChange below — deliberately NOT two separate effects (one
  // keyed on `text` for persisting would race the restore effect on the
  // very first render, immediately overwriting the just-restored value
  // with the still-stale empty state from that same commit).
  /* eslint-disable react-hooks/set-state-in-effect --
     Deliberate: restoring browser-only sessionStorage state can't happen
     during SSR or the initial client render without a hydration
     mismatch (the standard "sync from a browser-only API after
     hydration" pattern used throughout this codebase). */
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) setText(saved);
    } catch {
      // sessionStorage can throw in some private-browsing contexts —
      // not worth surfacing, the workspace just starts empty.
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleTextChange(value: string) {
    setText(value);
    try {
      if (value) window.sessionStorage.setItem(DRAFT_STORAGE_KEY, value);
      else window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore — draft persistence is a nicety, not critical functionality
    }
  }

  async function runHumanize() {
    if (!text.trim() || state === "processing") return;
    setState("processing");
    setErrorMessage("");

    try {
      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mode,
          strength,
          voiceProfileId: voiceAvailable && voiceProfileId ? voiceProfileId : undefined,
          customInstructions: customInstructionsAvailable ? customInstructions : undefined,
        }),
      });
      const data = await response.json();

      if (response.status === 402 || data?.code === "UPGRADE_REQUIRED") {
        setState("paywall");
        return;
      }

      if (!response.ok) {
        setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      setOutput(data.output as string);
      setOutputs((data.outputs as string[]) ?? [data.output as string]);
      setActiveVariation(0);
      setMeaningCheck((data.meaningCheck as MeaningCheckResult) ?? null);
      setReadability((data.readability as ReadabilityScore) ?? null);
      setState("done");
      // A delivered result means the draft no longer needs to survive
      // a redirect round-trip.
      try {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }
    } catch {
      setErrorMessage("Couldn't reach HUMANORA. Check your connection and try again.");
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setOutput("");
    setOutputs([]);
    setActiveVariation(0);
    setErrorMessage("");
    setCopied(false);
    setMeaningCheck(null);
    setReadability(null);
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(outputs[activeVariation] ?? output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // no error UI needed for a clipboard failure
    }
  }

  if (state === "paywall") {
    return (
      <Container className="mx-auto max-w-4xl">
        <PaywallPanel onBack={() => setState("idle")} />
      </Container>
    );
  }

  return (
    <Container className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Humanize</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Paste your draft, choose a mode, and let HUMANORA rewrite it.
        </p>
      </div>

      <Card className="overflow-hidden shadow-glow-md">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background-elevated px-5 py-4 sm:px-7">
          <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs text-foreground-muted">
            <span className="text-foreground-subtle">Mode:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as WritingMode)}
              className="focus-ring cursor-pointer rounded bg-transparent font-medium text-foreground"
            >
              {writingModes.map((m) => (
                <option key={m.name} value={m.name.toLowerCase()} className="bg-surface text-foreground">
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs">
            {strengths.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStrength(s.value)}
                className={cn(
                  "focus-ring press-feedback cursor-pointer rounded-full px-2.5 py-1 font-medium transition-colors",
                  strength === s.value
                    ? "bg-brand-gradient text-white"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {voiceAvailable ? (
            <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs text-foreground-muted">
              <span className="text-foreground-subtle">Voice:</span>
              <select
                value={voiceProfileId}
                onChange={(e) => setVoiceProfileId(e.target.value)}
                className="focus-ring cursor-pointer rounded bg-transparent font-medium text-foreground"
              >
                <option value="" className="bg-surface text-foreground">
                  None
                </option>
                {voiceProfiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-surface text-foreground">
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <Link
              href="/dashboard/voice"
              title={plan === "free" ? "My Voice requires a paid plan" : "Build your voice profile first"}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs text-foreground-subtle opacity-70 hover:opacity-100"
            >
              My Voice
              <Badge variant="neutral" className="px-1.5 py-0 text-[9px]">
                {plan === "free" ? "Paid plans" : "Set up"}
              </Badge>
            </Link>
          )}

          {customInstructionsAvailable ? (
            <button
              type="button"
              onClick={() => setShowCustomInstructions((v) => !v)}
              className={cn(
                "focus-ring press-feedback inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                showCustomInstructions || customInstructions
                  ? "border-transparent bg-brand-gradient text-white"
                  : "border-border bg-surface text-foreground-muted hover:text-foreground"
              )}
            >
              Custom instructions
            </button>
          ) : (
            <Link
              href="/dashboard/billing"
              title="Custom instructions require the Pro or Ultra plan"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs text-foreground-subtle opacity-70 hover:opacity-100"
            >
              Custom instructions
              <Badge variant="neutral" className="px-1.5 py-0 text-[9px]">
                Pro
              </Badge>
            </Link>
          )}
        </div>

        {customInstructionsAvailable && showCustomInstructions && (
          <div className="border-b border-border bg-background-elevated px-5 py-4 sm:px-7">
            <input
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value.slice(0, 300))}
              placeholder='e.g. "avoid em dashes", "keep it under 100 words", "use British spelling"'
              className="focus-ring w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle"
            />
            <p className="mt-1.5 text-xs text-foreground-subtle">{customInstructions.length}/300</p>
          </div>
        )}

        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-7 sm:p-9">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Original</p>
              <span className="text-xs text-foreground-subtle">
                {text.length}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value.slice(0, MAX_CHARS))}
              rows={10}
              placeholder="Paste your AI-assisted draft here..."
              className="focus-ring w-full resize-none rounded-md bg-transparent text-lg leading-relaxed text-foreground-muted placeholder:text-foreground-subtle"
            />
            <p className="mt-2 text-xs text-foreground-subtle">{wordCount(text)} words</p>
          </div>
          <div className="relative bg-background-elevated/40 p-7 sm:p-9">
            <p className="text-brand-gradient mb-5 text-xs font-semibold uppercase tracking-wide">
              HUMANORA result
            </p>

            {state === "idle" && (
              <p className="text-sm text-foreground-subtle">Click &ldquo;Humanize&rdquo; to see the result.</p>
            )}

            {state === "processing" && (
              <div>
                <p className="text-sm font-medium text-foreground-muted">
                  Humanizing<span className="animate-ellipsis">...</span>
                </p>
                <HumanoraRibbon className="mt-4 h-10 w-full max-w-[220px] opacity-60" animated />
              </div>
            )}

            {state === "error" && (
              <p className="rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-foreground-muted">
                {errorMessage}
              </p>
            )}

            {state === "done" && (
              <>
                {outputs.length > 1 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {outputs.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveVariation(i)}
                        className={cn(
                          "focus-ring press-feedback cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          activeVariation === i
                            ? "bg-brand-gradient text-white"
                            : "border border-border bg-surface text-foreground-muted hover:text-foreground"
                        )}
                      >
                        Variation {i + 1}
                      </button>
                    ))}
                  </div>
                )}
                <p className="animate-fade-in-up whitespace-pre-wrap text-lg leading-relaxed text-foreground">
                  {outputs[activeVariation] ?? output}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-foreground-subtle">
                  <span>{wordCount(outputs[activeVariation] ?? output)} words</span>
                  {readability && activeVariation === 0 && (
                    <span title={`Flesch Reading Ease: ${readability.score}/100`}>
                      · Readability: {readability.label} ({readability.score})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={copyResult}
                  className="focus-ring press-feedback absolute right-5 top-5 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground-muted transition-colors hover:border-brand-purple/30 hover:text-foreground sm:right-7 sm:top-7"
                >
                  {copied ? "Copied" : "Copy result"}
                </button>
              </>
            )}
          </div>
        </div>

        {state === "done" && meaningCheck && meaningCheck.items.length > 0 && (
          <MeaningCheckPanel result={meaningCheck} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-elevated px-5 py-5 sm:px-7">
          <p className="text-xs text-foreground-subtle">
            Your one complimentary transformation supports up to {FREE_TRIAL_MAX_CHARS} characters.
          </p>
          {state === "done" || state === "error" ? (
            <Button variant="secondary" size="md" onClick={reset}>
              Reset
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={runHumanize}
              loading={state === "processing"}
              disabled={!text.trim()}
            >
              {state === "processing" ? "Humanizing..." : "Humanize"}
            </Button>
          )}
        </div>
      </Card>
    </Container>
  );
}

const MEANING_TYPE_LABEL: Record<MeaningCheckResult["items"][number]["type"], string> = {
  number: "Number",
  percentage: "Percentage",
  date: "Date",
  url: "Link",
  quote: "Quote",
};

/**
 * A deterministic (non-AI) pass over the input/output flagging whether
 * numbers, percentages, dates, links, and quotes survived the rewrite.
 * Purely informational — it never blocks the result, just tells the
 * user exactly what to double-check rather than asking them to trust
 * the rewrite blindly.
 */
function MeaningCheckPanel({ result }: { result: MeaningCheckResult }) {
  const changed = result.items.filter((i) => !i.preserved);

  return (
    <div className="border-t border-border px-5 py-4 sm:px-7">
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", result.allPreserved ? "bg-success" : "bg-warning")} />
        <p className="text-xs font-medium text-foreground">
          {result.allPreserved
            ? "Meaning check: all facts preserved"
            : `Meaning check: ${changed.length} item${changed.length === 1 ? "" : "s"} may have changed — review recommended`}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {result.items.map((item, i) => (
          <span
            key={`${item.type}-${item.value}-${i}`}
            title={item.preserved ? "Found in the result" : "Not found in the result — please check"}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]",
              item.preserved
                ? "border-border bg-surface text-foreground-muted"
                : "border-warning/40 bg-warning/10 text-warning"
            )}
          >
            {item.preserved ? "✓" : "!"} {MEANING_TYPE_LABEL[item.type]}: {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function PaywallPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="text-center">
      <Badge variant="brand">Continue with HUMANORA</Badge>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
        Choose a plan to keep writing
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-base text-foreground-muted">
        Your complimentary HUMANORA experience supports up to {FREE_TRIAL_MAX_CHARS} characters.
        Choose a plan to work with longer writing and continue using HUMANORA.
      </p>

      <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        {PAID_PLAN_IDS.map((id) => {
          const plan = PLANS[id];
          return (
            <Card key={id} className={cn("p-6", id === "pro" && "border-brand-purple/40 shadow-glow-sm")}>
              <p className="text-sm font-medium text-foreground-muted">{plan.name}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                ₹{plan.monthlyPriceInr}
                <span className="text-sm font-normal text-foreground-subtle">/30 days</span>
              </p>
              <p className="mt-3 text-xs text-foreground-subtle">
                {plan.monthlyHumanizations} humanizations · up to {Math.round(plan.maxInputChars / 6)} words ·{" "}
                {plan.outputVariations} variations · {plan.maxVoiceProfiles} Voice profile
                {plan.maxVoiceProfiles === 1 ? "" : "s"}
                {plan.customInstructions ? " · custom instructions" : ""}
              </p>
              <CheckoutButton planId={id} variant={id === "pro" ? "primary" : "secondary"} className="mt-6 w-full">
                Choose {plan.name}
              </CheckoutButton>
            </Card>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="focus-ring press-feedback mt-8 cursor-pointer text-sm text-foreground-muted underline underline-offset-2 hover:text-foreground"
      >
        Back to your draft
      </button>
    </div>
  );
}
