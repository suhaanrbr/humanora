import { Carousel } from "@/components/ui/Carousel";
import { SHOWCASE_EXAMPLES, wordsCutPercent } from "@/lib/config/showcase";

// The sign-in panel's original worked edit leads; three of the homepage
// examples follow, so a visitor waiting on a form sees the product's
// range rather than one sentence.
const SLIDES = [
  {
    kind: "Report",
    before: "It is important to note that the results of the study were very significant in nature.",
    after: "The results were significant.",
    caption:
      "Same finding, a quarter of the words. Humanora edits AI-assisted drafts into writing that sounds like you, and keeps every fact where you left it.",
  },
  ...SHOWCASE_EXAMPLES.filter((e) => ["Work email", "Lab report", "Cover letter"].includes(e.kind)).map((e) => ({
    kind: e.kind,
    before: e.before,
    after: e.after,
    caption: `${e.mode} mode, ${wordsCutPercent(e)}% fewer words. Kept exactly: ${e.kept.join(", ")}.`,
  })),
];

/** The left column of the auth pages: worked edits on a slow rotation. */
export function AuthExamples() {
  return (
    <Carousel label="Example edits" autoplay={8000} trackClassName="gap-8" className="max-w-md">
      {SLIDES.map((slide) => (
        <figure key={slide.kind}>
          <p className="eyebrow mb-4">{slide.kind}</p>
          <p className="text-lg leading-relaxed">
            <span className="mark-strike">{slide.before}</span>
          </p>
          <p className="font-display mt-5 text-[2.5rem] leading-[1.1] text-foreground">{slide.after}</p>
          <figcaption className="mt-8 border-t border-border pt-5 text-[0.9375rem] leading-relaxed text-foreground-muted">
            {slide.caption}
          </figcaption>
        </figure>
      ))}
    </Carousel>
  );
}
