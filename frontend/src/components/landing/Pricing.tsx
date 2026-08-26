import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { pricingPlans } from "@/lib/config/pricing";
import { cn } from "@/lib/cn";

/**
 * Pricing section, rendered entirely from the `pricingPlans` configuration
 * (see src/lib/config/pricing.ts). No plan data is duplicated here.
 */
export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base text-foreground-muted">
            Start free. Upgrade as your writing needs grow.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col p-6",
                plan.highlighted && "border-brand-purple/50 shadow-glow-md"
              )}
            >
              {plan.badge && (
                <Badge variant="brand" className="absolute -top-3 left-6">
                  {plan.badge}
                </Badge>
              )}

              <p className="text-sm font-medium text-foreground-muted">{plan.name}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-foreground-subtle">{plan.billingPeriod}</span>
              </div>
              <p className="mt-3 text-sm text-foreground-muted">{plan.description}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2 text-sm text-foreground-muted">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "primary" : "secondary"}
                className="mt-8 w-full"
              >
                {plan.ctaLabel}
              </Button>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-foreground-subtle">
          Pricing shown reflects current product configuration and may change
          as HUMANORA evolves. No payment is collected yet.
        </p>
      </Container>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
