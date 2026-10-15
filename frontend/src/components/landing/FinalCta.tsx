import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";

/**
 * The closing statement before the footer. A large headline set like
 * a pull quote, one primary action, nothing decorative behind it.
 */
export function FinalCta() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="border-t border-border-strong pt-14 text-center">
          <h2 className="text-hero mx-auto max-w-4xl text-foreground">
            The draft was the machine&apos;s.
            <br />
            <em className="text-brand-purple">The final word is yours.</em>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-xl leading-relaxed text-foreground-muted">
            Paste something you&apos;ve been meaning to fix. Your first rewrite is on us.
          </p>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/signup" variant="primary" size="lg">
              Start writing free
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
