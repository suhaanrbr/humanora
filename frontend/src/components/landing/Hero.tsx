import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { HumanoraRibbon } from "@/components/brand/HumanoraRibbon";

/**
 * Landing page hero. Headline, supporting copy, primary/secondary CTAs,
 * and the glowing product visual — no fabricated social proof.
 */
export function Hero() {
  return (
    <section id="hero" className="bg-ambient-glow bg-grid-texture relative overflow-hidden pb-12 pt-14 sm:pb-16 sm:pt-20">
      <div aria-hidden="true" className="bg-3d-floor" />
      <HumanoraRibbon
        className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-24 w-full -translate-y-1/2 opacity-[0.07] sm:block"
        animated
      />
      <Container className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <div className="max-w-xl">
          <h1 className="text-hero font-bold tracking-tight text-foreground">
            AI drafts.
            <br />
            <span className="text-brand-gradient text-brand-gradient-glow">Human impact.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground-muted">
            Humanora transforms AI text into natural, human writing that
            sounds like you.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/dashboard/humanize" variant="primary" size="lg">
              Humanize Text Now
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/#how-it-works" variant="secondary" size="lg">
              <PlayIcon className="h-4 w-4" />
              See It In Action
            </ButtonLink>
          </div>
        </div>

        <HeroVisual />
      </Container>
    </section>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 12h16m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9v6l5-3-5-3Z" fill="currentColor" />
    </svg>
  );
}
