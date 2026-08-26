import { Container } from "@/components/ui/Container";

const principles = [
  {
    title: "Privacy-conscious",
    description: "We aim for data minimization and don't train on your documents without opt-in.",
    icon: LockIcon,
  },
  {
    title: "Meaning preservation",
    description: "Rewrites are checked against your original facts and terminology.",
    icon: CheckShieldIcon,
  },
  {
    title: "Citation safe",
    description: "Your references and citations are treated as protected content.",
    icon: QuoteIcon,
  },
  {
    title: "Here to help",
    description: "Reach out any time — we aim to respond as quickly as we can.",
    icon: SupportIcon,
  },
];

/**
 * Trust bar built around real product principles rather than testimonials,
 * ratings, or company logos — no unverifiable "100%" or "24/7" claims.
 */
export function Trust() {
  return (
    <section className="border-t border-border py-12 sm:py-14">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle) => (
            <div key={principle.title} className="flex items-start gap-3.5">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-brand-purple">
                <principle.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{principle.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                  {principle.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

type IconProps = { className?: string };

function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.4 3 7.7 7 10 4-2.3 7-5.6 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 8c-1.7 0-3 1.3-3 3v2c0 1.7 1.3 3 3 3M7 8v6M17 8c-1.7 0-3 1.3-3 3v2c0 1.7 1.3 3 3 3M17 8v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SupportIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.6-1.4c.6.9.2 1.7-.6 2.3-.7.5-1.5.9-1.5 2.1M12 16.2v.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
