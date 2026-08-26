import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getHistoryForUser } from "@/lib/db/history";
import { ReuseButton } from "@/components/dashboard/ReuseButton";

export const metadata = { title: "History — HUMANORA" };

export default async function HistoryPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");

  const history = await getHistoryForUser(result.session.user.id, 100);

  return (
    <Container className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">History</h1>
        <p className="mt-1 text-sm text-foreground-muted">Your last {history.length} humanizations.</p>
      </div>

      {history.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-foreground-muted">No writing history yet.</p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href="/dashboard/humanize" variant="secondary" size="sm">
              Humanize your first draft
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((entry) => (
            <Card key={entry.id} className="p-5">
              <div className="mb-2 flex items-center justify-between text-xs text-foreground-subtle">
                <span className="capitalize">
                  {entry.mode} · {entry.strength}
                </span>
                <span>{entry.createdAt.toLocaleString()}</span>
              </div>
              <p className="line-clamp-3 text-sm text-foreground-muted">{entry.outputText}</p>
              <div className="mt-3">
                <ReuseButton text={entry.inputText} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
