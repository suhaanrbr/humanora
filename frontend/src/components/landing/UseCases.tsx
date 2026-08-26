import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

const useCases = [
  {
    title: "Academic Writing",
    description: "Refine essays and coursework for clarity while keeping citations and facts intact. Use responsibly and in line with your institution's policies.",
  },
  {
    title: "Professional Communication",
    description: "Turn AI-drafted emails and messages into writing that sounds like you.",
  },
  {
    title: "Reports",
    description: "Make dense, AI-generated reports read more naturally for their audience.",
  },
  {
    title: "Blog Writing",
    description: "Give AI-assisted blog drafts a more human, engaging voice.",
  },
  {
    title: "Personal Statements",
    description: "Rework application drafts so they reflect your own voice and story.",
  },
  {
    title: "Everyday Writing",
    description: "From notes to messages, smooth out anything that reads a little too much like a machine wrote it.",
  },
];

/**
 * Use-case cards. HUMANORA is positioned as a writing/refinement assistant —
 * copy is written to avoid encouraging academic dishonesty.
 */
export function UseCases() {
  return (
    <section id="use-cases" className="py-24 sm:py-32">
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

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <Card key={useCase.title}>
              <CardHeader>
                <CardTitle>{useCase.title}</CardTitle>
                <CardDescription>{useCase.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-3" />
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
