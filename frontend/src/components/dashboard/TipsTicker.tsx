import Link from "next/link";
import { Marquee } from "@/components/ui/Marquee";

// Every tip describes something that works today, with a link to it.
const TIPS = [
  { text: "Press Ctrl K (⌘K on Mac) to jump to any tool", href: null },
  { text: "Six writing modes, from Academic to Casual", href: "/dashboard/humanize" },
  { text: "Add samples in My Voice and rewrites start to sound like you", href: "/dashboard/voice" },
  { text: "Paste a DOI into the Citation Generator to fill in the reference", href: "/dashboard/tools/citation-generator" },
  { text: "File work into Projects to keep a course or client together", href: "/dashboard/projects" },
  { text: "Fact Checker lists the sources behind every claim it checks", href: "/dashboard/tools/fact-checker" },
  { text: "Quiz Generator scores your answers and explains each one", href: "/dashboard/tools/quiz-generator" },
  { text: "Everything you make is saved to your Library", href: "/dashboard/history" },
] as const;

/** A slim ticker of product tips under the dashboard's stat strip. */
export function TipsTicker() {
  return (
    <section aria-label="Tips" className="flex items-center gap-4 border-b border-border py-3">
      <p className="eyebrow shrink-0">Tips</p>
      <Marquee duration={70} className="min-w-0 flex-1" trackClassName="[--marquee-gap:1.75rem]">
        {TIPS.map((tip) => (
          <span key={tip.text} className="flex items-center gap-7 whitespace-nowrap text-sm text-foreground-muted">
            {tip.href ? (
              <Link href={tip.href} className="focus-ring rounded-sm transition-colors hover:text-foreground">
                {tip.text}
              </Link>
            ) : (
              <span>{tip.text}</span>
            )}
            <span className="ticker-sep" aria-hidden="true" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
