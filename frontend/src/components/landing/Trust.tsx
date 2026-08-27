import { Container } from "@/components/ui/Container";

const principles = [
  {
    title: "Meaning preservation",
    description: "Every rewrite is checked against your original facts and terminology.",
  },
  {
    title: "Citation safe",
    description: "Your references and citations are treated as protected content.",
  },
  {
    title: "Privacy-conscious",
    description: "We aim for data minimization and don't train on your documents without opt-in.",
  },
  {
    title: "Here to help",
    description: "Reach out any time — we aim to respond as quickly as we can.",
  },
];

/**
 * What HUMANORA asks a visitor to trust it with, stated directly rather
 * than as a generic "Fast / Secure / Powerful" icon grid — a two-column
 * reading list next to a short framing statement, tied to the same
 * gradient-thread connector used elsewhere on the page (navbar scroll
 * progress, PreserveMeaning) instead of four bordered icon boxes.
 */
export function Trust() {
  return (
    <section className="border-t border-border py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What HUMANORA protects
            </h2>
            <p className="mt-3 max-w-sm text-sm text-foreground-muted">
              Rewriting your language is the easy part. Here&apos;s what we hold ourselves to while
              doing it.
            </p>
          </div>

          <div className="flex flex-col">
            {principles.map((principle, i) => (
              <div
                key={principle.title}
                className={i > 0 ? "border-t border-border pt-5 mt-5" : undefined}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-brand-gradient text-xs font-semibold tabular-nums">
                    0{i + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{principle.title}</h3>
                </div>
                <p className="mt-1.5 pl-6 text-sm leading-relaxed text-foreground-muted">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
