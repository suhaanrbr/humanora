import { Header } from "@/components/landing/Header";
import { DimensionalH } from "@/components/landing/cinematic/DimensionalH";
import { ConversionIntro } from "@/components/landing/cinematic/ConversionIntro";
import { Pillars } from "@/components/landing/Pillars";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { UseCases } from "@/components/landing/UseCases";
import { PreserveMeaning } from "@/components/landing/PreserveMeaning";
import { Pricing } from "@/components/landing/Pricing";
import { Trust } from "@/components/landing/Trust";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { StructuredData } from "@/components/seo/StructuredData";

/**
 * HUMANORA marketing landing page. DimensionalH is the real hero (the
 * one cinematic beat worth keeping — a dimensional H mark, one
 * headline, two CTAs, no scroll-scrubbing). It used to hand off into
 * six more full-viewport scroll-scrubbed scenes, each just one giant
 * outlined word over ~2,500px of near-empty space — replaced here by
 * Pillars, a single normal-height section carrying the same four
 * product ideas (Humanize/My Voice/Study/Library) as real, readable
 * cards in the same visual language as UseCases/PreserveMeaning below.
 * ProductShowcase (the one genuinely interactive product demo) and the
 * real Pricing/Trust/PreserveMeaning/FinalCta sections are kept as-is
 * — deliberately flat and calm, per the original spec's own "flatten
 * toward conversion" instruction.
 */
export default function Home() {
  return (
    <>
      <StructuredData />
      <Header />
      <main>
        <DimensionalH />
        <Pillars />
        {/* Forced-dark regardless of site theme — see .cinematic-embed
            in globals.css. Keeps ProductShowcase visually continuous
            with the dark hero above it for Light-theme visitors,
            without touching ProductShowcase itself or the app's real
            theme toggle. */}
        <div className="cinematic-embed">
          <ProductShowcase />
        </div>
        <ConversionIntro />
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
