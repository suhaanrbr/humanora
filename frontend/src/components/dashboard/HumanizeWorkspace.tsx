"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/payments/CheckoutButton";
import { writingModes } from "@/lib/config/modes";
import { PLANS, PAID_PLAN_IDS, FREE_TRIAL_MAX_CHARS, type PlanId } from "@/lib/config/plans";
import { cn } from "@/lib/cn";
import type { RewriteStrength, WritingMode } from "@/lib/ai/humanize";
import type { MeaningCheckResult } from "@/lib/ai/meaningCheck";
import type { ReadabilityScore } from "@/lib/ai/readability";

const DRAFT_STORAGE_KEY = "humanora-draft";
const MAX_CHARS = 5000 * 6; // Ultra's ceiling — the API enforces the real per-plan limit server-side

// Kept under FREE_TRIAL_MAX_CHARS (200) so a first-time free user's very
// first Humanize click — using this example — actually succeeds instead
// of immediately hitting the free-trial length paywall.
const EXAMPLE_TEXT =
  "It should be noted that the implementation of this strategy will likely result in a significant improvement to overall efficiency.";

const strengths: { value: RewriteStrength; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "balanced", label: "Balanced" },
  { value: "strong", label: "Strong" },
];

type WorkspaceState = "idle" | "processing" | "done" | "error" | "paywall";
type CompareView = "original" | "result";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

interface VoiceProfileOption {
  id: string;
  name: string;
  isDefault: boolean;
}

/**
 * HUMANORA's flagship workspace — the editor is the interface, not a
 * textarea sitting inside a dashboard card. A single floating toolbar
 * carries every control the current plan actually supports; the canvas
 * itself has almost no chrome so the writing has room to breathe.
 *
 * The processing → result transition deliberately mirrors the landing
 * page's signature interaction (an indeterminate shimmer while the one
 * real API call is in flight, then the same clip-path "sweep" used in
 * ProductShowcase to reveal the finished rewrite) — one HUMANORA motif,
 * not two different loading treatments invented separately.
 */
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
  const [compareView, setCompareView] = useState<CompareView>("original");
  const [controlsOpen, setControlsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const voiceAvailable = plan !== "free" && voiceProfiles.length > 0;
  const [voiceProfileId, setVoiceProfileId] = useState<string>(
    voiceProfiles.find((p) => p.isDefault)?.id ?? voiceProfiles[0]?.id ?? ""
  );
  const activeVoice = voiceProfiles.find((p) => p.id === voiceProfileId);
  const customInstructionsAvailable = PLANS[plan].customInstructions;
  const [customInstructions, setCustomInstructions] = useState("");

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

  function loadExample() {
    handleTextChange(EXAMPLE_TEXT);
    textareaRef.current?.focus();
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
      setCompareView("result");
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
    setCompareView("original");
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

  const currentMode = writingModes.find((m) => m.name.toLowerCase() === mode);

  return (
    <Container className="mx-auto max-w-5xl pb-28 lg:pb-10">
      {/* Floating toolbar — every control the current plan actually
          supports, in one continuous strip instead of scattered cards.
          Sticky so it stays reachable while a long draft scrolls, but
          it's the editor beneath it that owns the page. */}
      <div className="sticky top-[6.5rem] z-30 -mx-4 mb-6 px-4 pt-4 sm:-mx-6 sm:px-6 lg:top-4 lg:mx-0 lg:px-0">
        <div className="pearl-glass flex flex-wrap items-center gap-2 rounded-full px-2.5 py-2 shadow-glow-sm">
          <label className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-foreground-muted">
            <span className="text-foreground-subtle">Mode</span>
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

          <span className="h-4 w-px bg-border" aria-hidden="true" />

          <div className="inline-flex items-center gap-1 rounded-full bg-surface p-1 text-xs">
            {strengths.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStrength(s.value)}
                aria-pressed={strength === s.value}
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

          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />

          {voiceAvailable ? (
            <label className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-foreground-muted sm:inline-flex">
              <span className="text-foreground-subtle">Voice</span>
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
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-foreground-subtle opacity-70 hover:opacity-100 sm:inline-flex"
            >
              My Voice
              <Badge variant="neutral" className="px-1.5 py-0 text-[9px]">
                {plan === "free" ? "Paid plans" : "Set up"}
              </Badge>
            </Link>
          )}

          {customInstructionsAvailable && (
            <button
              type="button"
              onClick={() => setControlsOpen((v) => !v)}
              aria-expanded={controlsOpen}
              className={cn(
                "focus-ring press-feedback ml-auto hidden cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:inline-flex",
                controlsOpen || customInstructions ? "text-brand-purple" : "text-foreground-muted hover:text-foreground"
              )}
            >
              Custom instructions
            </button>
          )}

          {/* Mobile: everything above sm:hidden collapses behind one
              "Controls" trigger instead of wrapping into a cramped
              multi-row strip. */}
          <button
            type="button"
            onClick={() => setControlsOpen((v) => !v)}
            aria-expanded={controlsOpen}
            className="focus-ring press-feedback ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground-muted sm:hidden"
          >
            <SlidersIcon className="h-3.5 w-3.5" />
            Controls
          </button>
        </div>

        {controlsOpen && (
          <div className="pearl-glass mt-2 flex flex-col gap-3 rounded-2xl p-4 shadow-glow-sm sm:hidden">
            {voiceAvailable ? (
              <label className="flex items-center justify-between text-sm text-foreground-muted">
                My Voice
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
              <Link href="/dashboard/voice" className="text-sm text-foreground-subtle underline underline-offset-2">
                Set up My Voice
              </Link>
            )}
            {customInstructionsAvailable && (
              <div>
                <input
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value.slice(0, 300))}
                  placeholder='e.g. "avoid em dashes", "keep it under 100 words"'
                  className="focus-ring w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle"
                />
                <p className="mt-1.5 text-xs text-foreground-subtle">{customInstructions.length}/300</p>
              </div>
            )}
          </div>
        )}

        {customInstructionsAvailable && controlsOpen && (
          <div className="pearl-glass mt-2 hidden rounded-2xl p-4 shadow-glow-sm sm:block">
            <input
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value.slice(0, 300))}
              placeholder='e.g. "avoid em dashes", "keep it under 100 words", "use British spelling"'
              className="focus-ring w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle"
            />
            <p className="mt-1.5 text-xs text-foreground-subtle">{customInstructions.length}/300</p>
          </div>
        )}
      </div>

      {/* Active My Voice indicator — a small, unmissable-but-quiet cue
          that a real profile is steering this rewrite, not just an
          option buried in a dropdown. */}
      {voiceAvailable && activeVoice && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-3 py-1.5 text-xs text-foreground">
          <SparkleIcon className="h-3.5 w-3.5 text-brand-purple" />
          Writing in <span className="font-semibold">{activeVoice.name}</span>&apos;s voice
          <button
            type="button"
            onClick={() => setVoiceProfileId("")}
            aria-label="Stop using this voice profile"
            className="focus-ring press-feedback ml-1 cursor-pointer rounded-full text-foreground-subtle hover:text-foreground"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Mobile compare toggle — appears once there's something to
          compare. Desktop shows both panes at once, so this is hidden
          there. */}
      {(state === "processing" || state === "done" || state === "error") && (
        <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-surface p-1 text-xs lg:hidden">
          <button
            type="button"
            onClick={() => setCompareView("original")}
            className={cn(
              "focus-ring press-feedback cursor-pointer rounded-full px-3 py-1.5 font-medium transition-colors",
              compareView === "original" ? "bg-brand-gradient text-white" : "text-foreground-muted"
            )}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setCompareView("result")}
            disabled={state !== "done"}
            className={cn(
              "focus-ring press-feedback cursor-pointer rounded-full px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              compareView === "result" ? "bg-brand-gradient text-white" : "text-foreground-muted"
            )}
          >
            Result
          </button>
        </div>
      )}

      <div
        className={cn(
          "grid grid-cols-1 gap-x-10 gap-y-8",
          (state === "processing" || state === "done" || state === "error") && "lg:grid-cols-2"
        )}
      >
        {/* Original — the writing canvas itself. No card border: just a
            focus ring on the wrapper, generous measure, and room to
            breathe. */}
        <div className={cn(compareView !== "original" && "hidden lg:block")}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
              {state === "idle" ? "Your draft" : "Original"}
            </p>
            <span className="text-xs text-foreground-subtle">
              {text.length}/{MAX_CHARS}
            </span>
          </div>
          <div className="focus-within:ring-brand-purple/40 rounded-xl transition-shadow focus-within:ring-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => handleTextChange(e.target.value.slice(0, MAX_CHARS))}
              rows={6}
              disabled={state === "processing"}
              placeholder="Paste your AI-assisted draft here, or start typing..."
              className="min-h-[38vh] w-full resize-none rounded-xl bg-transparent p-1 text-xl leading-relaxed text-foreground placeholder:text-foreground-subtle focus:outline-none disabled:opacity-60 sm:min-h-[300px] lg:min-h-[420px]"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-foreground-subtle">
            <span>{wordCount(text)} words</span>
            {state === "idle" && !text && (
              <button
                type="button"
                onClick={loadExample}
                className="focus-ring press-feedback cursor-pointer text-foreground-muted underline underline-offset-2 hover:text-foreground"
              >
                Try an example
              </button>
            )}
          </div>
        </div>

        {/* Result pane — only rendered once there's something to show.
            The empty/idle state deliberately has no mirrored empty pane
            on desktop: an untouched textarea taking up the whole width
            reads calmer than two boxes side by side with one empty. */}
        {(state === "processing" || state === "done" || state === "error") && (
          <div className={cn(compareView !== "result" && "hidden lg:block", "lg:border-l lg:border-border lg:pl-10")}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-brand-gradient text-xs font-semibold uppercase tracking-wide">
                HUMANORA result
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
                  Rewriting your draft<span className="animate-ellipsis">...</span>
                </p>
                <div className="flex flex-col gap-3" aria-hidden="true">
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-full" />
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-11/12" />
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-full" />
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-4/5" />
                  <span className="skeleton-line animate-sweep-shimmer block h-3 w-10/12" />
                </div>
              </div>
            )}

            {state === "error" && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
                <p className="text-sm text-foreground">{errorMessage}</p>
                <Button variant="secondary" size="sm" onClick={runHumanize} className="mt-3">
                  Try again
                </Button>
              </div>
            )}

            {state === "done" && (
              <div>
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
                {/* The one-shot sweep: the same clip-path reveal used on
                    the landing page's Humanize demo, now revealing a
                    real result the user just generated. Keyed on the
                    active variation so switching variations replays it. */}
                <p
                  key={activeVariation}
                  className="animate-sweep-in whitespace-pre-wrap text-xl leading-relaxed text-foreground"
                >
                  {outputs[activeVariation] ?? output}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-foreground-subtle">
                  <span>{wordCount(outputs[activeVariation] ?? output)} words</span>
                  {readability && activeVariation === 0 && (
                    <span title={`Flesch Reading Ease: ${readability.score}/100`}>
                      · Readability: {readability.label} ({readability.score})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {state === "done" && meaningCheck && meaningCheck.items.length > 0 && (
        <MeaningCheckPanel result={meaningCheck} />
      )}

      {/* Primary action — sticky at the bottom on mobile (always
          reachable without scrolling back up through a long draft),
          inline on desktop. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-lg lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="hidden text-xs text-foreground-subtle sm:block">
            {currentMode
              ? currentMode.description
              : `Your one complimentary transformation supports up to ${FREE_TRIAL_MAX_CHARS} characters.`}
          </p>
          {state === "done" || state === "error" ? (
            <Button variant="secondary" size="md" onClick={reset} className="ml-auto lg:ml-0">
              New draft
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={runHumanize}
              loading={state === "processing"}
              disabled={!text.trim()}
              className="ml-auto w-full sm:w-auto lg:ml-0"
            >
              {state === "processing" ? "Humanizing..." : "Humanize"}
            </Button>
          )}
        </div>
      </div>
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
    <div className="mt-6 rounded-xl border border-border bg-surface px-5 py-4">
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
                ? "border-border bg-background-elevated text-foreground-muted"
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

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 6h9M18 6h1M5 12h1M8 12h11M5 18h13M18.5 18h.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="16" cy="6" r="2" fill="currentColor" />
      <circle cx="6.5" cy="12" r="2" fill="currentColor" />
      <circle cx="16.5" cy="18" r="2" fill="currentColor" />
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
