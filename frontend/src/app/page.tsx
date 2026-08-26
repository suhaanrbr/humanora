import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { MyVoicePreview } from "@/components/landing/MyVoicePreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { UseCases } from "@/components/landing/UseCases";
import { Pricing } from "@/components/landing/Pricing";
import { Trust } from "@/components/landing/Trust";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

/**
 * HUMANORA marketing landing page.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <MyVoicePreview />
        <HowItWorks />
        <UseCases />
        <Pricing />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
