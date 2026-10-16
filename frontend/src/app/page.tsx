import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TickerBand } from "@/components/landing/TickerBand";
import { Showcase } from "@/components/landing/Showcase";
import { Tells } from "@/components/landing/Tells";
import { Method } from "@/components/landing/Method";
import { Modes } from "@/components/landing/Modes";
import { Voice } from "@/components/landing/Voice";
import { Meaning } from "@/components/landing/Meaning";
import { Workspace } from "@/components/landing/Workspace";
import { Audiences } from "@/components/landing/Audiences";
import { Pricing } from "@/components/landing/Pricing";
import { Principles } from "@/components/landing/Principles";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { StructuredData } from "@/components/seo/StructuredData";

/**
 * Humanora marketing page, composed as one long-form editorial read:
 * the promise and a worked example (Hero), why it matters (Tells), how
 * it works (Method), then each capability in the order a new writer
 * meets it (Modes, Voice, Meaning), worked examples across document
 * types (Showcase), the wider toolkit (Workspace), who it's for, what it
 * costs, and what we hold ourselves to. Every section opens with the
 * same SectionHeader rule so the page reads as a single publication.
 */
export default function Home() {
  return (
    <>
      <StructuredData />
      <AnnouncementBar />
      <Header />
      <main id="main">
        <Hero />
        <TickerBand />
        <Tells />
        <Method />
        <Modes />
        <Voice />
        <Meaning />
        <Showcase />
        <Workspace />
        <Audiences />
        <Pricing />
        <Principles />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
