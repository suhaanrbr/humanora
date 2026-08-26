import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/brand/Logo";

/**
 * Temporary design-system showcase page (Phase 2).
 *
 * This is NOT the HUMANORA landing page — it exists only to visually verify
 * the design foundation (tokens + primitives) before the real landing page
 * and application are built in later phases.
 */
export default function DesignSystemShowcase() {
  return (
    <main className="bg-ambient-glow min-h-screen">
      <Container className="flex flex-col gap-16 py-16">
        <header className="flex flex-col items-start gap-3">
          <Badge variant="brand">Phase 2 · Design System Preview</Badge>
          <Logo size="lg" />
          <p className="max-w-xl text-sm text-foreground-muted">
            This page is a temporary internal preview of the HUMANORA design
            foundation — not the final landing page or application.
          </p>
        </header>

        <section aria-labelledby="typography-heading" className="flex flex-col gap-6">
          <h2 id="typography-heading" className="text-sm font-medium uppercase tracking-wide text-foreground-subtle">
            Typography
          </h2>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              AI drafts. <span className="text-brand-gradient">Human impact.</span>
            </h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Section heading example
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-foreground-muted">
              Body copy uses a muted foreground tone to sit comfortably against
              the deep navy background while keeping headings and primary text
              crisp and legible.
            </p>
          </div>
        </section>

        <section aria-labelledby="buttons-heading" className="flex flex-col gap-6">
          <h2 id="buttons-heading" className="text-sm font-medium uppercase tracking-wide text-foreground-subtle">
            Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Humanize Text Now</Button>
            <Button variant="secondary">See It In Action</Button>
            <Button variant="ghost">Learn more</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        <section aria-labelledby="inputs-heading" className="flex flex-col gap-6">
          <h2 id="inputs-heading" className="text-sm font-medium uppercase tracking-wide text-foreground-subtle">
            Inputs
          </h2>
          <div className="max-w-sm">
            <Input placeholder="you@example.com" type="email" aria-label="Email address" />
          </div>
        </section>

        <section aria-labelledby="badges-heading" className="flex flex-col gap-6">
          <h2 id="badges-heading" className="text-sm font-medium uppercase tracking-wide text-foreground-subtle">
            Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="brand">BETA</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Limited</Badge>
          </div>
        </section>

        <section aria-labelledby="cards-heading" className="flex flex-col gap-6">
          <h2 id="cards-heading" className="text-sm font-medium uppercase tracking-wide text-foreground-subtle">
            Cards
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Humanizer</CardTitle>
                <CardDescription>
                  Make AI text sound natural and authentic.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted">
                  Card body content sits here — used for feature tiles,
                  dashboard panels, and pricing tiers.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-glow-sm">
              <CardHeader>
                <CardTitle>My Voice</CardTitle>
                <CardDescription>
                  Train HUMANORA to write in your unique style.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-foreground-muted">
                  <span className="bg-brand-gradient h-2 w-2 rounded-full" />
                  Glow variant for highlighted cards
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meaning Preservation</CardTitle>
                <CardDescription>
                  Keep facts, quotes, and citations intact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground-muted">
                  Standard card, no glow — used for most content.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section aria-labelledby="gradient-heading" className="flex flex-col gap-6">
          <h2 id="gradient-heading" className="text-sm font-medium uppercase tracking-wide text-foreground-subtle">
            Gradient &amp; Glow
          </h2>
          <div className="bg-brand-gradient shadow-glow-md flex h-32 w-full max-w-md items-center justify-center rounded-lg text-sm font-medium text-white">
            Brand gradient surface with ambient glow
          </div>
        </section>
      </Container>
    </main>
  );
}
