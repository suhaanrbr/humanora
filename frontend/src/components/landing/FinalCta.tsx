import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Final marketing call-to-action ahead of the footer — the emotional
 * closing moment of the page. Each headline line reveals in sequence,
 * with "Your voice." given the strongest gradient treatment.
 *
 * This panel is intentionally always a deep-midnight surface, regardless
 * of the active site theme (Light or Dark) — a deliberate "one cinematic
 * dark moment inside Light Mode" per HUMANORA's Aurora Intelligence direction,
 * so it uses fixed colors here rather than the theme's semantic tokens.
 */
export function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#14101f] px-6 py-20 text-center shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] sm:px-16 sm:py-24">
          <div
            aria-hidden="true"
            className="animate-pulse-slow absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8a3ff0]/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="animate-pulse-slower absolute left-1/3 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5a3fe0]/25 blur-3xl"
          />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-[#f8f7fc] sm:text-4xl lg:text-5xl">
              <Reveal as="span" className="block">
                Your ideas.
              </Reveal>
              <Reveal as="span" delay={150} className="block">
                Your meaning.
              </Reveal>
              <Reveal as="span" delay={300} className="block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #8cc8ff, #9d5cff, #cdb8ff)",
                  }}
                >
                  Your voice.
                </span>
              </Reveal>
            </h2>
            <Reveal as="p" delay={450} className="mx-auto mt-5 max-w-xl text-base text-[#c6c2d9]">
              Let AI help with the draft. Let HUMANORA help make the writing
              yours.
            </Reveal>
            <Reveal
              as="div"
              delay={550}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <ButtonLink href="/#try-it" variant="primary" size="lg">
                Start Writing Free
              </ButtonLink>
              <a
                href="#how-it-works"
                className="focus-ring press-feedback inline-flex h-12 items-center justify-center rounded-md border border-white/15 bg-white/5 px-6 text-base font-medium text-[#f8f7fc] transition-colors hover:border-white/25 hover:bg-white/10"
              >
                See How It Works
              </a>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
