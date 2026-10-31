import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { withBase } from "@/lib/asset";
import { PRIMARY_PUBLICATION, publicationCitation } from "@/lib/publications";
import { ArrowRight, Download, FileText } from "lucide-react";

export default function Publications() {
  const publication = PRIMARY_PUBLICATION;

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SiteNav />
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "5rem 2rem 3rem" }}>
        <p style={eyebrowStyle}>Publications</p>
        <h1 style={titleStyle}>Research publications</h1>
        <p style={introStyle}>
          A permanent, server-readable index of public work and its supporting materials.
          Each record has a stable page, a direct PDF, and a machine-readable listing at{" "}
          <a href={withBase("publications.json")} style={inlineLinkStyle}>/publications.json</a>.
        </p>

        <article style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <p style={labelStyle}>Working paper · {publication.version}</p>
              <h2 style={{ ...cardTitleStyle, marginTop: 0 }}>{publication.title}</h2>
              <p style={{ ...subtitleStyle, marginBottom: "1rem" }}>{publication.subtitle}</p>
            </div>
            <span style={dateStyle}>{publication.citationDate}</span>
          </div>
          <p style={bodyStyle}>{publication.abstract}</p>
          <p style={{ ...bodyStyle, fontSize: "13px", color: "var(--ink-light)", marginTop: "1rem" }}>
            {publication.author} · {publication.affiliation}
          </p>
          <div style={actionRowStyle}>
            <a href={withBase("publications/the-missing-meter/")} style={primaryLinkStyle}>
              Publication record <ArrowRight size={14} aria-hidden="true" />
            </a>
            <a href={withBase("downloads/The_Missing_Meter.pdf")} style={secondaryLinkStyle}>
              <Download size={14} aria-hidden="true" /> Download PDF
            </a>
          </div>
          <p style={citationStyle}>Citation: {publicationCitation()}</p>
        </article>

        <section aria-labelledby="materials-heading" style={{ marginTop: "3rem", borderTop: "1px solid var(--rule)", paddingTop: "2rem" }}>
          <p style={eyebrowStyle}>Data and reproducibility</p>
          <h2 id="materials-heading" style={sectionTitleStyle}>Supporting materials</h2>
          <p style={bodyStyle}>
            Public exhibit data and the worked example are listed on a separate static materials page,
            so a reader does not need JavaScript to discover each download.
          </p>
          <a href={withBase("materials/")} style={secondaryLinkStyle}>
            <FileText size={14} aria-hidden="true" /> View materials
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export const eyebrowStyle: React.CSSProperties = {
  color: "var(--amber-dark)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.11em",
  textTransform: "uppercase",
  margin: "0 0 0.9rem",
};

export const titleStyle: React.CSSProperties = {
  color: "var(--ink)",
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "clamp(2.25rem, 6vw, 4.1rem)",
  fontWeight: 400,
  letterSpacing: "-0.035em",
  lineHeight: 1.05,
  margin: "0 0 1.25rem",
};

export const introStyle: React.CSSProperties = {
  color: "var(--ink-mid)",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "17px",
  lineHeight: 1.75,
  margin: 0,
  maxWidth: "64ch",
};

export const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--rule)",
  borderRadius: 8,
  marginTop: "2.5rem",
  padding: "clamp(1.25rem, 4vw, 2rem)",
};

export const labelStyle: React.CSSProperties = {
  color: "var(--amber-dark)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.09em",
  margin: "0 0 0.55rem",
  textTransform: "uppercase",
};

export const cardTitleStyle: React.CSSProperties = {
  color: "var(--ink)",
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "clamp(1.65rem, 4vw, 2.35rem)",
  fontWeight: 400,
  letterSpacing: "-0.025em",
  lineHeight: 1.1,
};

export const subtitleStyle: React.CSSProperties = {
  color: "var(--ink-mid)",
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "17px",
  fontStyle: "italic",
  lineHeight: 1.45,
};

export const dateStyle: React.CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--rule)",
  borderRadius: 4,
  color: "var(--ink-light)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  padding: "0.35rem 0.55rem",
  whiteSpace: "nowrap",
};

export const bodyStyle: React.CSSProperties = {
  color: "var(--ink-mid)",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "15px",
  lineHeight: 1.72,
  margin: 0,
};

export const actionRowStyle: React.CSSProperties = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  marginTop: "1.5rem",
};

export const primaryLinkStyle: React.CSSProperties = {
  alignItems: "center",
  background: "var(--ink)",
  border: "1px solid var(--ink)",
  borderRadius: 4,
  color: "var(--paper)",
  display: "inline-flex",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  gap: "0.4rem",
  padding: "0.62rem 0.85rem",
  textDecoration: "none",
};

export const secondaryLinkStyle: React.CSSProperties = {
  alignItems: "center",
  border: "1px solid var(--rule)",
  borderRadius: 4,
  color: "var(--ink)",
  display: "inline-flex",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: 500,
  gap: "0.4rem",
  padding: "0.62rem 0.85rem",
  textDecoration: "none",
};

export const citationStyle: React.CSSProperties = {
  borderLeft: "2px solid var(--rule)",
  color: "var(--ink-light)",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "11px",
  lineHeight: 1.6,
  margin: "1.5rem 0 0",
  paddingLeft: "0.8rem",
};

export const sectionTitleStyle: React.CSSProperties = {
  color: "var(--ink)",
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
  fontWeight: 400,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
  margin: "0 0 0.85rem",
};

const inlineLinkStyle: React.CSSProperties = {
  color: "var(--amber-dark)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};
