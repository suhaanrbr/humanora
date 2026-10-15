/**
 * Citation formatting for the Citation Generator. Deterministic, no AI:
 * the rules for each style are encoded here and covered by
 * citation.test.ts. Output is a list of segments so the UI can render
 * italics and copy either rich text or plain text.
 *
 * Styles: APA 7th, MLA 9th, Chicago 17th (author-date), Harvard (Cite
 * Them Right). Source types: journal article, book, web page.
 */

export const CITATION_STYLES = ["apa", "mla", "chicago", "harvard"] as const;
export type CitationStyle = (typeof CITATION_STYLES)[number];

export const STYLE_LABELS: Record<CitationStyle, string> = {
  apa: "APA 7",
  mla: "MLA 9",
  chicago: "Chicago",
  harvard: "Harvard",
};

export const SOURCE_TYPES = ["journal", "book", "website"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export interface Author {
  given: string;
  family: string;
}

export interface CitationSource {
  type: SourceType;
  authors: Author[];
  /** Used instead of personal authors when set (e.g. "World Health Organization"). */
  organization?: string;
  title: string;
  /** Journal name, or website name. */
  container?: string;
  publisher?: string;
  year?: string;
  month?: number; // 1-12
  day?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  edition?: string;
  doi?: string;
  url?: string;
  /** ISO date the web page was accessed. */
  accessed?: string;
}

export interface Segment {
  text: string;
  italic?: boolean;
}

export interface Citation {
  reference: Segment[];
  inText: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MLA_MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const clean = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim();

function initials(given: string) {
  return clean(given)
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) =>
      part
        .split("-")
        .map((p) => `${p[0].toUpperCase()}.`)
        .join("-")
    )
    .join(" ");
}

function ordinal(n: string) {
  const num = parseInt(n, 10);
  if (!num) return clean(n);
  const suffix = num % 100 >= 11 && num % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][num % 10] ?? "th";
  return `${num}${suffix}`;
}

/** Ends a piece with a period unless it already ends in terminal punctuation. */
function withPeriod(s: string) {
  return /[.?!]$/.test(s) ? s : `${s}.`;
}

function doiUrl(doi?: string) {
  const d = clean(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
  return d ? `https://doi.org/${d}` : "";
}

function link(src: CitationSource) {
  return doiUrl(src.doi) || clean(src.url);
}

function pagesRange(pages?: string) {
  return clean(pages).replace(/\s*[-–—]\s*/g, "–");
}

function people(src: CitationSource): Author[] {
  return src.authors
    .map((a) => ({ given: clean(a.given), family: clean(a.family) }))
    .filter((a) => a.family || a.given);
}

/** Joins with commas and a final conjunction ("A, B, and C" / "A and B"). */
function listJoin(items: string[], conj: string, oxford: boolean) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} ${conj} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}${oxford ? "," : ""} ${conj} ${items[items.length - 1]}`;
}

function formatAccessed(iso: string | undefined, style: "mla" | "harvard") {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return style === "mla" ? `${day} ${MLA_MONTHS[d.getUTCMonth()]} ${year}` : `${day} ${MONTHS[d.getUTCMonth()]} ${year}`;
}

// ---------------------------------------------------------------------------
// Authors, per style
// ---------------------------------------------------------------------------

function apaAuthors(src: CitationSource) {
  if (clean(src.organization)) return clean(src.organization);
  const list = people(src).map((a) => (a.given ? `${a.family}, ${initials(a.given)}` : a.family));
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length <= 20) return `${list.slice(0, -1).join(", ")}, & ${list[list.length - 1]}`;
  return `${list.slice(0, 19).join(", ")}, . . . ${list[list.length - 1]}`;
}

function mlaAuthors(src: CitationSource) {
  if (clean(src.organization)) return clean(src.organization);
  const list = people(src);
  if (list.length === 0) return "";
  const first = list[0].given ? `${list[0].family}, ${list[0].given}` : list[0].family;
  if (list.length === 1) return first;
  if (list.length === 2) return `${first}, and ${[list[1].given, list[1].family].filter(Boolean).join(" ")}`;
  return `${first}, et al`;
}

function chicagoAuthors(src: CitationSource) {
  if (clean(src.organization)) return clean(src.organization);
  const list = people(src);
  if (list.length === 0) return "";
  const names = list.map((a, i) => (i === 0 ? (a.given ? `${a.family}, ${a.given}` : a.family) : [a.given, a.family].filter(Boolean).join(" ")));
  if (names.length > 10) return `${names.slice(0, 7).join(", ")}, et al`;
  if (names.length === 2) return `${names[0]}, and ${names[1]}`;
  return listJoin(names, "and", true);
}

function harvardAuthors(src: CitationSource) {
  if (clean(src.organization)) return clean(src.organization);
  const list = people(src).map((a) => (a.given ? `${a.family}, ${initials(a.given)}` : a.family));
  if (list.length === 0) return "";
  if (list.length >= 4) return `${list[0]} et al.`;
  return listJoin(list, "and", false);
}

// ---------------------------------------------------------------------------
// In-text citations
// ---------------------------------------------------------------------------

function shortTitle(title: string) {
  const words = clean(title).split(" ");
  return words.length > 4 ? `${words.slice(0, 4).join(" ")}…` : clean(title);
}

function inTextNames(src: CitationSource, style: CitationStyle) {
  if (clean(src.organization)) return clean(src.organization);
  const fam = people(src).map((a) => a.family || a.given);
  if (fam.length === 0) return "";
  const and = style === "apa" ? "&" : "and";
  if (fam.length === 1) return fam[0];
  if (fam.length === 2) return `${fam[0]} ${and} ${fam[1]}`;
  if (style === "chicago" && fam.length === 3) return `${fam[0]}, ${fam[1]}, and ${fam[2]}`;
  if (style === "harvard" && fam.length === 3) return `${fam[0]}, ${fam[1]} and ${fam[2]}`;
  return `${fam[0]} et al.`;
}

function inText(src: CitationSource, style: CitationStyle) {
  const names = inTextNames(src, style);
  const year = clean(src.year) || "n.d.";
  const quotedTitle = src.type === "book" ? shortTitle(src.title) : `“${shortTitle(src.title)}”`;
  if (style === "mla") return `(${names || quotedTitle})`;
  const who = names || quotedTitle;
  if (style === "chicago") return `(${who} ${year})`;
  return `(${who}, ${year})`;
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

function apa(src: CitationSource): Segment[] {
  const authors = apaAuthors(src);
  const year = clean(src.year);
  let date = year || "n.d.";
  if (src.type === "website" && year && src.month) date = `${year}, ${MONTHS[src.month - 1]}${src.day ? ` ${src.day}` : ""}`;
  const title = clean(src.title);
  const out: Segment[] = [];
  const titleItalic = src.type !== "journal";
  const titleSeg = (s: string): Segment => ({ text: s, italic: titleItalic });

  if (authors) {
    out.push({ text: `${withPeriod(authors)} (${date}). ` });
    if (src.type === "book" && src.edition) {
      out.push(titleSeg(title), { text: ` (${ordinal(src.edition)} ed.). ` });
    } else {
      out.push(titleSeg(withPeriod(title)), { text: " " });
    }
  } else {
    // No author: the title moves into the author position.
    out.push(titleSeg(withPeriod(title)), { text: ` (${date}). ` });
  }

  if (src.type === "journal") {
    if (src.container) {
      out.push({ text: clean(src.container), italic: true });
      if (src.volume) out.push({ text: ", " }, { text: clean(src.volume), italic: true });
      if (src.issue) out.push({ text: `(${clean(src.issue)})` });
      if (src.pages) out.push({ text: `, ${pagesRange(src.pages)}` });
      out.push({ text: ". " });
    }
  } else if (src.type === "book") {
    if (src.publisher) out.push({ text: `${withPeriod(clean(src.publisher))} ` });
  } else if (src.container && clean(src.container) !== authors) {
    out.push({ text: `${withPeriod(clean(src.container))} ` });
  }
  const l = link(src);
  if (l) out.push({ text: l });
  return trimEnd(out);
}

function mla(src: CitationSource): Segment[] {
  const authors = mlaAuthors(src);
  const title = clean(src.title);
  const out: Segment[] = [];
  if (authors) out.push({ text: `${withPeriod(authors)} ` });
  if (src.type === "book") out.push({ text: withPeriod(title), italic: true }, { text: " " });
  else out.push({ text: `“${withPeriod(title)}” ` });

  const parts: Segment[][] = [];
  if (src.type === "journal") {
    if (src.container) parts.push([{ text: clean(src.container), italic: true }]);
    if (src.volume) parts.push([{ text: `vol. ${clean(src.volume)}` }]);
    if (src.issue) parts.push([{ text: `no. ${clean(src.issue)}` }]);
    if (src.year) parts.push([{ text: clean(src.year) }]);
    if (src.pages) parts.push([{ text: `${/[-–—]/.test(src.pages) ? "pp." : "p."} ${pagesRange(src.pages)}` }]);
  } else if (src.type === "book") {
    if (src.edition) parts.push([{ text: `${ordinal(src.edition)} ed.` }]);
    if (src.publisher) parts.push([{ text: clean(src.publisher) }]);
    if (src.year) parts.push([{ text: clean(src.year) }]);
  } else {
    if (src.container) parts.push([{ text: clean(src.container), italic: true }]);
    if (src.year) {
      const date = src.month ? `${src.day ? `${src.day} ` : ""}${MLA_MONTHS[src.month - 1]} ${clean(src.year)}` : clean(src.year);
      parts.push([{ text: date }]);
    }
  }
  const l = link(src).replace(/^https?:\/\//, src.doi ? "https://" : "");
  if (l) parts.push([{ text: l }]);

  parts.forEach((p, i) => {
    out.push(...p);
    out.push({ text: i < parts.length - 1 ? ", " : "." });
  });
  if (src.type === "website" && src.accessed) out.push({ text: ` Accessed ${formatAccessed(src.accessed, "mla")}.` });
  return trimEnd(out);
}

function chicago(src: CitationSource): Segment[] {
  const authors = chicagoAuthors(src);
  const year = clean(src.year) || "n.d.";
  const title = clean(src.title);
  const out: Segment[] = [];
  const titleSegs: Segment[] =
    src.type === "book" ? [{ text: withPeriod(title), italic: true }] : [{ text: `“${withPeriod(title)}”` }];

  if (authors) out.push({ text: `${withPeriod(authors)} ${year}. ` }, ...titleSegs);
  else out.push(...titleSegs, { text: ` ${year}.` });

  if (src.type === "journal") {
    if (src.container) {
      out.push({ text: " " }, { text: clean(src.container), italic: true });
      if (src.volume) out.push({ text: ` ${clean(src.volume)}` });
      if (src.issue) out.push({ text: ` (${clean(src.issue)})` });
      if (src.pages) out.push({ text: `: ${pagesRange(src.pages)}` });
      out.push({ text: "." });
    }
  } else if (src.type === "book") {
    if (src.edition) out.push({ text: ` ${ordinal(src.edition)} ed.` });
    if (src.publisher) out.push({ text: ` ${withPeriod(clean(src.publisher))}` });
  } else {
    if (src.container) out.push({ text: ` ${withPeriod(clean(src.container))}` });
    if (src.month) out.push({ text: ` ${MONTHS[src.month - 1]}${src.day ? ` ${src.day}` : ""}.` });
  }
  const l = link(src);
  if (l) out.push({ text: ` ${withPeriod(l)}` });
  return trimEnd(out);
}

function harvard(src: CitationSource): Segment[] {
  const authors = harvardAuthors(src);
  const year = clean(src.year) || "no date";
  const title = clean(src.title);
  const out: Segment[] = [];
  const lead = authors || "";
  if (lead) out.push({ text: `${lead} (${year}) ` });

  if (src.type === "journal") {
    out.push({ text: `‘${title}’` });
    if (!lead) out.push({ text: ` (${year})` });
    if (src.container) {
      out.push({ text: ", " }, { text: clean(src.container), italic: true });
      if (src.volume) out.push({ text: `, ${clean(src.volume)}${src.issue ? `(${clean(src.issue)})` : ""}` });
      if (src.pages) out.push({ text: `, ${/[-–—]/.test(src.pages) ? "pp." : "p."} ${pagesRange(src.pages)}` });
    }
    out.push({ text: "." });
  } else {
    out.push({ text: withPeriod(title), italic: true });
    if (!lead) out.push({ text: ` (${year}).` });
    if (src.type === "book") {
      if (src.edition) out.push({ text: ` ${ordinal(src.edition)} edn.` });
      if (src.publisher) out.push({ text: ` ${withPeriod(clean(src.publisher))}` });
    }
  }
  const l = link(src);
  if (l) {
    out.push({ text: ` Available at: ${l}` });
    const accessed = formatAccessed(src.accessed, "harvard");
    out.push({ text: accessed && !src.doi ? ` (Accessed: ${accessed}).` : "." });
  }
  return trimEnd(out);
}

function trimEnd(segments: Segment[]) {
  const out = segments.filter((s) => s.text.length > 0);
  const last = out[out.length - 1];
  if (last) last.text = last.text.replace(/\s+$/, "");
  return out;
}

export function formatCitation(src: CitationSource, style: CitationStyle): Citation {
  const reference = style === "apa" ? apa(src) : style === "mla" ? mla(src) : style === "chicago" ? chicago(src) : harvard(src);
  return { reference, inText: inText(src, style) };
}

export function citationPlainText(segments: Segment[]) {
  return segments.map((s) => s.text).join("");
}

export function citationHtml(segments: Segment[]) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return segments.map((s) => (s.italic ? `<i>${esc(s.text)}</i>` : esc(s.text))).join("");
}

/** Parses "Jane Q. Doe" / "Doe, Jane Q." into given and family names. */
export function parseAuthorName(raw: string): Author {
  const s = clean(raw);
  if (s.includes(",")) {
    const [family, ...rest] = s.split(",");
    return { family: clean(family), given: clean(rest.join(" ")) };
  }
  const parts = s.split(" ");
  if (parts.length === 1) return { family: parts[0], given: "" };
  return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(" ") };
}
