import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { withBase } from "@/lib/asset";
import { PRIMARY_PUBLICATION, publicationCitation } from "@/lib/publications";
import {
  actionRowStyle,
  bodyStyle,
  cardStyle,
  citationStyle,
  eyebrowStyle,
  labelStyle,
  primaryLinkStyle,
  secondaryLinkStyle,
  subtitleStyle,
  titleStyle,
} from "./Publications";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

export default function PublicationRecord() {
  const publication = PRIMARY_PUBLICATION;

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SiteNav />
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "5rem 2rem 3rem" }}>
        <a href={withBase("publications/")} style={{ ...secondaryLinkStyle, marginBottom: "2.5rem" }}>
          <ArrowLeft size={14} aria-hidden="true" /> All publications
        </a>

        <article itemScope itemType="https://schema.org/ScholarlyArticle">
          <p style={eyebrowStyle}>Publication record</p>
          <h1 itemProp="headline" style={titleStyle}>{publication.title}</h1>
          <p style={{ ...subtitleStyle, fontSize: "clamp(1.15rem, 3vw, 1.5rem)", maxWidth: "54ch" }}>
            {publication.subtitle}
          </p>

          <dl style={{ ...cardStyle, display: "grid", gridTemplateColumns: "minmax(120px, 0.32fr) 1fr", gap: "0.75rem 1.25rem", marginTop: "2.2rem" }}>
            <dt style={labelStyle}>Author</dt>
            <dd itemProp="author" style={bodyStyle}>{publication.author}</dd>
            <dt style={labelStyle}>Affiliation</dt>
            <dd style={bodyStyle}>{publication.affiliation}</dd>
            <dt style={labelStyle}>Published</dt>
            <dd itemProp="datePublished" style={bodyStyle}><time dateTime={publication.datePublished}>{publication.firstPublishedDate}</time></dd>
            <dt style={labelStyle}>Latest revision</dt>
            <dd itemProp="dateModified" style={bodyStyle}><time dateTime={publication.dateModified}>{publication.citationDate}</time></dd>
            <dt style={labelStyle}>Version</dt>
            <dd style={bodyStyle}>{publication.version}</dd>
            <dt style={labelStyle}>Canonical URL</dt>
            <dd style={bodyStyle}><a itemProp="url" href={withBase("publications/the-missing-meter/")} style={inlineLinkStyle}>themissingmeter.org/publications/the-missing-meter/</a></dd>
          </dl>

          <section aria-labelledby="abstract-heading" style={{ marginTop: "3rem" }}>
            <h2 id="abstract-heading" style={headingStyle}>Abstract</h2>
            <p itemProp="abstract" style={{ ...bodyStyle, fontSize: "17px", maxWidth: "66ch" }}>
              {publication.abstract}
            </p>
          </section>

          <section aria-labelledby="access-heading" style={{ marginTop: "2.5rem" }}>
            <h2 id="access-heading" style={headingStyle}>Access</h2>
            <p style={bodyStyle}>
              The paper page contains the full article, figures, appendix, and prediction scoreboard.
              The final PDF is a permanent direct download.
            </p>
            <div style={actionRowStyle}>
              <a itemProp="encoding" href={withBase("downloads/The_Missing_Meter.pdf")} style={primaryLinkStyle}>
                <Download size={14} aria-hidden="true" /> Download final PDF
              </a>
              <a href={withBase("")} style={secondaryLinkStyle}>
                <ExternalLink size={14} aria-hidden="true" /> Read the paper online
              </a>
            </div>
          </section>

          <section aria-labelledby="citation-heading" style={{ marginTop: "2.5rem" }}>
            <h2 id="citation-heading" style={headingStyle}>Citation</h2>
            <p style={citationStyle}>{publicationCitation()}</p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  color: "var(--ink)",
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "clamp(1.45rem, 3vw, 1.9rem)",
  fontWeight: 400,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
  margin: "0 0 0.8rem",
};

const inlineLinkStyle: React.CSSProperties = {
  color: "var(--amber-dark)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};
