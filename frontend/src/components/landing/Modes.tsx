import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { writingModes } from "@/lib/config/modes";
import { comparisonCategories } from "@/lib/config/pricing";

const PLAN_NAMES = ["Free", "Essential", "Pro", "Ultra"] as const;

// Read each mode's lowest plan straight from the pricing comparison so
// this table can never disagree with what checkout actually unlocks.
const modeRows = comparisonCategories.find((c) => c.title === "Writing Modes")?.rows ?? [];
function availableFrom(mode: string) {
  const row = modeRows.find((r) => r.label === mode);
  const index = row ? row.values.findIndex((v) => v === "✓") : -1;
  return index <= 0 ? "Every plan" : `${PLAN_NAMES[index]} and up`;
}

const EXAMPLES: Record<string, string> = {
  Natural: "“We should probably move the launch. The data isn’t ready.”",
  Academic: "“The evidence suggests a moderate effect, though the sample is small.”",
  Professional: "“Could we move the review to Thursday? I’d like the full numbers first.”",
  Concise: "“Launch moves to May. Data first.”",
  Casual: "“Honestly? Let’s push it a week and do it properly.”",
  Persuasive: "“Waiting one week costs us little. Launching on bad data costs us trust.”",
};

export function Modes() {
  return (
    <section id="writing-modes" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="Writing modes" title="Six registers, chosen by you.">
          <p>
            A cover letter and a group chat shouldn&apos;t sound alike. Pick the register, and the
            rewrite follows it, with the meaning held in place.
          </p>
        </SectionHeader>

        <div className="mt-14 lg:ml-[25%] lg:pl-10">
          <div className="hidden grid-cols-[10rem_1fr_1fr_9rem] gap-8 border-b border-border-strong pb-3 text-app-label text-foreground-subtle md:grid">
            <span>Mode</span>
            <span>What it does</span>
            <span>Sounds like</span>
            <span className="text-right">Available on</span>
          </div>
          <dl>
            {writingModes.map((mode) => (
              <div
                key={mode.name}
                className="grid grid-cols-1 gap-2 border-b border-border py-6 md:grid-cols-[10rem_1fr_1fr_9rem] md:gap-8"
              >
                <dt className="font-display text-2xl leading-tight text-foreground">{mode.name}</dt>
                <dd className="text-base leading-relaxed text-foreground-muted">{mode.description}</dd>
                <dd className="font-display text-lg italic leading-snug text-foreground-subtle">
                  {EXAMPLES[mode.name]}
                </dd>
                <dd className="text-sm text-foreground-subtle md:text-right">{availableFrom(mode.name)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
