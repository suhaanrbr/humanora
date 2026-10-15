import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";

const PRINCIPLES = [
  {
    title: "Your facts are not ours to change",
    body: "Figures, dates, links and quotations are checked after every rewrite, and anything that moved is flagged.",
  },
  {
    title: "Your documents are not training data",
    body: "We collect what the product needs to work and nothing more. We don’t train models on your writing without your explicit opt-in.",
  },
  {
    title: "No inflated claims",
    body: "We won’t sell you a fake “100% human” score or a promise to beat every detector. We’ll tell you what the product does and where it stops.",
  },
  {
    title: "No billing tricks",
    body: "One payment, thirty days, no automatic renewal. If you stop paying, you simply stop being charged.",
  },
] as const;

export function Principles() {
  return (
    <section id="principles" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="Principles" title="What we hold ourselves to." />

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:ml-[25%] lg:pl-10">
          {PRINCIPLES.map((p) => (
            <div key={p.title}>
              <h3 className="text-2xl leading-snug text-foreground">{p.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
