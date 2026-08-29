/**
 * Shared environmental typography for the cinematic scenes — one giant,
 * mostly-off-frame word sitting behind the scene's real content (the
 * "background typography" depth plane), plus a small editorial index
 * label ("02 / VOICE") in a corner. Pure CSS/SVG-adjacent text, so it
 * stays razor-sharp at any resolution up to 4K+ with zero asset
 * weight, and it's what turns a scene from "heading + card" into a
 * composed frame — the same two elements reused with different word/
 * alignment/tint per scene keeps the vocabulary consistent without
 * repeating layout code seven times.
 *
 * Not a scroll-scrubbed element — deliberately static per scene (real
 * motion budget goes to the actual subject), so it needs no ref, no
 * GSAP, and no reduced-motion branch of its own.
 */
export function SceneBackdrop({
  word,
  index,
  align = "left",
  tint = "rgba(168,85,247,0.14)",
}: {
  word: string;
  index: string;
  align?: "left" | "right";
  tint?: string;
}) {
  return (
    <>
      {/* Mobile: the desktop version is absolutely positioned to fill
          a fixed-height stage, which doesn't translate to a stacked,
          content-sized mobile layout — but mobile shouldn't lose the
          giant-typography identity entirely (every scene's environment
          used to just vanish below 860px). A smaller, static, inline
          version of the same word sits as the scene's own establishing
          moment before its real content, in normal flow. */}
      <div aria-hidden="true" className="pointer-events-none w-full select-none overflow-hidden text-center min-[860px]:hidden">
        <span
          className="font-display inline-block font-bold uppercase leading-none"
          style={{
            fontSize: "clamp(3.5rem, 22vw, 6rem)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.08)",
            backgroundImage: `linear-gradient(180deg, ${tint}, transparent)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {word}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden max-[859px]:hidden"
      >
        <span
          className="font-display absolute top-1/2 -translate-y-1/2 font-bold uppercase leading-none"
          style={{
            [align]: "-4vw",
            // Capped too low previously (22rem/352px) — past ~1600px
            // viewport width the word stopped growing at all, so the
            // environment stayed the same size while the canvas around
            // it kept expanding, reading as dead space rather than a
            // composition that uses a 4K/ultrawide canvas. Cap raised
            // to 48rem so it keeps scaling meaningfully further out.
            fontSize: "clamp(7rem, 26vw, 48rem)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.06)",
            backgroundImage: `linear-gradient(180deg, ${tint}, transparent)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {word}
        </span>
      </div>
      {/* Anchored near the top, not the bottom edge — a label pinned to
          the bottom of a scene's own box is exactly what's still on
          screen (as an orphaned scrap) once that scene has scrolled
          mostly past and the NEXT scene already dominates the
          viewport. Top-anchored, it scrolls away together with the
          rest of this scene's own content instead of trailing into
          the handoff. */}
      <div className="pointer-events-none absolute top-6 left-6 z-10 font-mono text-[11px] tracking-[0.2em] text-white/35 max-[859px]:hidden">
        {index}
      </div>
    </>
  );
}
