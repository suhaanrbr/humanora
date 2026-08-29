import { Container } from "@/components/ui/Container";

/**
 * Scene 7's opening beat: the deliberate "flatten" moment the master
 * spec calls for — after ConnectedWorkspaceScene's pull-back climax,
 * motion stops entirely, perspective and lighting simplify to nearly
 * nothing, and the page settles into ordinary flow for the rest of the
 * real, functional content below (UseCases, PreserveMeaning, Pricing,
 * Trust, FinalCta). No pin, no scrub, no GSAP — the calm itself is the
 * transition.
 */
export function ConversionIntro() {
  return (
    <section className="bg-[#04050c] py-8 text-center sm:py-10">
      <Container>
        <p className="font-mono text-[11px] tracking-[0.2em] text-white/35">08 / EVERYTHING, TOGETHER</p>
        <h2 className="mx-auto mt-4 max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
          One workspace. Real plans. No surprises.
        </h2>
      </Container>
    </section>
  );
}
