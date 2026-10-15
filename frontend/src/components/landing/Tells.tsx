import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { TellsLab } from "@/components/landing/TellsLab";

const TELLS = [
  {
    name: "Throat-clearing",
    example: "In today’s fast-paced world, it is important to note that…",
    note: "The sentence starts three clauses before it says anything.",
  },
  {
    name: "Borrowed grandeur",
    example: "delve into · a rich tapestry · a testament to · seamlessly leverage",
    note: "Words chosen because they sound like writing, not because they mean something.",
  },
  {
    name: "Everything in threes",
    example: "clear, concise, and compelling",
    note: "One triplet is a rhetorical choice. Six in a page is a habit.",
  },
  {
    name: "Metronome rhythm",
    example: "Every sentence the same length. Every one built the same way. Every one ends flat.",
    note: "People speed up, slow down, and interrupt themselves. Models rarely do.",
  },
  {
    name: "The hedge at the end",
    example: "Ultimately, the right choice will depend on a variety of factors.",
    note: "A conclusion that commits to nothing.",
  },
] as const;

/**
 * Why the product exists, made concrete: the patterns that make a
 * reader stop trusting a paragraph. Set as a numbered reading list,
 * not a grid of icon cards.
 */
export function Tells() {
  return (
    <section id="why" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="The problem" title="Readers can tell. Usually within a sentence.">
          <p>
            AI drafts fail in a handful of predictable ways. None of them is a grammar mistake,
            so a grammar checker won&apos;t catch them. Synonym swapping doesn&apos;t either.
            Humanora rewrites the sentence the way an editor would.
          </p>
        </SectionHeader>

        <ol className="mt-14 lg:ml-[25%] lg:pl-10">
          {TELLS.map((tell, i) => (
            <li
              key={tell.name}
              className="grid grid-cols-[2.25rem_1fr] gap-x-4 border-t border-border py-7 sm:grid-cols-[3rem_1fr_1fr] sm:gap-x-8"
            >
              <span className="font-display text-2xl leading-none text-foreground-subtle">{i + 1}</span>
              <div>
                <h3 className="text-2xl leading-tight text-foreground">{tell.name}</h3>
                <p className="mt-2 text-base text-foreground-muted">{tell.note}</p>
              </div>
              <p className="col-start-2 mt-4 font-display text-lg italic leading-snug text-foreground-subtle sm:col-start-3 sm:mt-0">
                <span className="mark-strike">{tell.example}</span>
              </p>
            </li>
          ))}
        </ol>

        <div id="try" className="mt-20 scroll-mt-20">
          <div className="mb-6 flex flex-col gap-2 lg:ml-[25%] lg:pl-10">
            <h3 className="text-3xl leading-tight text-foreground">Try it on your own writing.</h3>
            <p className="max-w-2xl text-base text-foreground-muted">
              Paste a paragraph and watch the marks appear as you type. Free, no account, and it never
              leaves your browser.
            </p>
          </div>
          <TellsLab />
        </div>

        <p className="mt-10 max-w-2xl text-base leading-relaxed text-foreground-subtle lg:ml-[25%] lg:pl-10">
          A note on detectors: no tool can honestly promise to get past every AI detector, and we
          don&apos;t. What Humanora promises is better writing, in a voice that&apos;s recognisably
          yours.
        </p>
      </Container>
    </section>
  );
}
