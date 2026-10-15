import type { Metadata } from "next";
import { Newsreader, Source_Serif_4, Courier_Prime } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/config/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Humanora is set entirely in serif type — a writing product should look
// like it respects writing. Newsreader carries display type; Source
// Serif 4 carries body and UI text. Code samples use Courier Prime, a
// slab-serif monospace, so no sans-serif face ships anywhere. All three
// are self-hosted via next/font. Both serifs offer an optical-size
// axis; it is deliberately left out because it nearly doubled the
// preloaded font payload (~520 KB vs ~320 KB) for a refinement few
// readers would notice, and it was the main drag on first paint.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400", "700"],
  // Only used for the odd code fragment; never worth a preload.
  preload: false,
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

// Two palettes (globals.css): dark "ink" and light "paper". The inline
// script in <head> sets <html data-theme> before first paint from the
// visitor's saved choice or their OS preference; suppressHydrationWarning
// covers that one attribute, which the server can't know in advance.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${newsreader.variable} ${sourceSerif.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
