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
export const MAX_SAMPLES_PER_PROFILE = 5;
export const MIN_SAMPLES_TO_ANALYZE = 1;

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** All of a user's Voice profiles, default first, then most recently updated. */
export async function listVoiceProfiles(userId: string) {
  const db = getDb();
  const rows = await db.select().from(voiceProfile).where(eq(voiceProfile.userId, userId));
  return rows.sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
}

/** Ownership-checked single-profile lookup — returns null if it doesn't exist or belongs to someone else. */
export async function getOwnedVoiceProfile(userId: string, profileId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(voiceProfile)
    .where(and(eq(voiceProfile.id, profileId), eq(voiceProfile.userId, userId)));
  return row ?? null;
}

/** The profile to use when none is explicitly specified — the user's default, or their only profile. */
export async function getDefaultVoiceProfile(userId: string) {
  const profiles = await listVoiceProfiles(userId);
  return profiles[0] ?? null; // listVoiceProfiles already sorts default-first
}

export type CreateProfileResult =
  | { ok: true; profile: typeof voiceProfile.$inferSelect }
  | { ok: false; reason: "limit_reached" };

/** Server-enforced: a plan's maxVoiceProfiles caps how many profiles a user may own at once. */
export async function createVoiceProfile(
  userId: string,
  name: string,
  maxProfiles: number
): Promise<CreateProfileResult> {
  const db = getDb();
  const existing = await listVoiceProfiles(userId);
  if (existing.length >= maxProfiles) return { ok: false, reason: "limit_reached" };

  const [profile] = await db
    .insert(voiceProfile)
    .values({ id: randomUUID(), userId, name: name.trim() || "My Voice", isDefault: existing.length === 0 })
    .returning();
  return { ok: true, profile };
}

export async function renameVoiceProfile(userId: string, profileId: string, name: string) {
  const db = getDb();
  await db
    .update(voiceProfile)
    .set({ name: name.trim() || "My Voice", updatedAt: new Date() })
    .where(and(eq(voiceProfile.id, profileId), eq(voiceProfile.userId, userId)));
}

/** Exactly one profile is ever default — this unsets any previous default before setting the new one. */
export async function setDefaultVoiceProfile(userId: string, profileId: string) {
  const db = getDb();
  const owned = await getOwnedVoiceProfile(userId, profileId);
  if (!owned) return; // silently no-op on an id that isn't (or isn't yours) — same pattern as delete
  await db.update(voiceProfile).set({ isDefault: false }).where(eq(voiceProfile.userId, userId));
  await db.update(voiceProfile).set({ isDefault: true, updatedAt: new Date() }).where(eq(voiceProfile.id, profileId));
}

/** Deletes a profile (cascades its samples). If it was the default, promotes another remaining profile if any. */
export async function deleteVoiceProfile(userId: string, profileId: string) {
  const db = getDb();
  const owned = await getOwnedVoiceProfile(userId, profileId);
  if (!owned) return;
  await db.delete(voiceProfile).where(and(eq(voiceProfile.id, profileId), eq(voiceProfile.userId, userId)));

  if (owned.isDefault) {
    const remaining = await listVoiceProfiles(userId);
    if (remaining.length > 0) {
      await db.update(voiceProfile).set({ isDefault: true }).where(eq(voiceProfile.id, remaining[0].id));
    }
  }
}

export async function listVoiceSamples(profileId: string) {
  const db = getDb();
  return db
    .select()
    .from(voiceSample)
    .where(eq(voiceSample.profileId, profileId))
    .orderBy(desc(voiceSample.createdAt));
}

export type AddSampleResult =
  | { ok: true; sample: typeof voiceSample.$inferSelect }
  | { ok: false; reason: "too_short" | "too_long" | "limit_reached" | "not_found" };

export async function addVoiceSample(userId: string, profileId: string, content: string): Promise<AddSampleResult> {
  const profile = await getOwnedVoiceProfile(userId, profileId);
  if (!profile) return { ok: false, reason: "not_found" };

  const trimmed = content.trim();
  const words = wordCount(trimmed);
  if (words < MIN_SAMPLE_WORDS) return { ok: false, reason: "too_short" };
  if (words > MAX_SAMPLE_WORDS) return { ok: false, reason: "too_long" };

  const db = getDb();
  const existing = await listVoiceSamples(profileId);
  if (existing.length >= MAX_SAMPLES_PER_PROFILE) return { ok: false, reason: "limit_reached" };

  const [sample] = await db
    .insert(voiceSample)
    .values({ id: randomUUID(), userId, profileId, content: trimmed, wordCount: words })
    .returning();

  await db
    .update(voiceProfile)
    .set({
      sampleCount: existing.length + 1,
      totalWordsSubmitted: existing.reduce((sum, s) => sum + s.wordCount, 0) + words,
      updatedAt: new Date(),
    })
    .where(eq(voiceProfile.id, profileId));

  return { ok: true, sample };
}

/** Ownership-checked delete — a user can only ever delete their own sample. */
export async function deleteVoiceSample(userId: string, profileId: string, sampleId: string) {
  const db = getDb();
  await db
    .delete(voiceSample)
    .where(and(eq(voiceSample.id, sampleId), eq(voiceSample.userId, userId), eq(voiceSample.profileId, profileId)));

  const remaining = await listVoiceSamples(profileId);
  await db
    .update(voiceProfile)
    .set({
      sampleCount: remaining.length,
      totalWordsSubmitted: remaining.reduce((sum, s) => sum + s.wordCount, 0),
      updatedAt: new Date(),
    })
    .where(eq(voiceProfile.id, profileId));
}

export type AnalyzeResult =
  | { ok: true; profile: VoiceStyleProfile; reused: boolean }
  | { ok: false; reason: "no_samples" | "analysis_failed" | "not_found" };

/**
 * Re-analyzes a profile's current samples, UNLESS the sample set hasn't
 * changed since the last analysis (same ids + content) — in which case
 * the cached profile is returned with no Gemini call at all. This is
 * the cost guard: opening My Voice repeatedly, or clicking "Analyze"
 * again without adding anything new, never spends another request.
 */
export async function analyzeAndSaveVoiceProfile(userId: string, profileId: string): Promise<AnalyzeResult> {
  const db = getDb();
  const profile = await getOwnedVoiceProfile(userId, profileId);
  if (!profile) return { ok: false, reason: "not_found" };

  const samples = await listVoiceSamples(profileId);
  if (samples.length < MIN_SAMPLES_TO_ANALYZE) return { ok: false, reason: "no_samples" };

  const currentHash = hashSamples(samples);

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
      .where(eq(voiceProfile.id, profileId));
    return { ok: true, profile: analyzed, reused: false };
  } catch (err) {
    console.error("[voice] analysis failed", err);
    return { ok: false, reason: "analysis_failed" };
  }
}

export async function saveVoiceOverrides(userId: string, profileId: string, overrides: Partial<Record<VoiceTrait, string>>) {
  const db = getDb();
  const owned = await getOwnedVoiceProfile(userId, profileId);
  if (!owned) return;
  await db
    .update(voiceProfile)
    .set({ userOverridesJson: JSON.stringify(overrides), updatedAt: new Date() })
    .where(eq(voiceProfile.id, profileId));
}

/**
 * Resolves the effective style profile to use for a humanize call, for
 * the AUTHENTICATED user only. `profileId` is optional — omit it to use
 * the user's default profile. Returns null if there's no analyzed
 * profile to use (no profiles yet, or the specified/default one hasn't
 * been analyzed). Never trusts a profileId belonging to someone else —
 * getOwnedVoiceProfile's WHERE clause makes that structurally
 * impossible to return.
 */
export async function getEffectiveVoiceProfile(
  userId: string,
  profileId?: string | null
): Promise<VoiceStyleProfile | null> {
  const profile = profileId ? await getOwnedVoiceProfile(userId, profileId) : await getDefaultVoiceProfile(userId);
  if (!profile || !profile.styleProfileJson) return null;

  const parsed = voiceStyleProfileSchema.safeParse(JSON.parse(profile.styleProfileJson));
  if (!parsed.success) return null;
  const overrides = profile.userOverridesJson
    ? (JSON.parse(profile.userOverridesJson) as Partial<Record<VoiceTrait, string>>)
    : null;
  return applyOverrides(parsed.data, overrides);
}

export function computeCompleteness(sampleCount: number): number {
  return Math.min(100, Math.round((sampleCount / MAX_SAMPLES_PER_PROFILE) * 100));
}

/** Lightweight summary used anywhere that just needs "does My Voice have anything set up" (dashboard, account, humanize workspace) without fetching full profile detail. */
export async function getVoiceOverview(userId: string) {
  const profiles = await listVoiceProfiles(userId);
  return {
    profiles: profiles.map((p) => ({ id: p.id, name: p.name, isDefault: p.isDefault, ready: !!p.styleProfileJson })),
    profileCount: profiles.length,
    totalSampleCount: profiles.reduce((sum, p) => sum + p.sampleCount, 0),
    hasAnalyzedProfile: profiles.some((p) => !!p.styleProfileJson),
  };
}
