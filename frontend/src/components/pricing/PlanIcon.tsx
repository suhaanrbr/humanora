import type { PricingPlan } from "@/lib/config/pricing";

type IconProps = { className?: string };

/**
 * Small plan-specific glyphs for the pricing cards — sprout (Free), pen
 * (Essential), star (Pro), bolt (Ultra). Kept as simple line icons
 * consistent with the rest of HUMANORA's iconography.
 */
export function PlanIcon({
  icon,
  className,
}: {
  icon: PricingPlan["icon"];
  className?: string;
}) {
  switch (icon) {
    case "sprout":
      return <SproutIcon className={className} />;
    case "pen":
      return <PenIcon className={className} />;
    case "star":
      return <StarIcon className={className} />;
    case "bolt":
      return <BoltIcon className={className} />;
  }
}

function SproutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 21V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 12c0-3.5-2.5-6-7-6 0 3.9 2.8 6 7 6ZM12 9c0-3 2-5 6-5 0 3.3-2.4 5-6 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function PenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m4 20 1-4.5L15.5 5 19 8.5 8.5 19 4 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m13 7 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3.5 14.5 9l6 .8-4.4 4 1.2 5.9L12 16.9l-5.3 2.8L8 13.8l-4.4-4 6-.8L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
