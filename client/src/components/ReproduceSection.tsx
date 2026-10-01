// ReproduceSection - data-provenance manifest
// "Every figure in this paper is computed from public data. Here is the data."
// Three download slots: Exhibit 1 CSV, Exhibit 2 CSV, worked-example walkthrough
// Design: audit-signal aesthetic, monospace, instrument-panel feel

import { FileText, Download, Table } from "lucide-react";
import { withBase } from "@/lib/asset";

const ARTIFACTS = [
  {
    id: "exhibit-1-csv",
    label: "Exhibit 1",
    title: "Hyperscaler capex vs. inference cost, 2021–2026",
    description: "Combined hyperscaler capex (Microsoft, Google, Amazon, Meta) from company filings. Inference cost per million tokens at GPT-3.5 capability from Stanford AI Index 2025 and Artificial Analysis. 48 rows, 6 columns.",
    format: "CSV",
    rows: "48 rows",
    icon: <Table size={16} />,
    href: withBase("downloads/exhibit1_scissors.csv"),
    filename: "exhibit1_scissors.csv",
  },
  {
    id: "exhibit-2-csv",
    label: "Exhibit 2",
    title: "Unit cost indexed to turning point - five infrastructure cycles",
    description: "Unit cost series for railways (Crafts 2004), electricity (Joskow 1997), shipping (Levinson 2006), telecom (Odlyzko 2003), and AI inference (Stanford AI Index 2025). Indexed to 100 at each infrastructure's turning point. 85 rows, 8 columns.",
    format: "CSV",
    rows: "85 rows",
    icon: <Table size={16} />,
    href: withBase("downloads/exhibit2_served_token.csv"),
    filename: "exhibit2_served_token.csv",
  },
  {
    id: "worked-example",
    label: "Worked example",
    title: "Served token inversion: Llama 3.3 70B across 15 providers",
    description: "Step-by-step walkthrough of the Section 8 / Fig. 3 calculation. Provider pricing and throughput from Artificial Analysis June 2026. Shows the interactive vs. batch inversion from raw inputs to final $/svt figures. Reproducible in a spreadsheet.",
    format: "PDF",
    rows: "12 pages",
    icon: <FileText size={16} />,
    href: withBase("downloads/worked_example.pdf"),
    filename: "worked_example.pdf",
  },
];

export default function ReproduceSection() {
  return (
    <section id="reproduce" style={{ paddingTop: "4rem", paddingBottom: "2rem" }}>
      {/* Section header */}
      <div style={{ marginBottom: "2rem" }}>
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--ink-mid)",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "block",
          marginBottom: "0.6rem",
        }}>
          Reproduce the numbers
        </span>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 400,
          color: "var(--ink)",
          margin: "0 0 1rem",
          lineHeight: 1.2,
        }}>
          Public materials for the exhibits and worked example
        </h2>
        <p style={{
          fontSize: "15px",
          color: "var(--ink-mid)",
          lineHeight: 1.75,
          maxWidth: "62ch",
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
          The three downloadable artifacts below support the public exhibits and worked example. No
          proprietary data, model access, or API keys are required. The inversion in Fig. 3 can be
          reproduced in a spreadsheet in under ten minutes. The reference implementation, JSON
          record schema, test suite, trace-replay harness, fitted workload statistics, and sweep
          outputs are not yet published on this site.
        </p>
      </div>

      {/* Provenance manifest */}
      <div style={{
        border: "1px solid var(--rule)",
        borderRadius: 8,
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        marginBottom: "1.5rem",
      }}>
        {/* Manifest header */}
        <div style={{
          background: "var(--ink)",
          padding: "0.65rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <span style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px" }} aria-hidden>
            {[4, 7, 10, 7, 4].map((h, i) => (
              <span key={i} style={{
                display: "inline-block",
                width: "2px",
                height: `${h}px`,
                background: i === 2 ? "var(--amber)" : "rgba(255,255,255,0.35)",
                borderRadius: "1px",
              }} />
            ))}
          </span>
          <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
            Data provenance manifest · v1.0 · July 15, 2026
          </span>
        </div>

        {/* Artifact rows */}
        {ARTIFACTS.map((artifact, i) => (
          <div
            key={artifact.id}
            style={{
              borderBottom: i < ARTIFACTS.length - 1 ? "1px solid var(--rule)" : "none",
              background: i % 2 === 0 ? "var(--paper)" : "var(--surface)",
            }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: "1.25rem",
              padding: "1.25rem",
              alignItems: "start",
            }}>
              {/* Icon + label */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", paddingTop: "2px" }}>
                <span style={{ color: "var(--ink-mid)" }}>{artifact.icon}</span>
                <span style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--ink-light)",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}>
                  {artifact.format}
                </span>
              </div>

              {/* Content */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--amber-dark)",
                    fontFamily: "Inter, sans-serif",
                    background: "rgba(212,160,23,0.1)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 2,
                  }}>
                    {artifact.label}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--ink-light)", letterSpacing: "0.05em" }}>
                    {artifact.rows}
                  </span>
                </div>
                <p style={{
                  fontSize: "13.5px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  fontFamily: "Inter, system-ui, sans-serif",
                  margin: "0 0 0.35rem",
                  lineHeight: 1.35,
                }}>
                  {artifact.title}
                </p>
                <p style={{
                  fontSize: "12.5px",
                  color: "var(--ink-mid)",
                  fontFamily: "Inter, system-ui, sans-serif",
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {artifact.description}
                </p>
              </div>

              {/* Download button */}
              <div style={{ paddingTop: "2px" }}>
                <a
                  href={artifact.href}
                  download={artifact.filename}
                  aria-label={`Download ${artifact.title}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.4rem 0.85rem",
                    border: "1px solid var(--amber)",
                    borderRadius: 4,
                    fontSize: "11.5px",
                    fontFamily: "Inter, system-ui, sans-serif",
                    color: "var(--amber-dark)",
                    textDecoration: "none",
                    background: "rgba(212,160,23,0.06)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "background 150ms ease-out",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,160,23,0.14)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(212,160,23,0.06)")}
                >
                  <Download size={11} />
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auditability note */}
      <p style={{
        fontSize: "12.5px",
        color: "var(--ink-light)",
        fontFamily: "'JetBrains Mono', monospace",
        fontStyle: "italic",
        lineHeight: 1.6,
        margin: 0,
        paddingLeft: "1rem",
        borderLeft: "2px solid var(--rule)",
      }}>
        All sources are public. No proprietary datasets, no model access required.
        The worked example reproduces Fig. 3 from provider pricing pages alone.
      </p>
    </section>
  );
}
