import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/config/site";
import "./globals.css";

// Plus Jakarta Sans is HUMANORA's one master UI typeface — headings and
// body both draw from this single family (weight, not a second face, is
// what separates "Display" from "Caption") rather than pairing two
// different fonts. One font load, one variable, self-hosted via
// next/font (no external request, no runtime fetch, no license cost).
// Only the five weights the type scale actually uses — see the type
// scale in globals.css — not the full variable-font weight range.
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
