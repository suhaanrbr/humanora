import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config/site";

/**
 * Truthful structured data only — no fake ratings, review counts, or
 * organization details (legal entity/address are still undecided, see
 * docs/legal placeholders, so they're simply omitted here rather than
 * invented). WebSite + SoftwareApplication describe what's genuinely
 * true today: a real, live web app with real, fixed prices.
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
      offers: [
        { "@type": "Offer", name: "Essential", price: "399", priceCurrency: "INR" },
        { "@type": "Offer", name: "Pro", price: "599", priceCurrency: "INR" },
        { "@type": "Offer", name: "Ultra", price: "999", priceCurrency: "INR" },
      ],
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
