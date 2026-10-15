import type { Metadata } from "next";
import { Newsreader, Source_Serif_4, Courier_Prime } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/config/site";
import "./globals.css";

// Humanora is set entirely in serif type — a writing product should look
// like it respects writing. Newsreader (optical-size axis, built for
// headlines) carries display type; Source Serif 4 carries body and UI
// text, where its own optical sizing keeps small labels crisp. Code
// samples use Courier Prime, a slab-serif monospace, so no sans-serif
// face ships anywhere. All three are self-hosted via next/font.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
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

// Humanora is dark-mode only by deliberate product decision — there is
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
      className={`${newsreader.variable} ${sourceSerif.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
