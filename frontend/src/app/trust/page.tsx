import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Trust and privacy",
  description:
    "What happens to the text you give Humanora: what we store, what is sent to our AI provider, how payments work, and how to delete everything.",
  alternates: { canonical: "/trust" },
};

const SECTIONS = [
  {
    title: "What we store",
    points: [
      "Your account: name, email address, and a password that is only ever stored hashed.",
      "Your work: the text you submit and the rewrites, study notes and detector results we return. These are kept in your Library so you can come back to them.",
      "My Voice: the writing samples you choose to add, and the short style profile derived from them.",
    ],
  },
  {
    title: "What leaves Humanora",
    points: [
      "To produce a rewrite, a tool result, a detector result or a voice profile, the relevant text is sent to our AI provider, Google’s Gemini API, which processes it under its own terms.",
      "The Fact Checker additionally lets Gemini run Google searches on the claims in your text, so it can cite sources.",
      "The Citation Generator sends only a DOI you choose to look up to Crossref, the public registry of academic publications. Everything else it does happens in your browser.",
      "Humanora does not sell your text, show you ads, or use your writing to train any model.",
      "Avoid submitting highly sensitive personal, financial or confidential information. That's good practice with any online AI tool.",
    ],
  },
  {
    title: "Payments",
    points: [
      "Payments are handled by Razorpay. Your card, UPI and bank details go to Razorpay directly and never reach our servers.",
      "We keep only what we need to run your plan: an order status, a payment reference and the amount paid.",
      "Every plan is a single payment for 30 days. Nothing renews automatically.",
    ],
  },
  {
    title: "Your browser",
    points: [
      "One session cookie keeps you signed in.",
      "Small preferences, such as light or dark mode, are kept in your own browser, and the Citation Generator’s bibliography lives in your browser tab until you close it.",
      "No advertising cookies, no tracking pixels, no third-party analytics.",
    ],
  },
  {
    title: "Deleting your data",
    points: [
      "Delete any item from your Library, or any voice sample, whenever you like.",
      "Delete your whole account from Settings. That permanently removes your work, your voice profiles and your billing records with it.",
    ],
  },
  {
    title: "What our checks can and can’t do",
    points: [
      "The meaning check compares figures, dates, links and quotations between your original and the rewrite. It is a safety net, not a guarantee, so read anything important before you send it.",
      "The AI Detector reports a likelihood band and the signals behind it. No detector, ours included, can prove who wrote a piece of text.",
      "The free tells checker on our homepage runs entirely in your browser. Nothing you paste into it is sent anywhere.",
    ],
  },
] as const;

export default function TrustPage() {
  return (
    <>
      <Header />
      <main id="main" className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <p className="eyebrow pt-3 lg:col-span-3">Trust and privacy</p>
            <div className="lg:col-span-8">
              <h1 className="text-5xl leading-[1.05] text-foreground sm:text-6xl">
                Your writing is yours. Here&apos;s exactly what happens to it.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
                A plain-language summary of how Humanora handles your text and your data. The{" "}
                <Link href="/legal/privacy" className="text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
                  privacy policy
                </Link>{" "}
                has the full detail.
              </p>
            </div>
          </div>

          <div className="mt-16">
            {SECTIONS.map((section) => (
              <section key={section.title} className="grid grid-cols-1 gap-4 border-t border-border py-10 lg:grid-cols-12 lg:gap-10">
                <h2 className="text-2xl leading-snug text-foreground lg:col-span-3">{section.title}</h2>
                <ul className="flex flex-col gap-4 lg:col-span-7">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[1.0625rem] leading-relaxed text-foreground-muted">
                      <span className="mt-[0.7em] h-px w-3 shrink-0 bg-brand-purple" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
