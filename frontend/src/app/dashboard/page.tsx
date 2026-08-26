import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { getUsageSummary } from "@/lib/db/usage";
import { getHistoryForUser } from "@/lib/db/history";
import { getOrCreateVoiceProfile, computeCompleteness } from "@/lib/db/voice";
import { getUserPlan, getFreeTrialStatus } from "@/lib/db/entitlement";

export const metadata = { title: "Dashboard — HUMANORA" };

export default async function DashboardPage() {
  // Layout already redirected if there's no valid session — this is
  // guaranteed non-null here.
  const session = (await auth.api.getSession({ headers: await headers() }))!;
  const userId = session.user.id;
  const plan = await getUserPlan(userId);

  // Each data source degrades independently — a database hiccup on one
  // (e.g. usage) shouldn't take down the whole dashboard.
  const [usage, history, voice, freeTrial] = await Promise.allSettled([
    getUsageSummary(userId, plan),
    getHistoryForUser(userId, 10),
    getOrCreateVoiceProfile(userId),
    getFreeTrialStatus(userId),
  ]);

  return (
    <Container className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-foreground-muted">Welcome back,</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{session.user.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ButtonLink href="/dashboard/humanize" variant="primary" size="sm">
            Humanize text
          </ButtonLink>
          <SignOutButton />
        </div>
      </div>

      {/* Usage */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
          Usage this month
        </h2>
        {usage.status === "fulfilled" && freeTrial.status === "fulfilled" ? (
          <Card className="p-6">
            {plan === "free" ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-muted">Complimentary humanization</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {freeTrial.value.used ? "Used" : "Available"}
                    </p>
                  </div>
                  <Badge variant="brand">Free plan</Badge>
                </div>
                <p className="mt-3 text-xs text-foreground-subtle">
                  {freeTrial.value.used
                    ? "You've used your one complimentary transformation. Upgrade to keep writing with HUMANORA."
                    : `Every account gets one complimentary humanization, up to 200 characters.`}
                </p>
                {freeTrial.value.used && (
                  <div className="mt-4">
                    <ButtonLink href="/#pricing" variant="primary" size="sm">
                      View plans
                    </ButtonLink>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-muted">Humanizations</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {usage.value.humanizeCount} / {usage.value.humanizeLimit}
                    </p>
                  </div>
                  <Badge variant="brand" className="capitalize">
                    {usage.value.plan} plan
                  </Badge>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-border">
                  <div
                    className="bg-brand-gradient h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (usage.value.humanizeCount / usage.value.humanizeLimit) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-3 text-xs text-foreground-subtle">
                  {usage.value.wordsProcessed} words processed this period. Resets{" "}
                  {usage.value.periodEnd.toLocaleDateString()}.
                </p>
              </>
            )}
          </Card>
        ) : (
          <ErrorCard message="Couldn't load usage right now." />
        )}
      </section>

      {/* My Voice */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">My Voice</h2>
          <Badge variant={voice.status === "fulfilled" && voice.value.styleProfileJson ? "brand" : "neutral"}>
            {voice.status === "fulfilled" && voice.value.styleProfileJson ? "Profile ready" : "Not set up"}
          </Badge>
        </div>
        {voice.status === "fulfilled" ? (
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {computeCompleteness(voice.value.sampleCount)}%
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  {voice.value.sampleCount === 0
                    ? "No writing samples yet."
                    : `${voice.value.sampleCount} sample(s) · ${
                        voice.value.styleProfileJson ? "voice profile analyzed" : "not yet analyzed"
                      }`}
                </p>
                <p className="mt-1 text-xs text-foreground-subtle">
                  Teach HUMANORA how you write, then apply it when humanizing text on a paid plan.
                </p>
              </div>
              <ButtonLink href="/dashboard/voice" variant="secondary" size="sm">
                {voice.value.sampleCount === 0 ? "Get started" : "Open"}
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <ErrorCard message="Couldn't load your Voice profile right now." />
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
          Recent history
        </h2>
        {history.status === "fulfilled" ? (
          history.value.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-foreground-muted">No writing history yet.</p>
              <p className="mt-1 text-xs text-foreground-subtle">
                Your recent HUMANORA transformations will appear here.
              </p>
              <div className="mt-4 flex justify-center">
                <ButtonLink href="/dashboard/humanize" variant="secondary" size="sm">
                  Humanize your first draft
                </ButtonLink>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {history.value.map((entry) => (
                <Card key={entry.id} className="p-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-foreground-subtle">
                    <span className="capitalize">
                      {entry.mode} · {entry.strength}
                    </span>
                    <span>{entry.createdAt.toLocaleString()}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-foreground-muted">{entry.outputText}</p>
                </Card>
              ))}
            </div>
          )
        ) : (
          <ErrorCard message="Couldn't load your history right now." />
        )}
      </section>

      <p className="text-center text-xs text-foreground-subtle">
        Need something else?{" "}
        <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
          Contact us
        </Link>
      </p>
    </Container>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-danger/30 bg-danger/5 p-6 text-center">
      <p className="text-sm text-foreground-muted">{message}</p>
      <p className="mt-1 text-xs text-foreground-subtle">Please refresh, or try again shortly.</p>
    </Card>
  );
}
