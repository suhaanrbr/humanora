import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * Shared "not built yet" surface for nav destinations that exist in the
 * dashboard-redesign plan but haven't shipped their real feature (schema
 * + logic) yet — Projects, Templates, AI Detector, Chat with Docs, Brand
 * Voice, Integrations each render this until their own phase lands. The
 * nav entry and route are real; the content deliberately does NOT
 * fabricate data (fake stats, fake history) to look finished before it is.
 */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <Container className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-sm font-medium text-foreground">Coming soon</p>
        <p className="max-w-sm text-sm text-foreground-muted">
          This is on the roadmap and not built yet — nothing here is faked to look finished
          before it is.
        </p>
        <ButtonLink href="/dashboard" variant="secondary" size="sm" className="mt-2">
          Back to Home
        </ButtonLink>
      </Card>
    </Container>
  );
}
