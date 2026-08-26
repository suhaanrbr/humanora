import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { WaitlistButton } from "@/components/ui/WaitlistButton";
import { Card } from "@/components/ui/Card";
import { CodeExample } from "@/components/ui/CodeExample";
import { UseCaseCard } from "@/components/ui/UseCaseCard";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { apiFaq } from "@/lib/config/faq";

export const metadata: Metadata = {
  title: "HUMANORA API — Natural writing, one API call away",
  description:
    "Bring HUMANORA's writing transformation engine into your product, workflow, or platform. Currently in developer preview.",
  openGraph: {
    title: "HUMANORA API — Natural writing, one API call away",
    description:
      "Bring HUMANORA's writing transformation engine into your product, workflow, or platform.",
  },
};

const codeTabs = [
  {
    label: "JavaScript",
    code: `// Developer preview — this endpoint is not live yet.
const response = await fetch("https://api.humanora.dev/v1/humanize", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.HUMANORA_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "Your AI-assisted draft goes here.",
    mode: "professional",
    strength: "balanced",
  }),
});

const result = await response.json();
console.log(result.output);`,
  },
  {
    label: "Python",
    code: `# Developer preview — this endpoint is not live yet.
import requests

response = requests.post(
    "https://api.humanora.dev/v1/humanize",
    headers={"Authorization": f"Bearer {HUMANORA_API_KEY}"},
    json={
        "text": "Your AI-assisted draft goes here.",
        "mode": "professional",
        "strength": "balanced",
    },
)

print(response.json()["output"])`,
  },
  {
    label: "cURL",
    code: `# Developer preview — this endpoint is not live yet.
curl -X POST https://api.humanora.dev/v1/humanize \\
  -H "Authorization: Bearer $HUMANORA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Your AI-assisted draft goes here.",
    "mode": "professional",
    "strength": "balanced"
  }'`,
  },
];

const apiPlans = [
  {
    name: "Developer",
    price: "$29",
    description: "For testing and small-scale integrations.",
    features: ["Planned word allowance", "Standard rate limits", "Community support"],
  },
  {
    name: "Growth",
    price: "$69",
    description: "For products with growing usage.",
    features: ["Higher planned word allowance", "Higher rate limits", "Priority email support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For high-volume and custom infrastructure needs.",
    features: ["Custom word allowance", "Custom rate limits", "Dedicated support"],
  },
];

const useCases = [
  { title: "Content teams", description: "Refine AI-assisted drafts before publishing." },
  { title: "SEO workflows", description: "Make AI-generated content read more naturally." },
  { title: "SaaS products", description: "Add writing refinement as a feature in your own app." },
  { title: "Publishing platforms", description: "Give writers a natural-voice pass before print." },
  { title: "Education tools", description: "Help students see clearer, more natural phrasing." },
  { title: "Enterprise writing workflows", description: "Standardize tone across large teams." },
];

export default function ApiPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-ambient-glow bg-grid-texture relative overflow-hidden py-20 sm:py-28">
          <Container className="text-center">
            <Badge variant="warning">Developer Preview</Badge>
            <h1 className="text-hero mx-auto mt-4 max-w-3xl font-bold tracking-tight text-foreground">
              Natural writing, one API call away.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-foreground-muted">
              Bring HUMANORA&apos;s writing transformation engine into your
              product, workflow, or platform.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <WaitlistButton variant="primary" size="lg" joinedLabel="Request received">
                Request Early Access
              </WaitlistButton>
              <a
                href="#code-example"
                className="focus-ring press-feedback inline-flex h-12 items-center justify-center rounded-md border border-border-strong bg-surface px-6 text-base font-medium text-foreground transition-colors hover:border-brand-purple/40 hover:bg-surface-hover"
              >
                See the API
              </a>
            </div>
            <p className="mt-4 text-xs text-foreground-subtle">
              The HUMANORA API is not live yet — this page describes the
              planned developer offering.
            </p>
          </Container>
        </section>

        <section id="code-example" className="py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                A simple, familiar interface
              </h2>
              <p className="mt-4 text-base text-foreground-muted">
                One call, one rewrite — designed to feel like every other
                API you already use.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl">
              <CodeExample tabs={codeTabs} />
            </div>
          </Container>
        </section>

        <section className="section-glow-top py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Built for how teams use it
              </h2>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((uc) => (
                <UseCaseCard key={uc.title} icon={<PlugIcon className="h-5 w-5" />} title={uc.title} description={uc.description} />
              ))}
            </div>
          </Container>
        </section>

        <section id="pricing" className="section-glow-top py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                API plans
              </h2>
              <p className="mt-4 text-base text-foreground-muted">
                Planned pricing for when the API moves out of developer
                preview. Word allowances and rate limits are illustrative.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
              {apiPlans.map((plan) => (
                <Card
                  key={plan.name}
                  className={plan.highlighted ? "hover-lift border-brand-purple/50 p-6 shadow-glow-md" : "hover-lift p-6"}
                >
                  <p className="text-sm font-medium text-foreground-muted">{plan.name}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    {plan.price}
                    {plan.price !== "Custom" && <span className="text-sm font-normal text-foreground-subtle">/month</span>}
                  </p>
                  <p className="mt-3 text-sm text-foreground-muted">{plan.description}</p>
                  <ul className="mt-5 flex flex-col gap-2 text-sm text-foreground-muted">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-purple" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                API questions
              </h2>
            </div>
            <div className="mx-auto mt-8 max-w-2xl">
              <FAQAccordion items={apiFaq} />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PlugIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 3v4M15 3v4M7 7h10v3a5 5 0 0 1-10 0V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 15v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
