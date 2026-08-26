import { Container } from "@/components/ui/Container";

const steps = [
  {
    number: "1",
    title: "Add your draft",
    description: "Paste your text or upload a document — including AI-assisted drafts you want to sound more natural.",
  },
  {
    number: "2",
    title: "Choose how you want it rewritten",
    description: "Pick a mode like Academic or Professional, set a rewriting strength, and optionally apply your My Voice profile.",
  },
  {
    number: "3",
    title: "Review your HUMANORA result",
    description: "Compare original and rewritten text side by side. Meaning, facts, and citations are checked for preservation along the way.",
  },
];

/**
 * Three-step "How It Works" walkthrough.
 */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How HUMANORA works
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            Three simple steps from draft to a natural, human-sounding result.
          </p>
        </div>

        <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-10 sm:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px bg-border sm:block"
          />
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="bg-brand-gradient relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white shadow-glow-sm">
                {step.number}
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
