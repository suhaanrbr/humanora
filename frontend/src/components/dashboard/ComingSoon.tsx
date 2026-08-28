import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { ReactElement } from "react";

/**
 * Shared "not built yet" surface for nav destinations that exist in the
 * dashboard-redesign plan but haven't shipped their real feature (schema
 * + logic) yet — Projects, Templates, AI Detector, Chat with Docs, Brand
 * Voice, Integrations each render this until their own phase lands. The
 * nav entry and route are real; the content deliberately does NOT
 * fabricate data (fake stats, fake history) to look finished before it
 * is — but "honest" and "looks like a dead template page" aren't the
 * same thing, so this reads as a considered preview of what's coming
 * rather than an error state: a lit icon stage, a real one-line
 * description of the capability, and a concrete "In development" status
 * rather than a vague "Coming soon" with nothing behind it.
 */
export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: (props: { className?: string }) => ReactElement;
}) {
  return (
    <Container className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <Card className="glass-panel relative overflow-hidden p-10 text-center sm:p-14">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--mesh-1)" }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-center gap-4">
          <span className="icon-chip h-16 w-16 shadow-glow-sm">
            <Icon className="h-7 w-7" />
          </span>
          <Badge variant="brand">In development</Badge>
          <p className="max-w-sm text-sm text-foreground-muted">
            This is on the roadmap and not built yet — nothing here is faked to look finished
            before it is.
          </p>
          <ButtonLink href="/dashboard" variant="secondary" size="sm" className="mt-2">
            Back to Home
          </ButtonLink>
        </div>
      </Card>
    </Container>
  );
}
