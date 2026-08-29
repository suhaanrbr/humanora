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

          {/* The H returns — the same geometry the page opened on,
              settled and resolved rather than dimensional/in-motion,
              closing the visual sentence the arrival scene opened. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] max-h-[560px] max-w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          >
            <rect x="30" y="65" width="35" height="105" rx="6" fill="none" stroke="#cdb8ff" strokeWidth="1" />
            <rect x="135" y="25" width="35" height="145" rx="6" fill="none" stroke="#cdb8ff" strokeWidth="1" />
            <polygon points="65,95 135,60 135,90 65,125" fill="none" stroke="#cdb8ff" strokeWidth="1" strokeLinejoin="round" />
          </svg>

          <div className="relative">
            <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-white/35">13 / CONCLUSION</p>
            <h2 className="text-3xl font-bold tracking-tight text-[#f8f7fc] sm:text-4xl lg:text-5xl">
              <Reveal as="span" className="block">
                The draft was AI&apos;s.
              </Reveal>
              <Reveal as="span" delay={150} className="block">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #8cc8ff, #9d5cff, #cdb8ff)",
                  }}
                >
                  The voice is yours.
                </span>
              </Reveal>
            </h2>
            <Reveal as="p" delay={350} className="mx-auto mt-5 max-w-xl text-base text-[#c6c2d9]">
              Same facts. Same meaning. Writing that finally sounds like you
              wrote it — because by the time HUMANORA is done, you basically did.
            </Reveal>
            <Reveal
              as="div"
              delay={550}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <ButtonLink href="/dashboard/humanize" variant="primary" size="lg">
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
