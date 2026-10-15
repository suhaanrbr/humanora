import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import type { CitationSource } from "@/lib/citation";

// Public (no account needed): the Citation Generator works for anyone,
// so DOI lookup does too. Crossref is free and keyless; this route only
// proxies one lookup at a time and caps each visitor's request rate.
const LIMIT = { requests: 30, windowMs: 60 * 1000 };
const DOI_RE = /^10\.\d{4,9}\/\S+$/;

interface CrossrefWork {
  type?: string;
  title?: string[];
  "container-title"?: string[];
  publisher?: string;
  author?: { given?: string; family?: string; name?: string }[];
  issued?: { "date-parts"?: number[][] };
  volume?: string;
  issue?: string;
  page?: string;
  edition?: string;
  DOI?: string;
  URL?: string;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`doi:${ip}`, LIMIT.requests, LIMIT.windowMs).allowed) {
    return NextResponse.json({ error: "Too many lookups. Please wait a moment." }, { status: 429 });
  }

  const raw = (req.nextUrl.searchParams.get("doi") ?? "").trim();
  const doi = raw.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
  if (!DOI_RE.test(doi)) {
    return NextResponse.json({ error: "That doesn't look like a DOI. It should start with 10., e.g. 10.1038/nature12373." }, { status: 400 });
  }

  let work: CrossrefWork;
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { "User-Agent": "Humanora Citation Generator (https://humanora-beryl.vercel.app)" },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (res.status === 404) return NextResponse.json({ error: "No record found for that DOI." }, { status: 404 });
    if (!res.ok) throw new Error(`crossref ${res.status}`);
    work = (await res.json()).message as CrossrefWork;
  } catch (err) {
    console.error("[doi] lookup failed", err);
    return NextResponse.json({ error: "The DOI service didn't respond. Please try again, or fill the form in by hand." }, { status: 502 });
  }

  const people = (work.author ?? []).filter((a) => a.family || a.given);
  const organization = people.length === 0 ? work.author?.find((a) => a.name)?.name : undefined;
  const [year, month, day] = work.issued?.["date-parts"]?.[0] ?? [];
  const isBook = /book|monograph/.test(work.type ?? "");

  const source: CitationSource = {
    type: isBook ? "book" : "journal",
    authors: people.map((a) => ({ given: a.given ?? "", family: a.family ?? "" })),
    organization,
    title: work.title?.[0] ?? "",
    container: isBook ? undefined : work["container-title"]?.[0],
    publisher: work.publisher,
    year: year ? String(year) : undefined,
    month: isBook ? undefined : month,
    day: isBook ? undefined : day,
    volume: work.volume,
    issue: work.issue,
    pages: work.page,
    edition: work.edition,
    doi: work.DOI ?? doi,
  };
  return NextResponse.json({ source });
}
