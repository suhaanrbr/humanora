import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { voiceProfile } from "@/lib/db/schema";
import { randomUUID } from "crypto";

/**
 * My Voice — Phase 2 foundation only. There is no sample-upload endpoint
 * yet (the My Voice UI remains an honest mock until that exists — see
 * MyVoicePreview.tsx). This module exists so the dashboard can show a
 * real "0 samples, 0% complete" state for a new account instead of the
 * landing page's illustrative 78%/3-sample mock.
 *
 * `completeness` is a placeholder heuristic (not real writing-style
 * analysis) — every 3 samples counts as one "step" toward 100%, capped.
 * Replacing this with genuine analysis is Phase 3 work; this table's
 * shape doesn't need to change for that.
 */
export async function getOrCreateVoiceProfile(userId: string) {
  const db = getDb();
  // Conflict-safe upsert against the unique userId constraint — see
  // entitlement.ts for why "select then insert if missing" races under
  // concurrent first requests.
  await db.insert(voiceProfile).values({ id: randomUUID(), userId }).onConflictDoNothing();
  const [row] = await db.select().from(voiceProfile).where(eq(voiceProfile.userId, userId));
  return row;
}

export function computeCompleteness(sampleCount: number): number {
  return Math.min(100, Math.round((sampleCount / 3) * 100));
}
