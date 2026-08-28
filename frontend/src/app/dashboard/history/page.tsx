import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { getRecentWork } from "@/lib/db/recentWork";
import { HistoryWorkspace } from "@/components/dashboard/HistoryWorkspace";

export const metadata = { title: "Library — HUMANORA" };

/**
 * Library is now HUMANORA's real memory of a user's work — both
 * Humanize output AND persisted Study sessions (Study used to be
 * stateless; see schema.ts's study_session table), not just
 * humanizations. 500 (not the old 200) since it's now covering two
 * content types and each table's own real cap is 500 — see
 * MAX_HISTORY_PER_USER / MAX_SESSIONS_PER_USER in history.ts/study.ts.
 */
export default async function LibraryPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");

  const items = await getRecentWork(result.session.user.id, 1000);

  return (
    <Container className="mx-auto max-w-5xl">
      <HistoryWorkspace initialEntries={items} />
    </Container>
  );
}
