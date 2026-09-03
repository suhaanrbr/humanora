import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIndex } from "@/components/landing/SectionIndex";

const pillars = [
  {
    title: "Humanize",
    description:
      "Rewrite AI drafts into writing that sounds like you — same facts, same meaning, a voice a reader doesn't flag as machine-written.",
    Icon: SparkIcon,
  },
  {
    title: "My Voice",
    description:
      "HUMANORA learns from real writing samples you provide, so every rewrite leans toward your own patterns instead of a generic \"AI-safe\" tone.",
    Icon: VoiceIcon,
  },
  {
    title: "Study",
    description:
      "Summarize, explain, or turn dense material into revision notes — one workspace for the reading side of writing, not a separate tool.",
    Icon: StudyIcon,
  },
  {
    title: "Library",
    description:
      "Every draft, rewrite, and study session lands in one searchable history — nothing lost between a humanize pass and the next.",
    Icon: LibraryIcon,
  },
] as const;

/**
 * Replaces what used to be six separate full-viewport scroll-scrubbed
 * scenes (one giant outlined word each, ~15,000px of mostly-empty scroll
 * between them) with a single, normal-height section carrying the same
 * four product ideas as real, readable cards — same visual idiom as
 * UseCases/PreserveMeaning below it (Reveal, SectionIndex, hover-lift
 * glass cards) rather than a separate cinematic language the rest of
 * the page never repeats. DimensionalH (the actual hero) and
 * ConversionIntro (the calm hand-off beat) are untouched.
 */
export function Pillars() {
  return (
    <section className="section-glow-top py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionIndex>02 / PRODUCT</SectionIndex>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What&apos;s inside HUMANORA
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            No separate tools to juggle, no context lost between them — everything lives in one workspace.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <Reveal
              key={pillar.title}
              as="div"
              delay={i * 80}
              className="hover-lift group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-[border-color,box-shadow] duration-300 hover:border-brand-purple/35 hover:shadow-glow-sm"
            >
              <span className="icon-chip flex h-11 w-11 items-center justify-center text-brand-purple">
                <pillar.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{pillar.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

type IconProps = { className?: string };

function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function VoiceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="9" y="3.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StudyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="7" height="16" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="9.5" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LibraryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6.5 3.5h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4.5M8.5 13h7M8.5 16.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
