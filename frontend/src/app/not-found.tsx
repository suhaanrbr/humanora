import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-ambient-glow-soft flex flex-1 items-center py-24">
        <Container className="text-center">
          <p className="text-brand-gradient text-sm font-semibold uppercase tracking-wide">
            404
          </p>
          <h1 className="mx-auto mt-4 max-w-lg text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Looks like this sentence went missing.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-foreground-muted">
            The page you&apos;re looking for doesn&apos;t exist — it may have
            moved, or the link might be out of date.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="focus-ring press-feedback bg-brand-gradient inline-flex h-12 items-center justify-center rounded-md px-6 text-base font-medium text-white shadow-glow-sm transition-[filter,box-shadow] hover:shadow-glow-md hover:brightness-110"
            >
              Back to HUMANORA
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
