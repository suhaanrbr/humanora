import { Header } from "@/components/landing/Header";
import { LandingCinematicEnvironment } from "@/components/landing/cinematic/LandingCinematicEnvironment";
import { DimensionalH } from "@/components/landing/cinematic/DimensionalH";
import { HumanizeScene } from "@/components/landing/cinematic/HumanizeScene";
import { WorkspaceExpansionScene } from "@/components/landing/cinematic/WorkspaceExpansionScene";
import { MyVoiceScene } from "@/components/landing/cinematic/MyVoiceScene";
import { StudyScene } from "@/components/landing/cinematic/StudyScene";
import { LibraryScene } from "@/components/landing/cinematic/LibraryScene";
import { ConnectedWorkspaceScene } from "@/components/landing/cinematic/ConnectedWorkspaceScene";
import { ConversionIntro } from "@/components/landing/cinematic/ConversionIntro";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { UseCases } from "@/components/landing/UseCases";
import { PreserveMeaning } from "@/components/landing/PreserveMeaning";
import { Pricing } from "@/components/landing/Pricing";
import { Trust } from "@/components/landing/Trust";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { StructuredData } from "@/components/seo/StructuredData";

/**
 * HUMANORA marketing landing page — one continuous cinematic journey
 * (see src/components/landing/cinematic/) from the dimensional-H
 * arrival through seven scroll-scrubbed scenes into a deliberately
 * calm, ordinary-flow conversion sequence. Scenes replace what used to
 * be separate "Hero," "Features," "Writing Modes," "My Voice Preview,"
 * and "How It Works" sections — their real content now lives inside
 * the scenes themselves rather than as duplicate sections further down
 * the page (see each scene's own doc comment for what it absorbed).
 * ProductShowcase (the one genuinely interactive product demo) and the
 * real Pricing/Trust/PreserveMeaning/FinalCta sections are kept as-is
 * — deliberately flat and calm, not re-animated, per the spec's own
 * "flatten toward conversion" instruction.
 */
export default function Home() {
  return (
    <>
      <StructuredData />
      <Header />
      <main>
        {/* One shared dark base + one persistent H-thread behind the
            entire cinematic act (Arrival through the ProductShowcase
            hand-off) — see LandingCinematicEnvironment's own comment
            for why this, not per-scene backgrounds, is what actually
            makes the sequence read as one environment. */}
        <LandingCinematicEnvironment containerId="cinematic-act" />
        <div id="cinematic-act">
          <DimensionalH />
          <HumanizeScene />
          <WorkspaceExpansionScene />
          <MyVoiceScene />
          <StudyScene />
          <LibraryScene />
          <ConnectedWorkspaceScene />
          {/* Forced-dark regardless of site theme — see .cinematic-embed
              in globals.css. Keeps ProductShowcase visually continuous
              with the cinematic scenes surrounding it for Light-theme
              visitors, without touching ProductShowcase itself or the
              app's real theme toggle. */}
          <div className="cinematic-embed">
            <ProductShowcase />
          </div>
          <ConversionIntro />
        </div>
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
