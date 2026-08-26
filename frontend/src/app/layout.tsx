import type { Metadata } from "next";
import { Sora, Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
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
  title: "HUMANORA — AI drafts. Human impact.",
  description:
    "HUMANORA transforms AI-assisted writing into clearer, more natural writing while preserving meaning, facts, and citations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Sets data-theme before first paint — see lib/theme.tsx. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
