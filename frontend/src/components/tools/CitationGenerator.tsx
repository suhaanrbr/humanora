"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Choice, CopyButton, Panel } from "@/components/tools/ToolKit";
import {
  CITATION_STYLES,
  STYLE_LABELS,
  citationHtml,
  citationPlainText,
  formatCitation,
  parseAuthorName,
  type CitationSource,
  type CitationStyle,
  type Segment,
  type SourceType,
} from "@/lib/citation";
import { cn } from "@/lib/cn";

const BIB_KEY = "humanora-bibliography";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptySource(type: SourceType): CitationSource {
  return { type, authors: [{ given: "", family: "" }], title: "", accessed: type === "website" ? today() : undefined };
}

interface BibEntry {
  id: string;
  source: CitationSource;
}

/**
 * Citation Generator. Formatting is deterministic (lib/citation.ts), so
 * this works for everyone, signed in or not, with no AI and no quota.
 * The bibliography lives in sessionStorage (see the cookie policy): it
 * survives a reload, and is cleared when the tab is closed.
 */
export function CitationGenerator() {
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [source, setSource] = useState<CitationSource>(() => emptySource("journal"));
  const [doi, setDoi] = useState("");
  const [lookup, setLookup] = useState<{ state: "idle" | "loading" | "error"; message?: string }>({ state: "idle" });
  const [bib, setBib] = useState<BibEntry[]>([]);
  const [bibLoaded, setBibLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(BIB_KEY);
      // Restoring browser-only state after mount: same accepted pattern as
      // the draft restore in HumanizeWorkspace.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setBib(JSON.parse(saved) as BibEntry[]);
    } catch {
      // Storage unavailable or corrupt: start with an empty list.
    }
    setBibLoaded(true);
  }, []);

  useEffect(() => {
    if (!bibLoaded) return;
    try {
      window.sessionStorage.setItem(BIB_KEY, JSON.stringify(bib));
    } catch {
      // Storage unavailable: the list just won't survive a reload.
    }
  }, [bib, bibLoaded]);

  const citation = useMemo(() => formatCitation(source, style), [source, style]);
  const ready = source.title.trim().length > 0;

  function update<K extends keyof CitationSource>(key: K, value: CitationSource[K]) {
    setSource((s) => ({ ...s, [key]: value }));
  }

  async function findDoi() {
    setLookup({ state: "loading" });
    try {
      const res = await fetch(`/api/tools/doi?doi=${encodeURIComponent(doi.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLookup({ state: "error", message: data?.error ?? "Lookup failed." });
        return;
      }
      const found = data.source as CitationSource;
      setSource({ ...found, authors: found.authors.length ? found.authors : [{ given: "", family: "" }] });
      setLookup({ state: "idle" });
    } catch {
      setLookup({ state: "error", message: "Couldn't reach the lookup service. Please try again." });
    }
  }

  function addToBib() {
    setBib((b) => [...b, { id: `${Date.now()}`, source }]);
    setSource(emptySource(source.type));
    setDoi("");
  }

  const sortedBib = useMemo(
    () =>
      bib
        .map((e) => ({ ...e, citation: formatCitation(e.source, style) }))
        .sort((a, b) => citationPlainText(a.citation.reference).localeCompare(citationPlainText(b.citation.reference))),
    [bib, style]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <Panel title="Source">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4">
            <Choice label="Style" value={style} onChange={setStyle} options={CITATION_STYLES.map((s) => ({ value: s, label: STYLE_LABELS[s] }))} />
            <Choice
              label="Source"
              value={source.type}
              onChange={(type) => setSource({ ...emptySource(type), authors: source.authors, title: source.title })}
              options={[
                { value: "journal", label: "Journal article" },
                { value: "book", label: "Book" },
                { value: "website", label: "Web page" },
              ]}
            />
          </div>

          {source.type !== "website" && (
            <form
              className="flex flex-col gap-2 border-b border-border px-5 py-4"
              onSubmit={(e) => {
                e.preventDefault();
                void findDoi();
              }}
            >
              <label htmlFor="doi" className="text-sm text-foreground-subtle">
                Have a DOI? Paste it to fill everything in
              </label>
              <div className="flex gap-2">
                <input
                  id="doi"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="10.1038/nature12373"
                  className="focus-ring min-w-0 flex-1 rounded-md border border-border-strong bg-background px-3 py-2 text-base text-foreground placeholder:text-foreground-subtle"
                />
                <Button type="submit" variant="secondary" size="md" loading={lookup.state === "loading"} disabled={!doi.trim()}>
                  Look up
                </Button>
              </div>
              {lookup.state === "error" && (
                <p role="alert" className="text-sm text-danger">
                  {lookup.message}
                </p>
              )}
            </form>
          )}

          <div className="flex flex-col gap-4 px-5 py-5">
            <Authors source={source} onChange={(next) => setSource((s) => ({ ...s, ...next }))} />
            <Field label={source.type === "website" ? "Page title" : source.type === "book" ? "Book title" : "Article title"} value={source.title} onChange={(v) => update("title", v)} />
            {source.type !== "book" && (
              <Field label={source.type === "journal" ? "Journal" : "Website name"} value={source.container ?? ""} onChange={(v) => update("container", v)} />
            )}
            {source.type === "book" && (
              <div className="grid grid-cols-[1fr_6rem] gap-3">
                <Field label="Publisher" value={source.publisher ?? ""} onChange={(v) => update("publisher", v)} />
                <Field label="Edition" value={source.edition ?? ""} onChange={(v) => update("edition", v)} placeholder="2" inputMode="numeric" />
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Year" value={source.year ?? ""} onChange={(v) => update("year", v)} placeholder="2024" inputMode="numeric" />
              {source.type !== "book" && (
                <>
                  <Field label="Month" value={source.month ? String(source.month) : ""} onChange={(v) => update("month", clampNumber(v, 12))} placeholder="1–12" inputMode="numeric" />
                  <Field label="Day" value={source.day ? String(source.day) : ""} onChange={(v) => update("day", clampNumber(v, 31))} inputMode="numeric" />
                </>
              )}
            </div>
            {source.type === "journal" && (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Volume" value={source.volume ?? ""} onChange={(v) => update("volume", v)} />
                <Field label="Issue" value={source.issue ?? ""} onChange={(v) => update("issue", v)} />
                <Field label="Pages" value={source.pages ?? ""} onChange={(v) => update("pages", v)} placeholder="45–67" />
              </div>
            )}
            {source.type !== "website" && <Field label="DOI" value={source.doi ?? ""} onChange={(v) => update("doi", v)} placeholder="10.xxxx/xxxxx" />}
            <Field label="URL" value={source.url ?? ""} onChange={(v) => update("url", v)} placeholder="https://" inputMode="url" />
            {source.type === "website" && (
              <Field label="Date accessed" type="date" value={source.accessed ?? ""} onChange={(v) => update("accessed", v)} />
            )}
          </div>
        </Panel>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <Panel
            title={`${STYLE_LABELS[style]} citation`}
            actions={ready && <CopyButton text={citationPlainText(citation.reference)} html={citationHtml(citation.reference)} label="Copy reference" />}
          >
            <div className="px-5 py-5">
              {ready ? (
                <>
                  <p className="pl-8 -indent-8 text-[1.0625rem] leading-relaxed text-foreground [overflow-wrap:anywhere]">
                    <Rendered segments={citation.reference} />
                  </p>
                  <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-4">
                    <p className="text-sm text-foreground-subtle">
                      In-text: <span className="text-foreground">{citation.inText}</span>
                    </p>
                    <CopyButton text={citation.inText} />
                  </div>
                  <Button className="mt-5 w-full" variant="secondary" onClick={addToBib}>
                    Add to bibliography
                  </Button>
                </>
              ) : (
                <p className="text-sm text-foreground-subtle">Fill in the source details, or look up a DOI, and the citation appears here as you type.</p>
              )}
            </div>
          </Panel>

          {sortedBib.length > 0 && (
            <Panel
              title={`Bibliography · ${sortedBib.length}`}
              actions={
                <>
                  <CopyButton
                    label="Copy all"
                    text={sortedBib.map((e) => citationPlainText(e.citation.reference)).join("\n\n")}
                    html={sortedBib.map((e) => `<p>${citationHtml(e.citation.reference)}</p>`).join("")}
                  />
                  <button type="button" onClick={() => setBib([])} className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground">
                    Clear
                  </button>
                </>
              }
            >
              <ol className="divide-y divide-border">
                {sortedBib.map((e) => (
                  <li key={e.id} className="flex items-start gap-4 px-5 py-4">
                    <p className="min-w-0 flex-1 pl-8 -indent-8 text-base leading-relaxed text-foreground [overflow-wrap:anywhere]">
                      <Rendered segments={e.citation.reference} />
                    </p>
                    <button
                      type="button"
                      onClick={() => setBib((b) => b.filter((x) => x.id !== e.id))}
                      aria-label="Remove from bibliography"
                      className="focus-ring shrink-0 rounded-sm text-sm text-foreground-subtle hover:text-foreground"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ol>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function clampNumber(v: string, max: number) {
  const n = parseInt(v.replace(/\D/g, ""), 10);
  return n >= 1 && n <= max ? n : undefined;
}

function Rendered({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) => (s.italic ? <em key={i}>{s.text}</em> : <span key={i}>{s.text}</span>))}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "url";
}) {
  const id = `f-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-foreground-subtle">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring w-full min-w-0 rounded-md border border-border-strong bg-background px-3 py-2 text-base text-foreground placeholder:text-foreground-subtle"
      />
    </div>
  );
}

function Authors({ source, onChange }: { source: CitationSource; onChange: (next: Partial<CitationSource>) => void }) {
  const isOrg = source.organization !== undefined;
  const authors = source.authors.length ? source.authors : [{ given: "", family: "" }];

  function set(i: number, raw: string) {
    const next = [...authors];
    next[i] = raw.trim() ? parseAuthorName(raw) : { given: "", family: "" };
    onChange({ authors: next });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-foreground-subtle">{isOrg ? "Organisation" : "Authors"}</span>
        <button
          type="button"
          onClick={() => onChange(isOrg ? { organization: undefined } : { organization: "", authors: [] })}
          className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground"
        >
          {isOrg ? "Use people instead" : "Author is an organisation"}
        </button>
      </div>
      {isOrg ? (
        <input
          aria-label="Organisation name"
          value={source.organization ?? ""}
          onChange={(e) => onChange({ organization: e.target.value })}
          placeholder="World Health Organization"
          className="focus-ring w-full rounded-md border border-border-strong bg-background px-3 py-2 text-base text-foreground placeholder:text-foreground-subtle"
        />
      ) : (
        <>
          {authors.map((a, i) => (
            <AuthorRow
              key={i}
              index={i}
              value={[a.given, a.family].filter(Boolean).join(" ")}
              onChange={(raw) => set(i, raw)}
              onRemove={authors.length > 1 ? () => onChange({ authors: authors.filter((_, j) => j !== i) }) : undefined}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange({ authors: [...authors, { given: "", family: "" }] })}
            className="focus-ring w-fit rounded-sm text-sm font-semibold text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
          >
            + Add author
          </button>
        </>
      )}
    </div>
  );
}

/** Keeps the raw text while typing, so "Jane " isn't collapsed mid-word by parsing. */
function AuthorRow({ index, value, onChange, onRemove }: { index: number; value: string; onChange: (raw: string) => void; onRemove?: () => void }): ReactNode {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex gap-2">
      <input
        aria-label={`Author ${index + 1}`}
        value={focused ? draft : value}
        onFocus={() => {
          setDraft(value);
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="First and last name, e.g. Jane Doe"
        className={cn("focus-ring min-w-0 flex-1 rounded-md border border-border-strong bg-background px-3 py-2 text-base text-foreground placeholder:text-foreground-subtle")}
      />
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove author ${index + 1}`} className="focus-ring rounded-sm px-2 text-sm text-foreground-subtle hover:text-foreground">
          ✕
        </button>
      )}
    </div>
  );
}
