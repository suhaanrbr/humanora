import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";

const ORIGINAL_TEXT =
  "I am writing to inform you that I will not be able to attend the meeting scheduled for tomorrow due to a personal commitment. I apologize for any inconvenience this may cause.";

const HUMANIZED_TEXT =
  "I won't be able to make tomorrow's meeting because of a personal commitment. Sorry for the inconvenience.";

/**
 * "See HUMANORA in action" — a static, fixed example. This section
 * intentionally does NOT call the AI backend: HUMANORA's humanization
 * endpoint requires a genuine authenticated account (protects the AI
 * quota and the conversion funnel — see /api/humanize). Visitors see
 * exactly what the product does here, then sign up to try it on their
 * own text with one complimentary transformation.
 */
export function LiveDemo() {
  return (
    <section className="bg-ambient-glow-soft section-glow-top py-16 sm:py-20">
      <Container>
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <Badge variant="brand">See it in action</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            See HUMANORA in action
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            An example of the kind of rewrite HUMANORA produces. Sign up
            free to try it on your own writing.
          </p>
        </Reveal>

        <Reveal
          as="div"
          delay={100}
          className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-border-strong bg-surface shadow-glow-md"
        >
          <div className="flex items-center gap-2 border-b border-border bg-background-elevated px-5 py-3 sm:px-7">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="ml-3 text-xs text-foreground-subtle">HUMANORA — Humanize</span>
          </div>

          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-7 sm:p-9">
              <p className="mb-5 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                Original draft
              </p>
              <p className="text-lg leading-relaxed text-foreground-muted">{ORIGINAL_TEXT}</p>
            </div>
            <div className="bg-background-elevated/40 p-7 sm:p-9">
              <p className="text-brand-gradient mb-5 text-xs font-semibold uppercase tracking-wide">
                HUMANORA result
              </p>
              <p className="text-lg leading-relaxed text-foreground">{HUMANIZED_TEXT}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background-elevated px-5 py-5 sm:px-7">
            <p className="text-xs text-foreground-subtle">
              Every account gets one complimentary transformation, free.
            </p>
            <ButtonLink href="/signup" variant="primary" size="md">
              Try it free
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
