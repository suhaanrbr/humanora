import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { voiceProfile, voiceSample } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import {
  analyzeVoiceSamples,
  applyOverrides,
  hashSamples,
  voiceStyleProfileSchema,
  type VoiceStyleProfile,
  type VoiceTrait,
} from "@/lib/ai/voiceAnalysis";

// Real limits, chosen to keep analysis meaningful and cheap: a sample
// too short doesn't carry enough signal, too many samples just burns
// tokens for diminishing returns.
export const MIN_SAMPLE_WORDS = 40;
export const MAX_SAMPLE_WORDS = 1200;
export const MAX_SAMPLES_PER_USER = 5;
export const MIN_SAMPLES_TO_ANALYZE = 1;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function getOrCreateVoiceProfile(userId: string) {
  const db = getDb();
  // Conflict-safe upsert against the unique userId constraint — see
  // entitlement.ts for why "select then insert if missing" races under
  // concurrent first requests.
  await db.insert(voiceProfile).values({ id: randomUUID(), userId }).onConflictDoNothing();
  const [row] = await db.select().from(voiceProfile).where(eq(voiceProfile.userId, userId));
  return row;
}

export async function listVoiceSamples(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(voiceSample)
    .where(eq(voiceSample.userId, userId))
    .orderBy(desc(voiceSample.createdAt));
}

export type AddSampleResult =
  | { ok: true; sample: typeof voiceSample.$inferSelect }
  | { ok: false; reason: "too_short" | "too_long" | "limit_reached" };

export async function addVoiceSample(userId: string, content: string): Promise<AddSampleResult> {
  const trimmed = content.trim();
  const words = wordCount(trimmed);
  if (words < MIN_SAMPLE_WORDS) return { ok: false, reason: "too_short" };
  if (words > MAX_SAMPLE_WORDS) return { ok: false, reason: "too_long" };

  const db = getDb();
  const existing = await listVoiceSamples(userId);
  if (existing.length >= MAX_SAMPLES_PER_USER) return { ok: false, reason: "limit_reached" };

  const [sample] = await db
    .insert(voiceSample)
    .values({ id: randomUUID(), userId, content: trimmed, wordCount: words })
    .returning();

  await getOrCreateVoiceProfile(userId);
  await db
    .update(voiceProfile)
    .set({
      sampleCount: existing.length + 1,
      totalWordsSubmitted: existing.reduce((sum, s) => sum + s.wordCount, 0) + words,
      updatedAt: new Date(),
    })
    .where(eq(voiceProfile.userId, userId));

  return { ok: true, sample };
}

/** Ownership-checked delete — a user can only ever delete their own sample. */
export async function deleteVoiceSample(userId: string, sampleId: string) {
  const db = getDb();
  await db.delete(voiceSample).where(and(eq(voiceSample.id, sampleId), eq(voiceSample.userId, userId)));

  const remaining = await listVoiceSamples(userId);
  await db
    .update(voiceProfile)
    .set({
      sampleCount: remaining.length,
      totalWordsSubmitted: remaining.reduce((sum, s) => sum + s.wordCount, 0),
      updatedAt: new Date(),
    })
    .where(eq(voiceProfile.userId, userId));
}

export type AnalyzeResult =
  | { ok: true; profile: VoiceStyleProfile; reused: boolean }
  | { ok: false; reason: "no_samples" | "analysis_failed" };

/**
 * Re-analyzes a user's current samples, UNLESS the sample set hasn't
 * changed since the last analysis (same ids + content) — in which case
 * the cached profile is returned with no Gemini call at all. This is
 * the cost guard: opening My Voice repeatedly, or clicking "Analyze"
 * again without adding anything new, never spends another request.
 */
export async function analyzeAndSaveVoiceProfile(userId: string): Promise<AnalyzeResult> {
  const db = getDb();
  const samples = await listVoiceSamples(userId);
  if (samples.length < MIN_SAMPLES_TO_ANALYZE) return { ok: false, reason: "no_samples" };

  const currentHash = hashSamples(samples);
  const profile = await getOrCreateVoiceProfile(userId);

  if (profile.analyzedSamplesHash === currentHash && profile.styleProfileJson) {
    const cached = voiceStyleProfileSchema.safeParse(JSON.parse(profile.styleProfileJson));
    if (cached.success) return { ok: true, profile: cached.data, reused: true };
    // Fall through to re-analyze if the cached JSON somehow no longer validates.
  }

  try {
    const analyzed = await analyzeVoiceSamples(samples.map((s) => s.content));
    await db
      .update(voiceProfile)
      .set({
        styleProfileJson: JSON.stringify(analyzed),
        analyzedSamplesHash: currentHash,
        analyzedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(voiceProfile.userId, userId));
    return { ok: true, profile: analyzed, reused: false };
  } catch (err) {
    console.error("[voice] analysis failed", err);
    return { ok: false, reason: "analysis_failed" };
  }
}

export async function saveVoiceOverrides(userId: string, overrides: Partial<Record<VoiceTrait, string>>) {
  const db = getDb();
  await getOrCreateVoiceProfile(userId);
  await db
    .update(voiceProfile)
    .set({ userOverridesJson: JSON.stringify(overrides), updatedAt: new Date() })
    .where(eq(voiceProfile.userId, userId));
}

/**
 * Resolves the effective style profile to use for a humanize call:
 * the analyzed profile with the user's overrides layered on top.
 * Returns null if the user has no analyzed profile yet — callers must
 * fall back to the generic (no-voice) prompt in that case.
 */
export async function getEffectiveVoiceProfile(userId: string): Promise<VoiceStyleProfile | null> {
  const profile = await getOrCreateVoiceProfile(userId);
  if (!profile.styleProfileJson) return null;
  const parsed = voiceStyleProfileSchema.safeParse(JSON.parse(profile.styleProfileJson));
  if (!parsed.success) return null;
  const overrides = profile.userOverridesJson
    ? (JSON.parse(profile.userOverridesJson) as Partial<Record<VoiceTrait, string>>)
    : null;
  return applyOverrides(parsed.data, overrides);
}

export function computeCompleteness(sampleCount: number): number {
  return Math.min(100, Math.round((sampleCount / MAX_SAMPLES_PER_USER) * 100));
}
