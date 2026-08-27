const MAX_TITLE_LENGTH = 60;

/**
 * Deterministic title for a saved humanization — no AI call, just the
 * first meaningful line of the original input, trimmed to a sensible
 * length. Used anywhere a history entry needs a short label (dashboard
 * recent work, the History workspace) instead of showing raw output
 * text as a "title".
 */
export function deriveTitle(inputText: string): string {
  const firstLine = inputText.trim().split(/\r?\n/)[0]?.trim() ?? "";
  const source = firstLine || inputText.trim();
  if (source.length <= MAX_TITLE_LENGTH) return source || "Untitled";
  // Break on the last whole word within the limit rather than
  // mid-word, so the ellipsis reads cleanly.
  const truncated = source.slice(0, MAX_TITLE_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated).trimEnd() + "…";
}
