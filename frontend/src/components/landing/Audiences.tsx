import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";

const AUDIENCES = [
  {
    slug: "students",
    who: "Students",
    uses: "Essays, coursework, personal statements, revision notes",
    body: "Draft with whatever tools your course allows, then make the final text read like you. Study turns the reading list into notes you can revise from.",
    note: "Follow your institution’s rules on AI assistance. Humanora improves writing; it doesn’t make undisclosed use acceptable where it isn’t.",
  },
  {
    slug: "professionals",
    who: "Professionals",
    uses: "Email, reports, proposals, updates, documentation",
    body: "Keep the speed of an AI first draft without sending something that sounds like everyone else’s. Professional and Concise modes are built for work writing.",
  },
  {
    slug: "writers",
    who: "Writers and creators",
    uses: "Blog posts, newsletters, scripts, long-form drafts",
    body: "Use AI for structure and research, then put your own voice back in. My Voice keeps a long piece consistent from the first paragraph to the last.",
  },
] as const;

export function Audiences() {
  return (
    <section id="use-cases" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="Who it’s for" title="For anyone whose name goes at the bottom." />

        <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
          {AUDIENCES.map((a) => (
            <article key={a.who} className="flex flex-col">
              <h3 className="text-3xl leading-tight text-foreground">{a.who}</h3>
              <p className="mt-2 text-sm italic text-foreground-subtle">{a.uses}</p>
              <p className="mt-5 text-base leading-relaxed text-foreground-muted">{a.body}</p>
              {"note" in a && (
                <p className="mt-5 border-l border-brand-cyan/60 pl-4 text-sm leading-relaxed text-foreground-subtle">
                  {a.note}
                </p>
              )}
              <Link
                href={`/for/${a.slug}`}
                className="focus-ring mt-6 w-fit rounded-sm text-[0.9375rem] text-brand-purple hover:underline"
              >
                Humanora for {a.who.toLowerCase()} →
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
