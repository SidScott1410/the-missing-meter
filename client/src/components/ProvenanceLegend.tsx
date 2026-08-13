// ProvenanceLegend — compact inline key for Appendix A.6 provenance labels
// Placed near the top of Appendix A so readers can parse labels without hunting for A.6.
// Design: monochromatic pill badges matching the site's instrument aesthetic.

const LABELS = [
  {
    tag: "MEASURED",
    color: "#2d6a4f",
    bg: "rgba(45,106,79,0.10)",
    desc: "Observed on the declared workload in the declared window",
  },
  {
    tag: "SPEC",
    color: "#1d4e89",
    bg: "rgba(29,78,137,0.10)",
    desc: "Taken from a datasheet or published price list",
  },
  {
    tag: "CONFIG",
    color: "#5a4a2a",
    bg: "rgba(90,74,42,0.10)",
    desc: "Read from configuration rather than observed",
  },
  {
    tag: "SIM",
    color: "#7b3f00",
    bg: "rgba(123,63,0,0.10)",
    desc: "Produced by a model of the system",
  },
  {
    tag: "EST",
    color: "#6b2d6b",
    bg: "rgba(107,45,107,0.10)",
    desc: "Judgment — weakest label; inherited by any derived figure",
  },
];

export default function ProvenanceLegend() {
  return (
    <div style={{
      margin: "1.25rem 0 1.75rem",
      padding: "0.9rem 1.1rem",
      border: "1px solid var(--rule)",
      borderRadius: 6,
      background: "var(--surface)",
    }}>
      <div style={{
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ink-light)",
        fontFamily: "Inter, sans-serif",
        marginBottom: "0.65rem",
      }}>
        Provenance key (A.6) — every figure in this appendix carries one of:
      </div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem 1.25rem",
      }}>
        {LABELS.map(({ tag, color, bg, desc }) => (
          <div key={tag} style={{ display: "flex", alignItems: "baseline", gap: "0.45rem", minWidth: 0 }}>
            <span style={{
              display: "inline-block",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color,
              background: bg,
              padding: "0.1rem 0.45rem",
              borderRadius: 3,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>
              [{tag}]
            </span>
            <span style={{
              fontSize: "11.5px",
              color: "var(--ink-mid)",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.4,
            }}>
              {desc}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: "0.65rem",
        paddingTop: "0.55rem",
        borderTop: "1px solid var(--rule)",
        fontSize: "11px",
        color: "var(--ink-light)",
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.5,
      }}>
        <strong style={{ color: "var(--ink-mid)" }}>Inheritance rule:</strong> a derived figure carries the weakest label among its inputs.{" "}
        <strong style={{ color: "var(--ink-mid)" }}>The red line:</strong> a comparison may be labeled [MEASURED] only if every side of it is measured.
      </div>
    </div>
  );
}
