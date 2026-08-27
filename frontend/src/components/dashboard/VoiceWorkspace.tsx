"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { PlanId } from "@/lib/config/plans";
import { VOICE_TRAITS, TRAIT_META, type VoiceStyleProfile, type VoiceTrait } from "@/lib/ai/voiceAnalysis";

interface Sample {
  id: string;
  content: string;
  wordCount: number;
}

const MIN_WORDS = 40;
const MAX_WORDS = 1200;
const MAX_SAMPLES = 5;

export function VoiceWorkspace({
  plan,
  initialSamples,
  initialProfile,
  initialOverrides,
}: {
  plan: PlanId;
  initialSamples: Sample[];
  initialProfile: VoiceStyleProfile | null;
  initialOverrides: Partial<Record<VoiceTrait, string>>;
}) {
  const [samples, setSamples] = useState(initialSamples);
  const [profile, setProfile] = useState(initialProfile);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [draft, setDraft] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [savedNote, setSavedNote] = useState(false);

  const canApplyVoice = plan !== "free";
  const draftWords = draft.trim() ? draft.trim().split(/\s+/).filter(Boolean).length : 0;

  async function addSample() {
    if (!draft.trim() || adding) return;
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/voice/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data?.error ?? "Couldn't add that sample.");
        return;
      }
      setSamples((prev) => [{ id: data.sample.id, content: data.sample.content, wordCount: data.sample.wordCount }, ...prev]);
      setDraft("");
    } catch {
      setAddError("Couldn't reach HUMANORA. Check your connection and try again.");
    } finally {
      setAdding(false);
    }
  }

  async function removeSample(id: string) {
    setSamples((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/voice/samples/${id}`, { method: "DELETE" });
    } catch {
      // Best-effort — a failed delete just means it'll reappear on next load.
    }
  }

  async function analyze() {
    if (samples.length === 0 || analyzing) return;
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const res = await fetch("/api/voice/analyze", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setAnalyzeError(data?.error ?? "Couldn't analyze your writing right now.");
        return;
      }
      setProfile(data.profile);
      setOverrides({});
    } catch {
      setAnalyzeError("Couldn't reach HUMANORA. Check your connection and try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function updateOverride(trait: VoiceTrait, value: string) {
    const next = { ...overrides, [trait]: value };
    setOverrides(next);
    try {
      await fetch("/api/voice/overrides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      setSavedNote(true);
      window.setTimeout(() => setSavedNote(false), 1500);
    } catch {
      // Overrides are a nicety on top of the base profile — a failed
      // save just means this edit didn't stick; no error UI needed.
    }
  }

  const effective = (trait: VoiceTrait): string | undefined => overrides[trait] ?? profile?.[trait];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Voice</h1>
          <Badge variant="brand">{samples.length}/{MAX_SAMPLES} samples</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
          Give HUMANORA a few examples of your own writing. It learns patterns in how you
          write — vocabulary, sentence rhythm, tone — and can steer future rewrites toward
          that style. This describes your writing style only; it is never used to verify
          identity or authorship.
        </p>
      </div>

      {/* Add sample */}
      <Card className="p-6 sm:p-7">
        <p className="mb-3 text-sm font-medium text-foreground">Add a writing sample</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          placeholder="Paste a piece of your own writing — an email, an essay, a blog post. Something you actually wrote, at least a few paragraphs long."
          disabled={samples.length >= MAX_SAMPLES}
          className="focus-ring w-full resize-none rounded-md border border-border bg-background-elevated p-4 text-sm leading-relaxed text-foreground placeholder:text-foreground-subtle disabled:opacity-50"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-foreground-subtle">
          <span>
            {draftWords} words {draftWords > 0 && (draftWords < MIN_WORDS || draftWords > MAX_WORDS) && (
              <span className="text-warning">
                {" "}
                (needs to be between {MIN_WORDS} and {MAX_WORDS})
              </span>
            )}
          </span>
        </div>
        {addError && <p className="mt-2 text-xs text-danger">{addError}</p>}
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={addSample}
            loading={adding}
            disabled={samples.length >= MAX_SAMPLES || draftWords < MIN_WORDS || draftWords > MAX_WORDS}
          >
            Add sample
          </Button>
          {samples.length >= MAX_SAMPLES && (
            <span className="ml-3 text-xs text-foreground-subtle">
              Maximum reached — remove one below to add another.
            </span>
          )}
        </div>
      </Card>

      {/* Sample list */}
      {samples.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {samples.map((sample) => (
            <Card key={sample.id} className="flex items-start justify-between gap-4 p-4">
              <p className="line-clamp-2 flex-1 text-sm text-foreground-muted">{sample.content}</p>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-foreground-subtle">{sample.wordCount} words</span>
                <button
                  type="button"
                  onClick={() => removeSample(sample.id)}
                  className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-danger"
                >
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Analyze */}
      <Card className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Voice profile</p>
            <p className="mt-1 text-xs text-foreground-subtle">
              {profile
                ? "Analyzed from your current samples. Add or remove samples and re-analyze to update it."
                : "Add at least one sample, then analyze to build your profile."}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={analyze} loading={analyzing} disabled={samples.length === 0}>
            {profile ? "Re-analyze" : "Analyze my writing"}
          </Button>
        </div>
        {analyzeError && <p className="mt-3 text-xs text-danger">{analyzeError}</p>}

        {profile && (
          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-5 text-sm text-foreground-muted">{profile.summary}</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {VOICE_TRAITS.map((trait) => (
                <div key={trait}>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                    {TRAIT_META[trait].label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TRAIT_META[trait].options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateOverride(trait, option)}
                        className={cn(
                          "focus-ring press-feedback cursor-pointer rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                          effective(trait) === option
                            ? "border-transparent bg-brand-gradient text-white"
                            : "border-border bg-surface text-foreground-muted hover:border-brand-purple/30 hover:text-foreground"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {profile.notableQuirks.length > 0 && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                  Other patterns HUMANORA noticed
                </p>
                <ul className="flex flex-col gap-1.5 text-sm text-foreground-muted">
                  {profile.notableQuirks.map((quirk) => (
                    <li key={quirk}>· {quirk}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-6 text-xs text-foreground-subtle">
              {savedNote && <span className="text-success">Saved. </span>}
              Tap any trait above to correct it — your choice always overrides what HUMANORA inferred.
            </p>

            <div className="mt-5 border-t border-border pt-5">
              {canApplyVoice ? (
                <p className="text-xs text-foreground-subtle">
                  This profile is available in the workspace — turn on{" "}
                  <span className="font-medium text-foreground">My Voice</span> next to Mode when
                  humanizing text.
                </p>
              ) : (
                <p className="text-xs text-foreground-subtle">
                  Your profile is ready. Applying it to humanized text requires a paid plan —{" "}
                  <Link href="/dashboard/billing" className="underline underline-offset-2 hover:text-foreground">
                    view plans
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
