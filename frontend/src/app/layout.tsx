import type { Metadata } from "next";
import { Sora, Inter, Geist_Mono } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/config/site";
import "./globals.css";

// Sora: geometric, confident display face for headings — reads as
// premium/technological without tipping into gimmicky. Inter: the body
// workhorse, chosen for long-form readability at small sizes. Both free,
// self-hosted via next/font (no external request, no license cost).
const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI humanizer",
    "AI writing humanizer",
    "humanize AI text",
    "natural writing",
    "AI text rewriter",
    "writing style",
    SITE_NAME,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

// HUMANORA is dark-mode only by deliberate product decision — there is
// no theme toggle and no Light/System option anywhere in the app.
// globals.css's `:root` (with no data-theme attribute at all) already
// resolves to the same dark palette that `:root[data-theme="dark"]`
// does, so simply never setting the attribute keeps every page dark,
// with no init script, no flash-of-wrong-theme concern, and no
// hydration-mismatch risk to guard against.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sora.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
