import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { getHistoryForUser } from "@/lib/db/history";
import { HistoryWorkspace } from "@/components/dashboard/HistoryWorkspace";

export const metadata = { title: "History — HUMANORA" };

export default async function HistoryPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");

  const history = await getHistoryForUser(result.session.user.id, 200);

  return (
    <Container className="mx-auto max-w-3xl">
      <HistoryWorkspace
        initialEntries={history.map((h) => ({
          id: h.id,
          mode: h.mode,
          strength: h.strength,
          inputText: h.inputText,
          outputText: h.outputText,
          wordCount: h.wordCount,
          createdAt: h.createdAt.toISOString(),
        }))}
      />
    </Container>
  );
}
