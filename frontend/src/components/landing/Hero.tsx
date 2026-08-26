import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroVisual } from "@/components/landing/HeroVisual";

/**
 * Landing page hero. Headline, supporting copy, primary/secondary CTAs,
 * and the glowing product visual — no fabricated social proof.
 */
export function Hero() {
  return (
    <section className="bg-ambient-glow relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            AI drafts.
            <br />
            <span className="text-brand-gradient">Human impact.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground-muted">
            Humanora transforms AI-assisted drafts into clear, natural writing
            while preserving your meaning, facts, and voice.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg">
              Humanize Text Now
            </Button>
            <Button variant="secondary" size="lg">
              See It In Action
            </Button>
          </div>
        </div>

        <HeroVisual />
      </Container>
    </section>
  );
}
