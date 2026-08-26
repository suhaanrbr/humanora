import { Container } from "@/components/ui/Container";

const useCases = [
  {
    title: "Academic Writing",
    description: "Refine essays and coursework for clarity while keeping citations and facts intact. Use responsibly and in line with your institution's policies.",
    Motif: CitationMotif,
  },
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
 * Use-case cards, each with a small motif illustrating the context rather
 * than six identical boxes. HUMANORA is positioned as a writing/refinement
 * assistant — copy avoids encouraging academic dishonesty.
 */
export function UseCases() {
  return (
    <section id="use-cases" className="section-glow-top py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for how you actually write
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            A writing and refinement assistant for the situations where tone
            and voice matter most.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="hover-lift group rounded-lg border border-border bg-surface p-6 transition-[background-color] duration-300 hover:border-brand-purple/35 hover:bg-surface-hover hover:shadow-glow-sm"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background-elevated text-brand-purple transition-[border-color,box-shadow] duration-300 group-hover:border-brand-purple/40 group-hover:shadow-glow-sm">
                <useCase.Motif className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{useCase.title}</h3>
              <p className="mt-1.5 text-sm text-foreground-muted">{useCase.description}</p>
            </div>
          ))}
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
