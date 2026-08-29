import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { detectorScan } from "@/lib/db/schema";
import type { DetectorResult, DetectorLikelihood, DetectorConfidence } from "@/lib/ai/detector";
import { randomUUID } from "crypto";

// Same cap philosophy as MAX_HISTORY_PER_USER/MAX_SESSIONS_PER_USER —
// a real ceiling on stored rows, not a usage quota (checkAndReserveQuota
// already owns that).
const MAX_SCANS_PER_USER = 200;

export interface SaveDetectorScanInput {
  userId: string;
  inputText: string;
  wordCount: number;
  result: DetectorResult;
}

export async function saveDetectorScan(input: SaveDetectorScanInput): Promise<string> {
  const db = getDb();
  const id = randomUUID();
  await db.insert(detectorScan).values({
    id,
    userId: input.userId,
    inputText: input.inputText,
    wordCount: input.wordCount,
    likelihood: input.result.likelihood,
    confidence: input.result.confidence,
    aiSignalsJson: JSON.stringify(input.result.aiSignals),
    humanSignalsJson: JSON.stringify(input.result.humanSignals),
    explanation: input.result.explanation,
  });

  const rows = await db
    .select({ id: detectorScan.id })
    .from(detectorScan)
    .where(eq(detectorScan.userId, input.userId))
    .orderBy(desc(detectorScan.createdAt));

  if (rows.length > MAX_SCANS_PER_USER) {
    const staleIds = rows.slice(MAX_SCANS_PER_USER).map((r) => r.id);
    for (const staleId of staleIds) {
      await db.delete(detectorScan).where(eq(detectorScan.id, staleId));
    }
  }

  return id;
}

export interface DetectorScanSummary {
  id: string;
  inputText: string;
  wordCount: number;
  likelihood: DetectorLikelihood;
  confidence: DetectorConfidence;
  aiSignals: string[];
  humanSignals: string[];
  explanation: string;
  createdAt: Date;
}

/** Scoped by userId at the query level — same ownership pattern as history.ts/study.ts. */
export async function getDetectorScansForUser(userId: string, limit = 20): Promise<DetectorScanSummary[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(detectorScan)
    .where(eq(detectorScan.userId, userId))
    .orderBy(desc(detectorScan.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    inputText: r.inputText,
    wordCount: r.wordCount,
    likelihood: r.likelihood as DetectorLikelihood,
    confidence: r.confidence as DetectorConfidence,
    aiSignals: JSON.parse(r.aiSignalsJson) as string[],
    humanSignals: JSON.parse(r.humanSignalsJson) as string[],
    explanation: r.explanation,
    createdAt: r.createdAt,
  }));
}

export async function deleteDetectorScan(userId: string, scanId: string) {
  const db = getDb();
  await db.delete(detectorScan).where(and(eq(detectorScan.id, scanId), eq(detectorScan.userId, userId)));
}
