import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionIndex } from "@/components/landing/SectionIndex";

const featured = {
  title: "Academic Writing",
  description:
    "Refine essays and coursework for clarity while keeping citations and facts intact. Use responsibly and in line with your institution's policies.",
  Motif: CitationMotif,
};

const supporting = [
  {
    title: "Professional Communication",
    description: "Turn AI-drafted emails and messages into writing that sounds like you.",
    Motif: EmailMotif,
  },
  {
    title: "Reports",
    description: "Make dense, AI-generated reports read more naturally for their audience.",
    Motif: ReportMotif,
  },
  {
    title: "Blog Writing",
    description: "Give AI-assisted blog drafts a more human, engaging voice.",
    Motif: ArticleMotif,
  },
  {
    title: "Personal Statements",
    description: "Rework application drafts so they reflect your own voice and story.",
    Motif: ProfileMotif,
  },
  {
    title: "Everyday Writing",
    description: "From notes to messages, smooth out anything that reads a little too much like a machine wrote it.",
    Motif: ChatMotif,
  },
];

/**
 * Same six real use cases as before, recomposed so they don't read as
 * six identical boxes: one featured capability gets a larger, document-
 * styled surface (its own motif rendered large, like a watermark behind
 * the copy — echoing the cinematic scenes' typographic-depth language),
 * the remaining five sit in a tighter supporting rail. Real content
 * only, just varied hierarchy instead of uniform card repetition.
 */
export function UseCases() {
  return (
    <section id="use-cases" className="section-glow-top py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionIndex>09 / APPLICATIONS</SectionIndex>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for how you actually write
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            A writing and refinement assistant for the situations where tone and voice matter most.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
          {/* Featured — a taller, document-like surface with its motif
              rendered large and faint behind the copy, not a same-size
              icon chip. */}
          <Reveal
            as="div"
            className="hover-lift group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-[border-color,box-shadow] duration-300 hover:border-brand-purple/35 hover:shadow-glow-sm"
          >
            <featured.Motif className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-brand-purple/[0.07] transition-opacity duration-300 group-hover:text-brand-purple/[0.1]" />
            <span className="relative w-fit rounded-full border border-brand-purple/25 bg-brand-purple/[0.08] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-brand-purple">
              Featured
            </span>

            {/* A real illustrative excerpt, not empty space above the
                copy — the same before/after language HUMANORA already
                demonstrates elsewhere, applied to this specific
                use case. */}
            <div className="relative mt-6 flex flex-1 flex-col justify-center gap-3 rounded-xl border border-border bg-background-elevated/60 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">Before</p>
              <p className="text-sm text-foreground-subtle line-through decoration-foreground-subtle/40">
                It is evident that the aforementioned findings substantiate the hypothesis.
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">After</p>
              <p className="text-sm text-foreground">The findings support the hypothesis.</p>
            </div>

            <h3 className="relative mt-6 text-xl font-semibold text-foreground">{featured.title}</h3>
            <p className="relative mt-2 max-w-sm text-base text-foreground-muted">{featured.description}</p>
          </Reveal>

          {/* Supporting rail — compact rows, not a second grid of cards. */}
          <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
            {supporting.map((useCase, i) => (
              <Reveal
                key={useCase.title}
                as="div"
                delay={i * 60}
                className="hover-lift group flex items-start gap-3.5 p-5 transition-colors duration-300 first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface-hover"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background-elevated text-brand-purple transition-[border-color,box-shadow] duration-300 group-hover:border-brand-purple/40 group-hover:shadow-glow-sm">
                  <useCase.Motif className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">{useCase.title}</p>
                  <p className="mt-0.5 text-sm text-foreground-subtle">{useCase.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

type IconProps = { className?: string };

function CitationMotif({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 4h12v16l-6-3-6 3V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 9h6M9 12.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EmailMotif({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.5 7 7.5 5.5L19.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReportMotif({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 20V10M11 20V4M18 20v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ArticleMotif({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 8h9M7.5 11.5h9M7.5 15h5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ProfileMotif({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 19c1-3 3.6-4.8 6.5-4.8s5.5 1.8 6.5 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChatMotif({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4v-10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
