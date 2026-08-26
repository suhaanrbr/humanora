import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

interface FooterLink {
  label: string;
  href?: string;
  soon?: boolean;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

// Real routes/anchors get an href; anything without a built destination
// is marked `soon` and rendered as plain text with a "Soon" tag instead
// of a link to a page that doesn't exist.
const footerColumns: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Humanizer", href: "/#hero" },
      { label: "Writing Modes", href: "/#writing-modes" },
      { label: "My Voice", href: "/#my-voice" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Students", href: "/#use-cases" },
      { label: "Professionals", href: "/#use-cases" },
      { label: "Creators", href: "/#use-cases" },
      { label: "Teams", soon: true },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "API", href: "/api" },
      { label: "Documentation", soon: true },
      { label: "API Pricing", href: "/api#pricing" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guides", soon: true },
      { label: "FAQ", href: "/#pricing" },
      { label: "Affiliates", href: "/affiliates" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookie Policy", href: "/legal/cookies" },
    ],
  },
];

/**
 * Site footer. Placeholder navigation only — no fabricated company
 * registration details or addresses. Links point only to real routes or
 * in-page anchors; anything not built yet is labeled "Soon" rather than
 * linking somewhere misleading.
 */
export function Footer() {
  return (
    <footer className="border-fade-top border-t border-border">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-7">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm text-foreground-muted">
              AI drafts. Human impact.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-semibold text-foreground">{column.heading}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.soon || !link.href ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-foreground-subtle">
                        {link.label}
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                          Soon
                        </span>
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className="focus-ring rounded-md text-sm text-foreground-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground-subtle">
            © {new Date().getFullYear()} HUMANORA. All rights reserved.
          </p>
          <p className="text-xs text-foreground-subtle">AI drafts. Human impact.</p>
        </div>
      </Container>
    </footer>
  );
}
