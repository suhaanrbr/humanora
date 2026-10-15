import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { ProductShot } from "@/components/landing/ProductShot";
import { TOOLS } from "@/lib/config/tools";

export function Workspace() {
  return (
    <section id="workspace" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="The workspace" title="The rest of the desk.">
          <p>
            Rewriting is the main job, but writing also means checking, citing and studying. Every tool lives
            in the same account, and everything you make is saved to your Library and filed by project.
          </p>
        </SectionHeader>

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:ml-[25%] lg:pl-10">
          {TOOLS.filter((tool) => tool.slug !== "humanizer").map((tool) => (
            <div key={tool.slug} className="border-t border-border-strong pt-5">
              <h3 className="flex items-baseline gap-3 text-2xl leading-tight text-foreground">
                {tool.name}
                {tool.access === "free" && <span className="eyebrow">Free</span>}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground-muted">{tool.summary}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 lg:ml-[25%] lg:pl-10">
          <Link href="/tools" className="focus-ring rounded-sm text-base text-foreground underline decoration-border-strong underline-offset-[6px] hover:decoration-foreground">
            See every tool →
          </Link>
        </p>

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
