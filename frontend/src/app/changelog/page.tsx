import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { changelog, formatChangelogDate } from "@/lib/config/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in Humanora: every release, newest first.",
  alternates: { canonical: "/changelog" },
};

export default function ChangelogPage() {
  return (
    <>
      <Header />
      <main id="main" className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <p className="eyebrow pt-3 lg:col-span-3">Changelog</p>
            <div className="lg:col-span-8">
              <h1 className="text-5xl leading-[1.05] text-foreground sm:text-6xl">What&apos;s new.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground-muted">
                Every change that affects how you write with Humanora, newest first.
              </p>
            </div>
          </div>

          <ol className="mt-16">
            {changelog.map((entry) => (
              <li
                key={`${entry.date}-${entry.title}`}
                className="grid grid-cols-1 gap-3 border-t border-border py-8 lg:grid-cols-12 lg:gap-10"
              >
                <div className="flex items-baseline gap-3 lg:col-span-3 lg:flex-col lg:gap-1.5">
                  <time dateTime={entry.date} className="text-[0.9375rem] text-foreground-muted">
                    {formatChangelogDate(entry.date)}
                  </time>
                  <span className={entry.tag === "New" ? "eyebrow" : "text-app-label text-foreground-subtle"}>
                    {entry.tag}
                  </span>
                </div>
                <div className="lg:col-span-7">
                  <h2 className="text-2xl leading-snug text-foreground sm:text-3xl">{entry.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground-muted">{entry.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </main>
      <Footer />
    </>
  );
}
