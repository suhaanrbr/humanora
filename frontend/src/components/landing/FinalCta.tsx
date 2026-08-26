import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Final marketing call-to-action ahead of the footer.
 */
export function FinalCta() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="bg-ambient-glow relative overflow-hidden rounded-xl border border-border-strong bg-surface px-6 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to write with{" "}
            <span className="text-brand-gradient">human impact</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-foreground-muted">
            Bring your next AI-assisted draft and see how it reads once
            HUMANORA is done with it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="lg">
              Humanize Text Now
            </Button>
            <Button variant="secondary" size="lg">
              See It In Action
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
