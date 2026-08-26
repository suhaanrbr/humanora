import { Container } from "@/components/ui/Container";

const principles = [
  {
    title: "Privacy-conscious",
    description: "We aim for data minimization by design, and we don't use your documents to train systems without your explicit opt-in.",
    icon: LockIcon,
  },
  {
    title: "Meaning preservation",
    description: "Rewrites are checked against your original facts, numbers, and terminology so meaning isn't quietly lost.",
    icon: CheckShieldIcon,
  },
  {
    title: "Citation-aware rewriting",
    description: "Quotations, citations, and URLs are treated as protected content during rewriting, not just plain text.",
    icon: QuoteIcon,
  },
  {
    title: "User-controlled history",
    description: "Your document history belongs to you — review, rename, or delete it whenever you choose.",
    icon: FolderIcon,
  },
];

/**
 * Trust section built around real product principles rather than
 * testimonials, ratings, or company logos.
 */
export function Trust() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built around your trust
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            No guarantees we can&apos;t back up — just the principles HUMANORA
            is designed around.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle) => (
            <div key={principle.title} className="flex flex-col items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-surface text-brand-purple">
                <principle.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{principle.title}</h3>
              <p className="text-sm leading-relaxed text-foreground-muted">
                {principle.description}
              </p>
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

function FolderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
