import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { ProductShot } from "@/components/landing/ProductShot";

const TOOLS = [
  {
    name: "Study",
    body: "Turn a dense reading into a summary, a plain-language explanation at the depth you choose, or structured revision notes. It works only from the text you give it, and says so when the material doesn’t cover something.",
  },
  {
    name: "AI Detector",
    body: "Check how a passage reads before someone else does. You get a likelihood band, a confidence level and the specific signals behind it. You won’t get a fake “98% human” score, because no detector can measure that.",
  },
  {
    name: "Projects",
    body: "Group rewrites, study notes and checks by course, client or piece of work, so the material for one deadline stays together.",
  },
  {
    name: "Library",
    body: "Every rewrite and study session is saved automatically and searchable. Nothing disappears when you close the tab.",
  },
] as const;

export function Workspace() {
  return (
    <section id="workspace" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="The workspace" title="The rest of the desk.">
          <p>
            Rewriting is the main job, but writing also means reading, checking and keeping track.
            These live in the same account, on every paid plan.
          </p>
        </SectionHeader>

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:ml-[25%] lg:pl-10">
          {TOOLS.map((tool) => (
            <div key={tool.name} className="border-t border-border-strong pt-5">
              <h3 className="text-2xl leading-tight text-foreground">{tool.name}</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground-muted">{tool.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
          <ProductShot
            name="voice"
            figure="Fig. 2"
            sizes="(min-width: 1024px) 600px, 100vw"
            alt="A My Voice style profile: a plain-English summary, eight traits such as formality and rhythm with the detected value highlighted, and patterns Humanora noticed."
            caption="My Voice: the style profile built from your samples. Tap any trait to correct it."
          />
          <ProductShot
            name="library"
            figure="Fig. 3"
            sizes="(min-width: 1024px) 600px, 100vw"
            alt="The Library: a searchable list of past rewrites and study sessions, each with its mode, project, word count and date."
            caption="The Library: every rewrite and study session, searchable and filed by project."
          />
        </div>
      </Container>
    </section>
  );
}
