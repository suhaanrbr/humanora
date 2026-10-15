import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config/site";
import { PLANS, type PlanId } from "@/lib/config/plans";
import { productFaq } from "@/lib/config/faq";

const PLAN_ORDER: PlanId[] = ["free", "essential", "pro", "ultra"];

/**
 * Truthful structured data only — no fake ratings, review counts, or
 * organization details (legal entity/address are still undecided, see
 * docs/legal placeholders, so they're simply omitted here rather than
 * invented). WebSite + SoftwareApplication describe what's genuinely
 * true today: a real, live web app with real, fixed prices (read from
 * the same plan config checkout uses, so they can't drift), plus the
 * homepage FAQ as FAQPage markup.
 */
export function StructuredData() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      offers: PLAN_ORDER.map((id) => ({
        "@type": "Offer",
        name: PLANS[id].name,
        price: String(PLANS[id].monthlyPriceInr),
        priceCurrency: "INR",
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: productFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Static, server-rendered JSON we constructed above from fixed
      // config values — never user input, so this is safe.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
