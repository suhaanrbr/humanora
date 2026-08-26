import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PlanComparison } from "@/components/pricing/PlanComparison";
import { pricingPlans, ultraFairUseNote } from "@/lib/config/pricing";
import { pricingFaq } from "@/lib/config/faq";

/**
 * Pricing — one of the strongest sections on the page. Cards are
 * rendered entirely from `pricingPlans` (see lib/config/pricing.ts,
 * itself derived from lib/config/plans.ts); a full comparison table and
 * FAQ follow below. Monthly billing only — HUMANORA's Razorpay
 * integration bills a fixed period per order (see
 * lib/payments/orders.ts), so there's no annual plan to offer yet.
 */
export function Pricing() {
  return (
    <section id="pricing" className="section-glow-top py-20 sm:py-28">
      <Container>
        <Reveal as="div" className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-foreground-muted">
            Start free. Upgrade as your writing needs grow.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan, i) => (
            <Reveal key={plan.id} as="div" delay={i * 80}>
              <PricingCard plan={plan} />
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-foreground-subtle">
          {ultraFairUseNote} Paid plans bill a 30-day access period per
          purchase via Razorpay — see the FAQ below for renewal details.
        </p>

        {/* Full plan comparison */}
        <Reveal as="div" className="mx-auto mt-24 max-w-5xl">
          <h3 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Compare HUMANORA plans
          </h3>
          <div className="mt-10">
            <PlanComparison />
          </div>
        </Reveal>

        {/* Pricing FAQ */}
        <Reveal as="div" className="mx-auto mt-24 max-w-2xl">
          <h3 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pricing questions
          </h3>
          <div className="mt-8">
            <FAQAccordion items={pricingFaq} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
