import { describe, expect, it } from "vitest";
import { citationHtml, citationPlainText, formatCitation, parseAuthorName, type CitationSource } from "./citation";

const article: CitationSource = {
  type: "journal",
  authors: [
    { given: "Jane Q.", family: "Doe" },
    { given: "John", family: "Smith" },
  ],
  title: "Remote learning and student engagement",
  container: "Journal of Education Research",
  year: "2021",
  volume: "14",
  issue: "2",
  pages: "45-67",
  doi: "10.1000/xyz123",
};

const book: CitationSource = {
  type: "book",
  authors: [{ given: "Daniel", family: "Kahneman" }],
  title: "Thinking, Fast and Slow",
  publisher: "Farrar, Straus and Giroux",
  year: "2011",
};

const page: CitationSource = {
  type: "website",
  authors: [],
  organization: "World Health Organization",
  title: "Physical activity",
  container: "WHO",
  year: "2024",
  month: 6,
  day: 26,
  url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
  accessed: "2026-10-16",
};

const text = (src: CitationSource, style: Parameters<typeof formatCitation>[1]) => citationPlainText(formatCitation(src, style).reference);

describe("APA 7", () => {
  it("formats a two-author journal article", () => {
    expect(text(article, "apa")).toBe(
      "Doe, J. Q., & Smith, J. (2021). Remote learning and student engagement. Journal of Education Research, 14(2), 45–67. https://doi.org/10.1000/xyz123"
    );
    expect(formatCitation(article, "apa").inText).toBe("(Doe & Smith, 2021)");
  });

  it("italicises the journal name and volume, not the article title", () => {
    const html = citationHtml(formatCitation(article, "apa").reference);
    expect(html).toContain("<i>Journal of Education Research</i>, <i>14</i>(2)");
    expect(html).not.toContain("<i>Remote");
  });

  it("formats a book with an edition", () => {
    expect(text({ ...book, edition: "2" }, "apa")).toBe("Kahneman, D. (2011). Thinking, Fast and Slow (2nd ed.). Farrar, Straus and Giroux.");
  });

  it("formats a web page by an organization with a full date", () => {
    expect(text(page, "apa")).toBe(
      "World Health Organization. (2024, June 26). Physical activity. WHO. https://www.who.int/news-room/fact-sheets/detail/physical-activity"
    );
  });

  it("uses n.d. and moves the title forward when author and date are missing", () => {
    expect(text({ type: "website", authors: [], title: "Style guide", url: "https://example.com" }, "apa")).toBe(
      "Style guide. (n.d.). https://example.com"
    );
  });

  it("uses et al. in-text for three or more authors", () => {
    const three = { ...article, authors: [...article.authors, { given: "Ana", family: "Lee" }] };
    expect(formatCitation(three, "apa").inText).toBe("(Doe et al., 2021)");
    expect(text(three, "apa").startsWith("Doe, J. Q., Smith, J., & Lee, A. (2021).")).toBe(true);
  });
});

describe("MLA 9", () => {
  it("formats a two-author journal article", () => {
    expect(text(article, "mla")).toBe(
      "Doe, Jane Q., and John Smith. “Remote Learning and Student Engagement.” Journal of Education Research, vol. 14, no. 2, 2021, pp. 45–67, https://doi.org/10.1000/xyz123.".replace(
        "Remote Learning and Student Engagement",
        "Remote learning and student engagement"
      )
    );
    expect(formatCitation(article, "mla").inText).toBe("(Doe and Smith)");
  });

  it("formats a book and a web page with an access date", () => {
    expect(text(book, "mla")).toBe("Kahneman, Daniel. Thinking, Fast and Slow. Farrar, Straus and Giroux, 2011.");
    expect(text(page, "mla")).toBe(
      "World Health Organization. “Physical activity.” WHO, 26 June 2024, www.who.int/news-room/fact-sheets/detail/physical-activity. Accessed 16 Oct. 2026."
    );
  });

  it("uses et al. for three or more authors", () => {
    const three = { ...article, authors: [...article.authors, { given: "Ana", family: "Lee" }] };
    expect(text(three, "mla").startsWith("Doe, Jane Q., et al. “")).toBe(true);
  });
});

describe("Chicago author-date", () => {
  it("formats a journal article and its in-text citation", () => {
    expect(text(article, "chicago")).toBe(
      "Doe, Jane Q., and John Smith. 2021. “Remote learning and student engagement.” Journal of Education Research 14 (2): 45–67. https://doi.org/10.1000/xyz123."
    );
    expect(formatCitation(article, "chicago").inText).toBe("(Doe and Smith 2021)");
  });

  it("formats a book", () => {
    expect(text(book, "chicago")).toBe("Kahneman, Daniel. 2011. Thinking, Fast and Slow. Farrar, Straus and Giroux.");
  });
});

describe("Harvard", () => {
  it("formats a journal article", () => {
    expect(text(article, "harvard")).toBe(
      "Doe, J. Q. and Smith, J. (2021) ‘Remote learning and student engagement’, Journal of Education Research, 14(2), pp. 45–67. Available at: https://doi.org/10.1000/xyz123."
    );
    expect(formatCitation(article, "harvard").inText).toBe("(Doe and Smith, 2021)");
  });

  it("formats a web page with an access date", () => {
    expect(text(page, "harvard")).toBe(
      "World Health Organization (2024) Physical activity. Available at: https://www.who.int/news-room/fact-sheets/detail/physical-activity (Accessed: 16 October 2026)."
    );
  });
});

describe("parseAuthorName", () => {
  it("handles both name orders", () => {
    expect(parseAuthorName("Jane Q. Doe")).toEqual({ given: "Jane Q.", family: "Doe" });
    expect(parseAuthorName("Doe, Jane Q.")).toEqual({ given: "Jane Q.", family: "Doe" });
    expect(parseAuthorName("Plato")).toEqual({ given: "", family: "Plato" });
  });
});
