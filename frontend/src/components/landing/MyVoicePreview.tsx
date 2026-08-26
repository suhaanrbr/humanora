import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

const traits = [
  { label: "Vocabulary", strength: "Strong" },
  { label: "Sentence Structure", strength: "Strong" },
  { label: "Tone & Style", strength: "Developing" },
  { label: "Writing Patterns", strength: "Strong" },
];

const samples = [
  { name: "Essay_Example.docx", words: "1,245 words" },
  { name: "Personal_Statement.pdf", words: "982 words" },
  { name: "Blog_Post_Sample.txt", words: "1,035 words" },
];

/**
 * "My Voice" product preview — illustrative mock UI only, clearly labeled
 * as a demonstration. The completeness percentage is explicitly scoped to
 * profile completeness, never identity or authorship certainty.
 */
export function MyVoicePreview() {
  return (
    <section id="my-voice" className="py-24 sm:py-32">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <Badge variant="brand">My Voice</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Rewrite in your own writing style
            </h2>
            <p className="mt-4 max-w-lg text-base text-foreground-muted">
              Upload a few writing samples and HUMANORA builds a reusable
              voice profile — vocabulary, sentence structure, tone, and
              patterns — so rewrites sound like you wrote them.
            </p>
            <p className="mt-4 max-w-lg text-sm text-foreground-subtle">
              The profile score below reflects how complete and consistent
              your samples are — it is not a measure of identity or
              authorship, and it doesn&apos;t verify who wrote anything.
            </p>
          </div>

          <Card className="p-5 shadow-glow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Your Writing Samples</p>
            </div>
            <div className="flex flex-col gap-2.5">
              {samples.map((sample) => (
                <div
                  key={sample.name}
                  className="flex items-center justify-between rounded-md border border-border bg-background-elevated px-3.5 py-2.5"
                >
                  <span className="truncate text-sm text-foreground">{sample.name}</span>
                  <span className="shrink-0 text-xs text-foreground-subtle">{sample.words}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Voice Profile</p>
                <span className="text-xs text-foreground-subtle">Profile completeness</span>
              </div>

              <div className="mb-5 flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                    <circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-border)" strokeWidth="6" />
                    <circle
                      cx="32"
                      cy="32"
                      r="27"
                      fill="none"
                      stroke="url(#voice-gradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 27}
                      strokeDashoffset={2 * Math.PI * 27 * (1 - 0.78)}
                    />
                    <defs>
                      <linearGradient id="voice-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--color-brand-indigo)" />
                        <stop offset="100%" stopColor="var(--color-brand-purple)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-sm font-semibold text-foreground">78%</span>
                </div>
                <p className="text-xs text-foreground-muted">
                  Add another sample to strengthen tone and style matching.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {traits.map((trait) => (
                  <div key={trait.label} className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">{trait.label}</span>
                    <span className="text-foreground">{trait.strength}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
