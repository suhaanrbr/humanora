/**
 * A precise, technical-drawing corner-bracket treatment — four small
 * L-marks at the corners of a card, the same device blueprints/
 * viewfinders use to say "this is a measured, exact object" rather
 * than a soft rounded card. Purely decorative (aria-hidden), pure
 * SVG/CSS — no asset weight, sharp at any resolution/DPI. Meant to sit
 * as an absolutely-positioned overlay inside a `position: relative`
 * card; the card keeps its own background/border, this just adds the
 * four corner accents on top.
 */
export function CornerFrame({ color = "currentColor" }: { color?: string }) {
  const mark = (
    <svg viewBox="0 0 16 16" className="h-4 w-4" style={{ color }}>
      <path d="M1 9V3a2 2 0 0 1 2-2h6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute left-2 top-2">{mark}</div>
      <div className="absolute right-2 top-2 rotate-90">{mark}</div>
      <div className="absolute bottom-2 right-2 rotate-180">{mark}</div>
      <div className="absolute bottom-2 left-2 -rotate-90">{mark}</div>
    </div>
  );
}
