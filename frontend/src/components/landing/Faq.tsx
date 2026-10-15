import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { productFaq } from "@/lib/config/faq";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="Questions" title="Before you start." />
        <div className="mt-12 lg:ml-[25%] lg:pl-10">
          <FAQAccordion items={productFaq} />
        </div>
      </Container>
    </section>
  );
}
