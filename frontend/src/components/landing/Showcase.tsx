import { Container } from "@/components/ui/Container";
import { Carousel } from "@/components/ui/Carousel";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { SHOWCASE_EXAMPLES, wordCount, wordsCutPercent, type ShowcaseExample } from "@/lib/config/showcase";

/**
 * "In practice": a carousel of before-and-after edits across the kinds
 * of documents people actually bring (cover letters, lab reports, work
 * email). The hero shows one paragraph in every mode; this shows the
 * range of real work, one document at a time, with the next one peeking
 * in from the right.
 */
export function Showcase() {
  return (
    <section id="in-practice" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="In practice" title="Whatever you’re writing, the facts stay put.">
          <p>
            Five kinds of draft people write with AI, and how Humanora would edit each one. Swipe, use the
            arrows, or let it play.
          </p>
        </SectionHeader>

        <div className="mt-14 lg:ml-[25%] lg:pl-10">
          <Carousel
            label="Before and after examples"
            autoplay={7000}
            slideClassName="w-[90%] sm:w-[82%] xl:w-[74%]"
            trackClassName="gap-5"
          >
            {SHOWCASE_EXAMPLES.map((example) => (
              <ShowcaseSlide key={example.kind} example={example} />
            ))}
          </Carousel>
        </div>
      </Container>
    </section>
  );
}

function ShowcaseSlide({ example }: { example: ShowcaseExample }) {
  const cut = wordsCutPercent(example);
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-9">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="eyebrow">{example.kind}</p>
        <span className="h-3 w-px bg-border-strong" aria-hidden="true" />
        <p className="text-sm text-foreground-muted">{example.mode} mode</p>
      </header>

      <p className="mt-6 text-base leading-relaxed sm:text-lg">
        <span className="sr-only">Draft: </span>
        <span className="mark-strike">{example.before}</span>
      </p>

      <p className="mt-6 flex-1 border-t border-border pt-6 font-display text-2xl leading-snug text-foreground sm:text-[1.75rem]">
        <span className="sr-only">Humanora&apos;s edit: </span>
        {example.after}
      </p>

      <footer className="mt-8 grid grid-cols-1 gap-4 border-t border-border pt-5 text-sm sm:grid-cols-[auto_1fr] sm:gap-10">
        <p className="tabular-nums text-foreground-muted">
          {wordCount(example.before)} → {wordCount(example.after)} words
          <span className="ml-2 font-semibold text-brand-purple">−{cut}%</span>
        </p>
        <p className="text-foreground-subtle">
          Kept exactly:{" "}
          {example.kept.map((fact, i) => (
            <span key={fact}>
              {i > 0 && " · "}
              <span className="mark-keep">{fact}</span>
            </span>
          ))}
        </p>
      </footer>
    </article>
  );
}
