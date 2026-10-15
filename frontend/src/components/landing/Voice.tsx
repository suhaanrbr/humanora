import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { PLANS } from "@/lib/config/plans";

const TRAITS = [
  ["Sentence length", "Varied, short sentences for emphasis"],
  ["Formality", "Moderate"],
  ["Directness", "High, leads with the point"],
  ["Transitions", "Light; rarely “furthermore”"],
  ["Punctuation", "Dashes over semicolons"],
  ["Rhythm", "Uneven, on purpose"],
] as const;

export function Voice() {
  return (
    <section id="my-voice" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="My Voice" title={<>Not &ldquo;human&rdquo;. <em>Yours.</em></>}>
          <p>
            Generic &ldquo;natural&rdquo; writing is still somebody else&apos;s voice. Give Humanora a
            few pieces you&apos;ve written yourself, such as essays, emails or posts, and it builds a
            short profile of how you write. Every rewrite after that leans toward it.
          </p>
        </SectionHeader>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5 lg:col-start-4 lg:pl-10">
            <div className="rounded-lg border border-border bg-background-elevated">
              <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
                <p className="font-display text-xl text-foreground">Your style profile</p>
                <p className="text-sm text-foreground-subtle">From 4 samples</p>
              </div>
              <dl className="divide-y divide-border">
                {TRAITS.map(([trait, value]) => (
                  <div key={trait} className="grid grid-cols-[8.5rem_1fr] gap-4 px-6 py-3.5 text-[0.9375rem]">
                    <dt className="text-foreground-subtle">{trait}</dt>
                    <dd className="text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-4">
            <Point title="Analysed once, not re-sent">
              Your samples are read once and reduced to a handful of style traits. The samples
              themselves don&apos;t travel with every rewrite.
            </Point>
            <Point title="A description of style, nothing more">
              The profile describes how you write. It makes no claim about who wrote a given piece,
              and you can edit or delete it at any time.
            </Point>
            <Point title="More than one voice">
              Keep separate profiles for coursework and for work email: up to{" "}
              {PLANS.ultra.maxVoiceProfiles} on Ultra, {PLANS.pro.maxVoiceProfiles} on Pro,{" "}
              {PLANS.essential.maxVoiceProfiles} on Essential.
            </Point>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Point({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l border-brand-purple/60 pl-5">
      <h3 className="text-xl leading-snug text-foreground">{title}</h3>
      <p className="mt-2 text-base leading-relaxed text-foreground-muted">{children}</p>
    </div>
  );
}
