"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { PlanId } from "@/lib/config/plans";
import { VOICE_TRAITS, TRAIT_META, type VoiceStyleProfile, type VoiceTrait } from "@/lib/ai/voiceAnalysis";
import { BillingActions } from "@/components/dashboard/BillingActions";

interface Sample {
  id: string;
  content: string;
  wordCount: number;
}

export interface ProfileData {
  id: string;
  name: string;
  isDefault: boolean;
  samples: Sample[];
  profile: VoiceStyleProfile | null;
  overrides: Partial<Record<VoiceTrait, string>>;
}

const MIN_WORDS = 40;
const MAX_WORDS = 1200;
const MAX_SAMPLES = 5;

export function VoiceWorkspace({
  plan,
  maxProfiles,
  initialProfiles,
}: {
  plan: PlanId;
  maxProfiles: number;
  initialProfiles: ProfileData[];
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [activeId, setActiveId] = useState<string | null>(initialProfiles[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");

  const active = profiles.find((p) => p.id === activeId) ?? null;

  function updateProfile(id: string, patch: Partial<ProfileData>) {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function createProfile() {
    if (!newName.trim()) return;
    setCreateError("");
    try {
      const res = await fetch("/api/voice/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data?.error ?? "Couldn't create that profile.");
        return;
      }
      const created: ProfileData = {
        id: data.profile.id,
        name: data.profile.name,
        isDefault: data.profile.isDefault,
        samples: [],
        profile: null,
        overrides: {},
      };
      setProfiles((prev) => [...prev, created]);
      setActiveId(created.id);
      setNewName("");
      setCreating(false);
    } catch {
      setCreateError("Couldn't reach HUMANORA. Check your connection and try again.");
    }
  }

  async function deleteProfile(id: string) {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeId === id) setActiveId((profiles.find((p) => p.id !== id) ?? null)?.id ?? null);
    try {
      await fetch(`/api/voice/profiles/${id}`, { method: "DELETE" });
    } catch {
      // best-effort — a failed delete just means it reappears on next load
    }
  }

  async function renameProfile(id: string, name: string) {
    updateProfile(id, { name });
    try {
      await fetch(`/api/voice/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } catch {
      // best-effort rename — no error UI needed for a label change
    }
  }

  if (maxProfiles === 0) {
    return (
      <div className="text-center">
        <Badge variant="brand">My Voice</Badge>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          Teach HUMANORA how you write
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground-muted">
          My Voice learns your vocabulary, sentence rhythm, and tone from real writing samples, then
          applies it when humanizing future drafts. Available on every paid plan.
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          <BillingActions />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Voice</h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
          Give HUMANORA a few examples of your own writing. It learns patterns in how you write and
          applies them to future rewrites. This describes your writing style only — never used to
          verify identity or authorship.
        </p>
      </div>

      {/* Profile tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveId(p.id)}
            className={cn(
              "focus-ring press-feedback flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              activeId === p.id
                ? "border-transparent bg-brand-gradient text-white"
                : "border-border bg-surface text-foreground-muted hover:text-foreground"
            )}
          >
            {p.name}
            {p.isDefault && (
              <span className={cn("text-[10px] uppercase tracking-wide", activeId === p.id ? "text-white/70" : "text-foreground-subtle")}>
                Default
              </span>
            )}
          </button>
        ))}

        {profiles.length < maxProfiles &&
          (creating ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createProfile()}
                placeholder="Profile name"
                className="focus-ring h-9 w-40 rounded-full border border-border bg-surface px-3.5 text-sm text-foreground"
              />
              <Button variant="secondary" size="sm" onClick={createProfile} disabled={!newName.trim()}>
                Add
              </Button>
              <button
                type="button"
                onClick={() => { setCreating(false); setNewName(""); setCreateError(""); }}
                className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="focus-ring press-feedback cursor-pointer rounded-full border border-dashed border-border px-4 py-2 text-sm text-foreground-subtle hover:border-brand-purple/40 hover:text-foreground"
            >
              + New profile
            </button>
          ))}
        {profiles.length >= maxProfiles && (
          <span className="text-xs text-foreground-subtle">
            {plan} plan supports up to {maxProfiles} profile{maxProfiles === 1 ? "" : "s"}.
          </span>
        )}
      </div>
      {createError && <p className="text-xs text-danger">{createError}</p>}

      {active ? (
        <ProfilePanel
          key={active.id}
          data={active}
          canDelete={profiles.length > 1}
          onUpdate={(patch) => updateProfile(active.id, patch)}
          onRename={(name) => renameProfile(active.id, name)}
          onDelete={() => deleteProfile(active.id)}
          onSetDefault={async () => {
            setProfiles((prev) => prev.map((p) => ({ ...p, isDefault: p.id === active.id })));
            try {
              await fetch(`/api/voice/profiles/${active.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDefault: true }),
              });
            } catch {
              // best-effort
            }
          }}
        />
      ) : (
        <Card className="p-8 text-center">
          <p className="text-sm text-foreground-muted">Create your first Voice profile to get started.</p>
        </Card>
      )}
    </div>
  );
}

function ProfilePanel({
  data,
  canDelete,
  onUpdate,
  onRename,
  onDelete,
  onSetDefault,
}: {
  data: ProfileData;
  canDelete: boolean;
  onUpdate: (patch: Partial<ProfileData>) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const { id: profileId, samples, profile, overrides } = data;
  const [draft, setDraft] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [savedNote, setSavedNote] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(data.name);

  const draftWords = draft.trim() ? draft.trim().split(/\s+/).filter(Boolean).length : 0;

  async function addSample() {
    if (!draft.trim() || adding) return;
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/voice/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, content: draft }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setAddError(resData?.error ?? "Couldn't add that sample.");
        return;
      }
      onUpdate({ samples: [{ id: resData.sample.id, content: resData.sample.content, wordCount: resData.sample.wordCount }, ...samples] });
      setDraft("");
    } catch {
      setAddError("Couldn't reach HUMANORA. Check your connection and try again.");
    } finally {
      setAdding(false);
    }
  }

  async function removeSample(sampleId: string) {
    onUpdate({ samples: samples.filter((s) => s.id !== sampleId) });
    try {
      await fetch(`/api/voice/samples/${sampleId}?profileId=${profileId}`, { method: "DELETE" });
    } catch {
      // best-effort
    }
  }

  async function analyze() {
    if (samples.length === 0 || analyzing) return;
    setAnalyzing(true);
    setAnalyzeError("");
    try {
      const res = await fetch("/api/voice/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setAnalyzeError(resData?.error ?? "Couldn't analyze your writing right now.");
        return;
      }
      onUpdate({ profile: resData.profile, overrides: {} });
    } catch {
      setAnalyzeError("Couldn't reach HUMANORA. Check your connection and try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function updateOverride(trait: VoiceTrait, value: string) {
    const next = { ...overrides, [trait]: value };
    onUpdate({ overrides: next });
    try {
      await fetch("/api/voice/overrides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, ...next }),
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
    <div className="flex flex-col gap-6">
      {/* Profile header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {renaming ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRename(nameDraft);
                  setRenaming(false);
                }
              }}
              className="focus-ring h-9 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            />
            <Button variant="secondary" size="sm" onClick={() => { onRename(nameDraft); setRenaming(false); }}>
              Save
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setNameDraft(data.name); setRenaming(true); }}
            className="focus-ring press-feedback cursor-pointer text-sm font-medium text-foreground underline decoration-dotted underline-offset-4 hover:decoration-solid"
          >
            {data.name}
          </button>
        )}

        <div className="flex items-center gap-3 text-xs">
          {!data.isDefault && (
            <button type="button" onClick={onSetDefault} className="focus-ring press-feedback cursor-pointer text-foreground-subtle underline underline-offset-2 hover:text-foreground">
              Make default
            </button>
          )}
          {canDelete &&
            (confirmDelete ? (
              <span className="flex items-center gap-2">
                <span className="text-foreground-subtle">Delete this profile?</span>
                <button type="button" onClick={onDelete} className="focus-ring press-feedback cursor-pointer font-medium text-danger">
                  Delete
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="focus-ring press-feedback cursor-pointer text-foreground-subtle">
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="focus-ring press-feedback cursor-pointer text-foreground-subtle underline underline-offset-2 hover:text-danger">
                Delete profile
              </button>
            ))}
        </div>
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
              <span className="text-warning"> (needs to be between {MIN_WORDS} and {MAX_WORDS})</span>
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
            <span className="ml-3 text-xs text-foreground-subtle">Maximum reached — remove one below to add another.</span>
          )}
        </div>
      </Card>

      {samples.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {samples.map((sample) => (
            <Card key={sample.id} className="flex items-start justify-between gap-4 p-4">
              <p className="line-clamp-2 flex-1 text-sm text-foreground-muted">{sample.content}</p>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-foreground-subtle">{sample.wordCount} words</span>
                <button type="button" onClick={() => removeSample(sample.id)} className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-danger">
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Voice profile</p>
            <p className="mt-1 text-xs text-foreground-subtle">
              {profile
                ? "Analyzed from this profile's samples. Add or remove samples and re-analyze to update it."
                : "Add at least one sample, then analyze to build this profile."}
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

            <p className="mt-5 border-t border-border pt-5 text-xs text-foreground-subtle">
              This profile is available in the workspace — pick{" "}
              <span className="font-medium text-foreground">{data.name}</span> next to Mode when humanizing text.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
