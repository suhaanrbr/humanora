import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * A real screenshot of the product, framed as a numbered figure. Both a
 * dark and a light capture ship (public/images/product/*-{dark,light}.webp)
 * and CSS shows whichever matches the visitor's theme, so the product
 * always appears in the palette they're actually looking at.
 */
export function ProductShot({
  name,
  alt,
  figure,
  caption,
  priority,
  sizes = "(min-width: 1280px) 1200px, 100vw",
  className,
}: {
  name: "write" | "voice" | "library";
  alt: string;
  figure: string;
  caption: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div className="overflow-hidden rounded-lg border border-border-strong shadow-glow-md">
        {(["dark", "light"] as const).map((theme) => (
          <Image
            key={theme}
            src={`/images/product/${name}-${theme}.webp`}
            alt={theme === "dark" ? alt : ""}
            aria-hidden={theme === "light" ? true : undefined}
            width={2720}
            height={1720}
            sizes={sizes}
            priority={priority}
            className={cn("h-auto w-full", theme === "dark" ? "only-dark" : "only-light")}
          />
        ))}
      </div>
      <figcaption className="flex gap-3 text-sm text-foreground-subtle">
        <span className="shrink-0 text-foreground-muted">{figure}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
