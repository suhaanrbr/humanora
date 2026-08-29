/**
 * Continues the cinematic act's own "01 / WRITE" … "06 / WORKSPACE"
 * numbering into the calmer back half of the page (Product/Use Cases
 * through the final CTA) — the single cheapest, lowest-risk way to
 * tie two visually different halves of the page into one numbered
 * sequence instead of two unrelated design languages meeting head-on.
 * Same typography, same treatment, just placed inline in normal flow
 * (these sections aren't pinned/dark-forced, so no absolute positioning
 * or fixed dark-on-dark contrast assumptions like the cinematic one).
 */
export function SectionIndex({ children }: { children: string }) {
  return <p className="mb-4 font-mono text-[11px] tracking-[0.2em] text-foreground-subtle/60">{children}</p>;
}
