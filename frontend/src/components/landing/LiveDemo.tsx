"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { HumanoraRibbon } from "@/components/brand/HumanoraRibbon";
import { writingModes } from "@/lib/config/modes";
import { cn } from "@/lib/cn";
import type { RewriteStrength, WritingMode } from "@/lib/ai/humanize";

const DEFAULT_TEXT =
  "I am writing to inform you that I will not be able to attend the meeting scheduled for tomorrow due to a personal commitment. I apologize for any inconvenience this may cause.";

const MAX_CHARS = 2000;

const strengths: { value: RewriteStrength; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "balanced", label: "Balanced" },
  { value: "strong", label: "Strong" },
];

type DemoState = "idle" | "processing" | "done" | "error";

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * "See HUMANORA in action" — a real, working humanize call. Whatever the
 * user types is sent to POST /api/humanize (see app/api/humanize/route.ts),
 * which runs it through the real AI provider server-side. Mode and
 * Strength are genuinely passed through and affect the rewrite; My Voice
 * is left as a disabled, honestly-labeled "coming soon" control since no
 * voice-profile backend exists yet — it does not fake an effect.
 */
export function LiveDemo() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [mode, setMode] = useState<WritingMode>("professional");
  const [strength, setStrength] = useState<RewriteStrength>("balanced");
  const [state, setState] = useState<DemoState>("idle");
  const [output, setOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function runHumanize() {
    if (!text.trim() || state === "processing") return;
    setState("processing");
    setErrorMessage("");

    try {
      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode, strength }),
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
      // Clipboard access can fail (permissions, insecure context) — the
      // button simply doesn't flip to "Copied", no error UI needed.
    }
  }

  const originalWords = wordCount(text);
  const resultWords = state === "done" ? wordCount(output) : 0;

  return (
    <section id="try-it" className="bg-ambient-glow-soft section-glow-top py-16 sm:py-20">
      <Container>
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <Badge variant="brand">Try it now</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            See HUMANORA in action
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            Paste your own AI-assisted draft below and see how HUMANORA
            rewrites it — this calls the real HUMANORA engine.
          </p>
        </Reveal>

        <Reveal
          as="div"
          delay={100}
          className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-border-strong bg-surface shadow-glow-md"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-background-elevated px-5 py-3 sm:px-7">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="ml-3 text-xs text-foreground-subtle">HUMANORA — Humanize</span>
          </div>

          {/* Toolbar */}
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

            <span
              title="My Voice requires a saved writing profile — coming soon"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs text-foreground-subtle opacity-60"
            >
              My Voice
              <Badge variant="neutral" className="px-1.5 py-0 text-[9px]">
                Soon
              </Badge>
            </span>
          </div>

          {/* Editor panes */}
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-7 sm:p-9">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  Original draft
                </p>
                <span className="text-xs text-foreground-subtle">
                  {text.length}/{MAX_CHARS}
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                rows={7}
                placeholder="Paste an AI-assisted draft here..."
                className="focus-ring w-full resize-none rounded-md bg-transparent text-lg leading-relaxed text-foreground-muted placeholder:text-foreground-subtle"
              />
              <p className="mt-2 text-xs text-foreground-subtle">{originalWords} words</p>
            </div>
            <div className="relative bg-background-elevated/40 p-7 sm:p-9">
              <p className="text-brand-gradient mb-5 text-xs font-semibold uppercase tracking-wide">
                HUMANORA result
              </p>

              {state === "idle" && (
                <p className="text-sm text-foreground-subtle">
                  Click &ldquo;Humanize this draft&rdquo; to see the result.
                </p>
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
                <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/10 p-4">
                  <ErrorIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <p className="text-sm text-foreground-muted">{errorMessage}</p>
                </div>
              )}

              {state === "done" && (
                <>
                  <p className="animate-fade-in-up whitespace-pre-wrap text-lg leading-relaxed text-foreground">
                    {output}
                  </p>
                  <p className="mt-3 text-xs text-foreground-subtle">{resultWords} words</p>
                  <button
                    type="button"
                    onClick={copyResult}
                    className="focus-ring press-feedback absolute right-5 top-5 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground-muted transition-colors hover:border-brand-purple/30 hover:text-foreground sm:right-7 sm:top-7"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5 text-success" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" />
                        Copy result
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Control row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-elevated px-5 py-5 sm:px-7">
            <p className="text-xs text-foreground-subtle">
              Meaning-preservation checks are not yet automated — review important rewrites yourself.
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
                {state === "processing" ? "Humanizing..." : "Humanize this draft"}
              </Button>
            )}
          </div>
        </Reveal>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-foreground-subtle">
          This demo is rate-limited while HUMANORA is in early development.
          If you see a quota message, please try again shortly.
        </p>
      </Container>
    </section>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v5M12 16v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
