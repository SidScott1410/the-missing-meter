import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { withBase } from "@/lib/asset";
import { PUBLICATION_MATERIALS } from "@/lib/publications";
import {
  bodyStyle,
  cardStyle,
  eyebrowStyle,
  labelStyle,
  secondaryLinkStyle,
  sectionTitleStyle,
  titleStyle,
} from "./Publications";
import { Download, FileText, Table } from "lucide-react";

export default function Materials() {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <SiteNav />
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "5rem 2rem 3rem" }}>
        <p style={eyebrowStyle}>Materials</p>
        <h1 style={titleStyle}>Public data and documents</h1>
        <p style={{ ...bodyStyle, fontSize: "17px", maxWidth: "64ch" }}>
          Direct, static downloads supporting The Missing Meter. This page and every linked file are
          available without browser JavaScript. A machine-readable manifest is available at{" "}
          <a href={withBase("publications.json")} style={inlineLinkStyle}>/publications.json</a>.
        </p>

        <section aria-labelledby="materials-list-heading" style={{ marginTop: "2.5rem" }}>
          <h2 id="materials-list-heading" style={sectionTitleStyle}>Available downloads</h2>
          <div style={{ borderTop: "1px solid var(--rule)" }}>
            {PUBLICATION_MATERIALS.map((material) => (
              <article key={material.id} style={{ ...cardStyle, borderRadius: 0, borderTop: "none", margin: 0, padding: "1.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "0.85rem", minWidth: 0, flex: "1 1 420px" }}>
                    <span aria-hidden="true" style={{ color: "var(--amber-dark)", paddingTop: "0.15rem" }}>
                      {material.format === "CSV" ? <Table size={18} /> : <FileText size={18} />}
                    </span>
                    <div>
                      <p style={labelStyle}>{material.label} · {material.format} · {material.details}</p>
                      <h3 style={{ color: "var(--ink)", fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", lineHeight: 1.35, margin: "0 0 0.45rem" }}>{material.title}</h3>
                      <p style={bodyStyle}>{material.description}</p>
                    </div>
                  </div>
                  <a href={withBase(material.path)} download style={secondaryLinkStyle} aria-label={`Download ${material.title}`}>
                    <Download size={14} aria-hidden="true" /> Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="availability-heading" style={{ borderTop: "1px solid var(--rule)", marginTop: "3rem", paddingTop: "2rem" }}>
          <h2 id="availability-heading" style={sectionTitleStyle}>Availability note</h2>
          <p style={bodyStyle}>
            The published materials are the final paper, two exhibit datasets, and the worked example.
            The final PDF refers to additional ancillary submission materials, including a reference
            implementation and trace-replay harness. Those files are not yet published on this site.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

const inlineLinkStyle: React.CSSProperties = {
  color: "var(--amber-dark)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};
