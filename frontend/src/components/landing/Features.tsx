import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

const features = [
  {
    title: "Advanced Humanizer",
    description: "Rewrite stiff AI-assisted drafts into more natural, readable language.",
    icon: WandIcon,
  },
  {
    title: "My Voice",
    description: "Adapt rewriting toward your own writing preferences and style.",
    icon: FingerprintIcon,
  },
  {
    title: "Preserve Meaning",
    description: "Protect important facts, terminology, quotations, numbers, and citations.",
    icon: ShieldIcon,
  },
  {
    title: "Academic Mode",
    description: "Improve clarity and tone for academic writing while preserving citations and meaning.",
    icon: CapIcon,
  },
  {
    title: "Multi-Language",
    description: "Built on an architecture designed to extend beyond English over time.",
    icon: GlobeIcon,
  },
  {
    title: "Writing Analysis",
    description: "Review characteristics of your writing, such as tone and sentence structure.",
    icon: ChartIcon,
  },
];

/**
 * Feature grid — "Everything you need to write naturally."
 */
export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to write naturally
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            A focused toolkit for turning AI-assisted drafts into writing that
            sounds like you — without losing what matters.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group transition-colors duration-200 hover:border-border-strong hover:bg-surface-hover"
            >
              <CardHeader>
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background-elevated text-brand-purple transition-colors group-hover:border-brand-purple/40">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-3" />
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

type IconProps = { className?: string };

function WandIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 20 15 9M17 3l1.2 2.6L21 7l-2.6 1.2L17 11l-1.2-2.8L13 7l2.8-1.4L17 3ZM6 13l.8 1.7L8.5 15l-1.7.8L6 17.5l-.8-1.7L3.5 15l1.7-.8L6 13Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FingerprintIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3a7 7 0 0 1 7 7v2a9 9 0 0 1-2 5.5M6.6 18A9 9 0 0 1 5 12v-2a7 7 0 0 1 1.2-3.9M9 21a11 11 0 0 0 1.5-5.6V11a1.5 1.5 0 1 1 3 0v1.2M12 17.5c1.7 0 3-1.3 3-3V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.4 3 7.7 7 10 4-2.3 7-5.6 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m12 4 9 4.5-9 4.5-9-4.5L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11M21 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.5 5.3 3.5 8.5s-1.3 6.2-3.5 8.5c-2.2-2.3-3.5-5.3-3.5-8.5S9.8 5.8 12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
