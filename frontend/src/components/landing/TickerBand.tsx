import Link from "next/link";
import { Marquee } from "@/components/ui/Marquee";
import { TOOLS } from "@/lib/config/tools";

// The phrases readers have learned to distrust, struck through the way
// an editor would strike them. The same families TellsLab marks.
const CUT_PHRASES = [
  "delve into",
  "a rich tapestry",
  "in today’s fast-paced world",
  "it is important to note that",
  "seamlessly",
  "a testament to",
  "navigate the complexities",
  "unlock the full potential",
  "the ever-evolving landscape",
  "plays a pivotal role",
  "leverage synergies",
  "at the end of the day",
  "game-changer",
  "in conclusion",
];

/**
 * A full-bleed band under the hero with two tickers running in opposite
 * directions: on top, the clichés Humanora cuts; below, the tools that
 * do the work. One glance says what the product removes and what it
 * gives you.
 */
export function TickerBand() {
  return (
    <section aria-label="What Humanora cuts, and the tools that do it" className="border-y border-border bg-background-elevated py-8 sm:py-10">
      <p className="eyebrow mb-6 text-center">Cut on sight</p>

      <Marquee duration={55} trackClassName="[--marquee-gap:2.25rem]">
        {CUT_PHRASES.map((phrase) => (
          <span key={phrase} className="flex items-center gap-[2.25rem] whitespace-nowrap">
            <span className="mark-strike font-display text-2xl italic sm:text-3xl">{phrase}</span>
            <span className="ticker-sep" aria-hidden="true" />
          </span>
        ))}
      </Marquee>

      <Marquee reverse duration={45} className="mt-5" trackClassName="[--marquee-gap:2rem]">
        {TOOLS.map((tool) => (
          <span key={tool.slug} className="flex items-center gap-8 whitespace-nowrap">
            <Link
              href={tool.publicHref ?? "/tools"}
              className="focus-ring group inline-flex items-baseline gap-2.5 rounded-sm text-lg text-foreground transition-colors hover:text-brand-purple"
            >
              {tool.name}
              <span className="text-xs uppercase tracking-[0.12em] text-foreground-subtle group-hover:text-brand-purple">
                {tool.access === "free" ? "Free" : tool.group}
              </span>
            </Link>
            <span className="h-4 w-px bg-border-strong" aria-hidden="true" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
