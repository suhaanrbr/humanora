import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";

const CHECKED = [
  ["Figures", "1,240 · 3.5"],
  ["Percentages", "18% · 0.4%"],
  ["Dates", "March 5, 2026 · 2026-03-05"],
  ["Links", "https://…"],
  ["Direct quotations", "“…exactly as said.”"],
] as const;

/**
 * The trust argument. The meaning check is deterministic pattern
 * matching (lib/ai/meaningCheck.ts), not a second model call, and the
 * copy says exactly what it checks and what it doesn't promise.
 */
export function Meaning() {
  return (
    <section id="meaning" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="Meaning check" title="Change the sentences. Never the facts.">
          <p>
            A rewrite that drops a decimal point is worse than no rewrite. After every pass,
            Humanora compares the result against your original and checks that each figure, date,
            link and quotation came through unchanged. Anything that didn&apos;t is flagged before
            you copy a word.
          </p>
        </SectionHeader>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:col-start-4 lg:pl-10">
            <div className="rounded-lg border border-border bg-background-elevated p-6 sm:p-8">
              <p className="text-app-label text-foreground-subtle">Original</p>
              <p className="mt-3 text-lg leading-relaxed text-foreground-muted">
                Enrolment rose by <Held>12%</Held> to <Held>1,240</Held> students by{" "}
                <Held>March 5, 2026</Held>, the registrar said, calling it &ldquo;
                <Held>the strongest intake in a decade</Held>&rdquo;.
              </p>
              <hr className="my-6 border-border" />
              <p className="text-app-label text-foreground-subtle">Rewrite</p>
              <p className="mt-3 text-lg leading-relaxed text-foreground">
                By <Held>March 5, 2026</Held>, enrolment had climbed <Held>12%</Held> to{" "}
                <Held>1,240</Held>, which the registrar called &ldquo;
                <Held>the strongest intake in a decade</Held>&rdquo;.
              </p>
              <p className="mt-6 border-t border-border pt-4 text-sm text-success">
                ✓ 4 of 4 checked items preserved
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="text-app-label text-foreground-subtle">What gets checked</p>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              {CHECKED.map(([kind, sample]) => (
                <div key={kind} className="py-3">
                  <dt className="text-[0.9375rem] text-foreground">{kind}</dt>
                  <dd className="mt-0.5 text-sm text-foreground-subtle">{sample}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-foreground-subtle">
              The check is a safety net, not a guarantee. For anything that matters, read the
              rewrite before you send it.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Held({ children }: { children: React.ReactNode }) {
  return <span className="mark-keep text-foreground">{children}</span>;
}
