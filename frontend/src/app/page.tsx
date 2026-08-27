import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Features } from "@/components/landing/Features";
import { WritingModes } from "@/components/landing/WritingModes";
import { MyVoicePreview } from "@/components/landing/MyVoicePreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { UseCases } from "@/components/landing/UseCases";
import { PreserveMeaning } from "@/components/landing/PreserveMeaning";
import { Pricing } from "@/components/landing/Pricing";
import { Trust } from "@/components/landing/Trust";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { StructuredData } from "@/components/seo/StructuredData";

/**
 * HUMANORA marketing landing page.
 */
export default function Home() {
  return (
    <>
      <StructuredData />
      <Header />
      <main>
        <Hero />
        <LiveDemo />
        <Features />
        <WritingModes />
        <MyVoicePreview />
        <HowItWorks />
        <UseCases />
        <PreserveMeaning />
        <Pricing />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
