import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const protectedFragments = [
  { text: "£4.7 million", tag: "protected number", label: "NUMBER" },
  { text: "2025", tag: "protected date", label: "DATE" },
  { text: "[14]", tag: "protected citation", label: "CITATION" },
];

/**
 * "Preserve what matters" — visually demonstrates that certain fragments of
 * a sentence stay locked in place while the surrounding language is
 * rewritten. Copy is intentionally hedged ("designed to preserve", "helps
 * protect") rather than claiming perfect, guaranteed preservation.
 */
export function PreserveMeaning() {
  return (
    <section className="section-tint-violet section-glow-top py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <Reveal
              as="div"
              className="rounded-xl border border-border-strong bg-surface p-7 shadow-glow-md sm:p-9"
            >
              <p className="mb-6 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                Original
              </p>
              <p className="text-lg leading-loose text-foreground-muted">
                The company reported revenue of{" "}
                <LockedFragment text="£4.7 million" label="NUMBER" delay={150} />, up
                from the previous year in{" "}
                <LockedFragment text="2025" label="DATE" delay={350} />
                <LockedFragment text="[14]" label="CITATION" delay={550} />.
              </p>

              {/* A short gradient thread — the same connective motif as the
                  navbar's scroll progress bar — linking the original line
                  to its rewrite below, so the two read as one continuous
                  transformation rather than two separate examples. */}
              <div className="my-6 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-purple/50 to-brand-purple/50" />
                <span className="text-xs text-foreground-subtle">rewritten</span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-brand-purple/50 to-brand-purple/50" />
              </div>

              <p className="mb-6 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
                HUMANORA result
              </p>
              <Reveal
                as="p"
                delay={700}
                className="text-lg leading-loose text-foreground"
              >
                Revenue reached <LockedFragment text="£4.7 million" label="NUMBER" delay={850} /> in{" "}
                <LockedFragment text="2025" label="DATE" delay={950} />, according to{" "}
                <LockedFragment text="[14]" label="CITATION" delay={1050} />.
              </Reveal>

              <div className="mt-7 flex flex-col gap-2.5 border-t border-border pt-6">
                {protectedFragments.map((item, i) => (
                  <Reveal key={item.text} as="div" delay={150 + i * 200}>
                    <div className="flex items-center gap-2 text-sm text-foreground-muted">
                      <ShieldIcon className="h-4 w-4 text-brand-purple" />
                      <span className="text-foreground">{item.text}</span>
                      <span className="text-foreground-subtle">— {item.tag}, unchanged in both</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Rewrite the language.
              <br />
              <span className="text-brand-gradient">Protect the meaning.</span>
            </h2>
            <p className="mt-4 max-w-lg text-base text-foreground-muted">
              HUMANORA is designed to preserve important facts, numbers,
              quotations, terminology, and citations while rewriting the
              language around them.
            </p>
            <p className="mt-4 max-w-lg text-sm text-foreground-subtle">
              This is a system HUMANORA is built to check for, not a
              guarantee of perfect preservation in every case — you should
              always review important rewrites yourself.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function LockedFragment({
  text,
  label,
  delay,
}: {
  text: string;
  label: string;
  delay: number;
}) {
  return (
    <Reveal
      as="span"
      delay={delay}
      className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-brand-purple/30 bg-brand-purple/10 px-1.5 py-0.5 text-foreground"
    >
      <span title={label} aria-label={label} className="inline-flex">
        <ShieldIcon className="h-3 w-3 text-brand-purple" />
      </span>
      {text}
    </Reveal>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.4 3 7.7 7 10 4-2.3 7-5.6 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
