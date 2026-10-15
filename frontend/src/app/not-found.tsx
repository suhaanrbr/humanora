import { ButtonLink } from "@/components/ui/ButtonLink";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1 items-center py-24">
        <Container>
          <p className="eyebrow">Error 404</p>
          <h1 className="text-hero mt-6 max-w-3xl text-foreground">
            This page didn&apos;t make the <em className="text-brand-purple">final edit.</em>
          </h1>
          <p className="mt-8 max-w-md text-lg text-foreground-muted">
            The link may be out of date, or the page may have moved.
          </p>
          <div className="mt-10">
            <ButtonLink href="/" variant="primary" size="lg">
              Back to the homepage
            </ButtonLink>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
