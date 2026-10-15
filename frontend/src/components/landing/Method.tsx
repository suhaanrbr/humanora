import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { ProductShot } from "@/components/landing/ProductShot";
import { PLANS } from "@/lib/config/plans";

const maxWords = Math.round(PLANS.ultra.maxInputChars / 6).toLocaleString("en-IN");

const STEPS = [
  {
    title: "Paste the draft",
    body: `An email, a cover letter, a report, a chapter. Up to ${maxWords} words at a time, depending on your plan. Nothing to install.`,
  },
  {
    title: "Choose how it should read",
    body: "Pick one of six writing modes, from Natural to Persuasive, and set how far the rewrite may move from your draft. Add My Voice to steer it toward your own style.",
  },
  {
    title: "Compare, check, keep",
    body: "Read the rewrite next to your original. Each one comes with a meaning check on every figure and quotation and a readability score, and it saves to your Library automatically.",
  },
] as const;

export function Method() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="How it works" title="Three steps. No prompt-writing.">
          <p>
            You don&apos;t need to know how to talk to a model. The editing instructions are built
            in. You make the decisions a writer should make.
          </p>
        </SectionHeader>

        <ol className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col bg-background p-7 sm:p-9">
              <span className="font-display text-6xl leading-none text-brand-purple">{i + 1}</span>
              <h3 className="mt-8 text-2xl leading-tight text-foreground">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <ProductShot
          name="write"
          className="mt-16"
          figure="Fig. 1"
          alt="The Humanora Write workspace: an AI-drafted paragraph on the left, two rewritten variations on the right, a readability score, and a meaning check confirming every figure was preserved."
          caption="Write, after a rewrite: the original beside two variations, a readability score, and the meaning check confirming 18%, £4.7 million and the citation survived. Shown with example content."
        />
      </Container>
    </section>
  );
}
