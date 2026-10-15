import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PlanComparison } from "@/components/pricing/PlanComparison";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { pricingPlans, ultraFairUseNote } from "@/lib/config/pricing";
import { pricingFaq } from "@/lib/config/faq";

/**
 * Pricing. Cards render entirely from `pricingPlans` (lib/config/
 * pricing.ts, itself derived from lib/config/plans.ts), so this page
 * can never drift from what checkout charges. Paid plans are one-off
 * 30-day passes via Razorpay, with no auto-renewal, and the copy says so up front.
 */
export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="Pricing" title="Pay for a month. Nothing renews behind your back.">
          <p>
            Every paid plan is a single payment for 30 days of access. No subscription, no
            auto-renewal, nothing to remember to cancel. Prices are in Indian rupees.
          </p>
        </SectionHeader>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-6 max-w-3xl text-sm text-foreground-subtle">{ultraFairUseNote}</p>

        <div className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h3 className="text-3xl leading-tight text-foreground">Compare plans in full</h3>
          </div>
          <div className="lg:col-span-9">
            <PlanComparison />
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h3 className="text-3xl leading-tight text-foreground">Questions</h3>
          </div>
          <div className="lg:col-span-9">
            <FAQAccordion items={pricingFaq} />
          </div>
        </div>
      </Container>
    </section>
  );
}
