"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckoutButton } from "@/components/payments/CheckoutButton";
import { PAID_PLAN_IDS, PLANS, type PlanId } from "@/lib/config/plans";
import { formatDateTime } from "@/lib/formatDate";
import { deriveTitle } from "@/lib/text";
import { cn } from "@/lib/cn";

type Likelihood = "likely_human" | "mixed_uncertain" | "likely_ai_assisted";
type Confidence = "low" | "medium" | "high";
type State = "idle" | "processing" | "done" | "error" | "paywall";

interface DetectorResult {
  likelihood: Likelihood;
  confidence: Confidence;
  aiSignals: string[];
  humanSignals: string[];
  explanation: string;
}

export interface DetectorScanHistoryItem {
  id: string;
  inputText: string;
  likelihood: Likelihood;
  confidence: Confidence;
  aiSignals: string[];
  humanSignals: string[];
  explanation: string;
  createdAt: string;
}

const LIKELIHOOD_LABEL: Record<Likelihood, string> = {
  likely_human: "Likely human-written",
  mixed_uncertain: "Mixed or uncertain",
  likely_ai_assisted: "Likely AI-generated or AI-assisted",
};
const LIKELIHOOD_COLOR: Record<Likelihood, string> = {
  likely_human: "border-success/30 bg-success/[0.08] text-success",
  mixed_uncertain: "border-warning/30 bg-warning/[0.08] text-warning",
  likely_ai_assisted: "border-brand-purple/30 bg-brand-purple/[0.08] text-brand-purple",
};

const MIN_CHARS = 100;

/**
 * The real AI Detector workspace — see lib/ai/detector.ts's header for
 * the full reasoning on why this returns a categorical likelihood band
 * + confidence + specific signals instead of a bare percentage. The
 * disclaimer below is not decorative copy — it's load-bearing: this
 * result is never presented as proof of anything.
 */
export function DetectorWorkspace({ plan, initialScans }: { plan: PlanId; initialScans: DetectorScanHistoryItem[] }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<DetectorResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [scans, setScans] = useState(initialScans);

  async function analyze() {
    if (text.trim().length < MIN_CHARS || state === "processing") return;
    setState("processing");
    setErrorMessage("");
    try {
      const response = await fetch("/api/detector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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

      setResult(data.result as DetectorResult);
      setState("done");
      setScans((prev) => [
        { id: data.id, inputText: text.trim(), createdAt: new Date().toISOString(), ...(data.result as DetectorResult) },
        ...prev,
      ]);
    } catch {
      setErrorMessage("Couldn't reach HUMANORA. Check your connection and try again.");
      setState("error");
    }
  }

  async function deleteScan(id: string) {
    const previous = scans;
    setScans((cur) => cur.filter((s) => s.id !== id));
    try {
      const res = await fetch(`/api/detector/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
    } catch {
      setScans(previous);
    }
  }

  if (plan === "free" || state === "paywall") {
    return (
      <Container className="mx-auto max-w-2xl text-center">
        <Badge variant="brand">AI Detector</Badge>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Check writing for AI patterns
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-foreground-muted">
          A probabilistic assessment — likelihood, confidence, and the specific signals behind it.
          Never a bare percentage, never presented as proof.
        </p>
        <div className="mt-8 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <p className="text-sm font-medium text-foreground">Available on every paid plan</p>
          <p className="mt-1 text-xs text-foreground-subtle">
            Uses the same monthly word allowance as Humanize and Study — no separate quota.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {PAID_PLAN_IDS.map((id) => (
              <CheckoutButton key={id} planId={id} variant={id === "pro" ? "primary" : "secondary"} size="sm">
                {PLANS[id].name} · ₹{PLANS[id].monthlyPriceInr}
              </CheckoutButton>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="medium" className="mx-auto pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Detector</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Paste text to check for patterns typical of AI-generated or AI-assisted writing.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste at least a paragraph or two — short snippets don't carry enough signal."
        rows={8}
        className="focus-ring w-full resize-none rounded-xl border border-border bg-surface px-4 py-3.5 text-sm text-foreground placeholder:text-foreground-subtle"
      />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-foreground-subtle">
          {text.trim().length < MIN_CHARS ? `At least ${MIN_CHARS} characters needed` : `${text.trim().length.toLocaleString()} characters`}
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={analyze}
          loading={state === "processing"}
          disabled={text.trim().length < MIN_CHARS}
        >
          Analyze
        </Button>
      </div>

      {state === "error" && (
        <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-foreground">
          {errorMessage}
        </p>
      )}

      {result && state === "done" && <DetectorResultCard result={result} />}

      {scans.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">Recent scans</h2>
          <div className="flex flex-col gap-3">
            {scans.map((scan) => (
              <div key={scan.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", LIKELIHOOD_COLOR[scan.likelihood])}>
                    {LIKELIHOOD_LABEL[scan.likelihood]}
                  </span>
                  <span className="text-xs text-foreground-subtle">{formatDateTime(scan.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-foreground-muted">{deriveTitle(scan.inputText)}</p>
                <button
                  type="button"
                  onClick={() => deleteScan(scan.id)}
                  className="focus-ring press-feedback mt-2 cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-danger"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

function DetectorResultCard({ result }: { result: DetectorResult }) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={cn("rounded-full border px-3 py-1 text-sm font-medium", LIKELIHOOD_COLOR[result.likelihood])}>
          {LIKELIHOOD_LABEL[result.likelihood]}
        </span>
        <span className="text-xs capitalize text-foreground-subtle">{result.confidence} confidence</span>
      </div>

      <p className="mt-3 text-sm text-foreground-muted">{result.explanation}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {result.aiSignals.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">AI-leaning signals</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {result.aiSignals.map((s, i) => (
                <li key={i} className="text-xs text-foreground-muted">
                  · {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.humanSignals.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Human-leaning signals</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {result.humanSignals.map((s, i) => (
                <li key={i} className="text-xs text-foreground-muted">
                  · {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-xs text-foreground-subtle">
        This is a probabilistic pattern assessment, not proof of authorship. AI-assisted writing can
        closely resemble human writing, and human writing can occasionally show uniform patterns —
        use this as one input, not a verdict.
      </p>
    </div>
  );
}
