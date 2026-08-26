import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PlanIcon } from "@/components/pricing/PlanIcon";
import { cn } from "@/lib/cn";
import type { PricingPlan } from "@/lib/config/pricing";
import type { BillingPeriod } from "@/components/pricing/BillingToggle";

export interface PricingCardProps {
  plan: PricingPlan;
  period: BillingPeriod;
}

/**
 * A single pricing tile. Pro (`plan.highlighted`) gets an elevated
 * treatment so it visually leads without making its siblings look
 * unimportant: a warm-ivory card in Dark Mode, a bright pearl card with
 * a violet border and soft glow in Light Mode (see --color-surface-warm).
 */
export function PricingCard({ plan, period }: PricingCardProps) {
  const price = period === "yearly" ? plan.annualMonthlyPrice : plan.monthlyPrice;
  const isFree = plan.monthlyPrice === 0;

  return (
    <Card
      className={cn(
        "hover-lift relative flex h-full flex-col p-7 transition-shadow",
        plan.highlighted
          ? "border-brand-purple/35 bg-surface-warm text-surface-warm-foreground shadow-glow-md"
          : "pearl-glass hover:shadow-glow-sm"
      )}
    >
      {plan.badge && (
        <Badge
          variant="brand"
          className={cn(
            "absolute -top-3 left-7",
            plan.highlighted && "border-accent-amber/50 bg-accent-amber/20 text-accent-amber"
          )}
        >
          {plan.badge}
        </Badge>
      )}

      <div
        className={cn(
          "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md border",
          plan.highlighted
            ? "border-surface-warm-foreground/10 bg-surface-warm-foreground/5 text-accent-amber"
            : "border-border bg-background-elevated text-brand-purple"
        )}
      >
        <PlanIcon icon={plan.icon} className="h-5 w-5" />
      </div>

      <p className={cn("text-sm font-medium", plan.highlighted ? "text-surface-warm-foreground/70" : "text-foreground-muted")}>
        {plan.name}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span
          key={`${plan.id}-${period}`}
          className={cn(
            "animate-fade-in-up text-4xl font-bold tracking-tight",
            plan.highlighted ? "text-surface-warm-foreground" : "text-foreground"
          )}
        >
          ${price}
        </span>
        <span className={cn("text-sm", plan.highlighted ? "text-surface-warm-foreground/60" : "text-foreground-subtle")}>
          /month
        </span>
      </div>
      {!isFree && period === "yearly" && (
        <p className={cn("mt-1 text-xs", plan.highlighted ? "text-surface-warm-foreground/60" : "text-foreground-subtle")}>
          billed annually
        </p>
      )}

      <p className={cn("mt-4 text-sm", plan.highlighted ? "text-surface-warm-foreground/75" : "text-foreground-muted")}>
        {plan.audience}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li
            key={feature.label}
            className={cn(
              "flex items-start gap-2 text-sm",
              plan.highlighted ? "text-surface-warm-foreground/85" : "text-foreground-muted"
            )}
          >
            <CheckIcon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                plan.highlighted ? "text-accent-amber" : "text-brand-purple"
              )}
            />
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      <ButtonLink
        href={isFree ? "/#try-it" : "/login"}
        variant={plan.highlighted ? "primary" : "secondary"}
        className="mt-8 w-full"
      >
        {plan.ctaLabel}
      </ButtonLink>
    </Card>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
