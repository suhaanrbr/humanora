import { getHistoryForUser } from "@/lib/db/history";
import { getStudySessionsForUser } from "@/lib/db/study";

export type RecentWorkItem =
  | {
      kind: "humanized";
      id: string;
      mode: string;
      strength: string;
      inputText: string;
      outputText: string;
      createdAt: string;
    }
  | {
      kind: "study";
      id: string;
      mode: string;
      inputText: string;
      outputText: string;
      createdAt: string;
    };

/**
 * Merges the two real content tables (humanization, study_session) into
 * one chronological feed — this is what "Recent Work" and "Recent
 * Activity" both draw from. No `project`/`document`/`voice` rows are
 * mixed in yet (those either don't exist as distinct tables — see
 * schema.ts — or aren't "content" in the same sense), so the Recent Work
 * tabs for Documents/Voice/Projects stay disabled until their own phase.
 */
export async function getRecentWork(userId: string, limit = 20): Promise<RecentWorkItem[]> {
  const [humanizations, studySessions] = await Promise.all([
    getHistoryForUser(userId, limit),
    getStudySessionsForUser(userId, limit),
  ]);

  const items: RecentWorkItem[] = [
    ...humanizations.map((h) => ({
      kind: "humanized" as const,
      id: h.id,
      mode: h.mode,
      strength: h.strength,
      inputText: h.inputText,
      outputText: h.outputText,
      createdAt: h.createdAt.toISOString(),
    })),
    ...studySessions.map((s) => ({
      kind: "study" as const,
      id: s.id,
      mode: s.mode,
      inputText: s.inputText,
      outputText: s.outputText,
      createdAt: s.createdAt.toISOString(),
    })),
  ];

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, limit);
}
