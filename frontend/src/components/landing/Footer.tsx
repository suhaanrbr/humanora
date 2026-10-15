import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { CONTACT_EMAIL } from "@/lib/config/site";

interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

// Real routes and anchors only. Contact appears once a monitored inbox
// is configured (see CONTACT_EMAIL), never before.
const footerColumns: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Writing modes", href: "/#writing-modes" },
      { label: "My Voice", href: "/#my-voice" },
      { label: "Meaning check", href: "/#meaning" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "For",
    links: [
      { label: "Students", href: "/for/students" },
      { label: "Professionals", href: "/for/professionals" },
      { label: "Writers", href: "/for/writers" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      ...(CONTACT_EMAIL ? [{ label: "Contact", href: "/contact" }] : []),
      { label: "Trust and privacy", href: "/trust" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookies", href: "/legal/cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <Logo size="md" />
            <p className="font-display mt-5 max-w-sm text-xl italic leading-snug text-foreground-muted">
              Write with AI. Sound like yourself.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading} className="lg:col-span-2">
              <h2 className="text-app-label font-sans text-foreground-subtle">{column.heading}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="focus-ring rounded-sm text-[0.9375rem] text-foreground-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-6 text-sm text-foreground-subtle sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Humanora</p>
          <p>Payments processed securely by Razorpay.</p>
        </div>
      </Container>
    </footer>
  );
}
