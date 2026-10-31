export type PublicationRecord = {
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  author: string;
  affiliation: string;
  email: string;
  version: string;
  datePublished: string;
  dateModified: string;
  firstPublishedDate: string;
  citationDate: string;
  publicationPath: string;
  pdfPath: string;
};

export type MaterialRecord = {
  id: string;
  label: string;
  title: string;
  description: string;
  format: "PDF" | "CSV";
  details: string;
  path: string;
};

export const SITE_ORIGIN = "https://themissingmeter.org";

export const PRIMARY_PUBLICATION: PublicationRecord = {
  slug: "the-missing-meter",
  title: "The Missing Meter",
  subtitle: "What every infrastructure buildout leaves behind, and the unit AI still lacks",
  abstract:
    "AI is the first trillion-dollar infrastructure buildout that cannot yet state, in a standard unit, what its output costs. This paper proposes the served token as a unit of account for AI inference, conditioned on a stated service-level objective and quality floor.",
  author: "Sidney Scott",
  affiliation: "The Ashby Institute",
  email: "sidney@theashbyinstitute.org",
  version: "v1.0",
  datePublished: "2026-07-15",
  dateModified: "2026-10-01",
  firstPublishedDate: "July 15, 2026",
  citationDate: "October 1, 2026",
  publicationPath: "/publications/the-missing-meter/",
  pdfPath: "/downloads/The_Missing_Meter.pdf",
};

export const PUBLICATION_MATERIALS: MaterialRecord[] = [
  {
    id: "paper-pdf",
    label: "Paper",
    title: "The Missing Meter, final PDF",
    description:
      "The 29-page final paper, including the historical argument, the nine dated predictions, and Appendix A's draft specification.",
    format: "PDF",
    details: "29 pages · v1.0",
    path: "/downloads/The_Missing_Meter.pdf",
  },
  {
    id: "exhibit-1-csv",
    label: "Exhibit 1",
    title: "Hyperscaler capex vs. inference cost, 2021 to 2026",
    description:
      "Combined hyperscaler capex and inference-cost inputs supporting the paper's first exhibit.",
    format: "CSV",
    details: "48 rows · 6 columns",
    path: "/downloads/exhibit1_scissors.csv",
  },
  {
    id: "exhibit-2-csv",
    label: "Exhibit 2",
    title: "Unit cost indexed to turning point across five infrastructure cycles",
    description:
      "The indexed unit-cost series for railways, electricity, shipping, telecom, and AI inference.",
    format: "CSV",
    details: "85 rows · 8 columns",
    path: "/downloads/exhibit2_served_token.csv",
  },
  {
    id: "worked-example",
    label: "Worked example",
    title: "Served-token inversion across 15 providers",
    description:
      "A spreadsheet-reproducible walkthrough of Appendix A.9's interactive versus batch placement comparison.",
    format: "PDF",
    details: "12 pages",
    path: "/downloads/worked_example.pdf",
  },
];

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

export function publicationCitation(publication = PRIMARY_PUBLICATION): string {
  return `${publication.author}. “${publication.title}: ${publication.subtitle}.” ${publication.version}, ${publication.citationDate}. ${absoluteUrl(publication.publicationPath)}`;
}
