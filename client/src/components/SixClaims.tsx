// SixClaims — "The Argument in Six Claims" expandable card section
// Mirrors the PredictionScoreboard layout: dark header, collapsible cards, kill criterion footer.
// Placed immediately after the abstract / StatStrip, before Section 1.

import { useState } from "react";

const CLAIMS = [
  {
    id: "C1",
    title: "The meter is not missing because it is hard",
    summary: "AI has not adopted an instrument that has existed since 1988.",
    detail: "The Transaction Processing Performance Council has priced useful work under an enforced deadline, with an audited three-year cost basis, a correctness floor, and a mandatory third-party audit, for thirty-eight years. Two consortia now hold adjacent halves of the unit AI needs and neither has joined them.",
    wrongIf: "A cross-vendor, production-traffic, service-level-conditioned cost unit is already in commercial use and this survey missed it.",
  },
  {
    id: "C2",
    title: "The cheapest tokens are the most expensive placement",
    summary: "Fifteen providers serve one artifact at an 8.6-fold price spread and a 21.7-fold speed spread.",
    detail: "Under an interactive deadline the cheapest provider delivers approximately zero compliant output, so its cost per unit of useful work diverges while its advertised price stays lowest in the market. Raw dollars per million tokens ranks all fifteen identically for buyers whose correct rankings are opposite.",
    wrongIf: "Latency-conditioned and raw price rankings coincide in practice.",
  },
  {
    id: "C3",
    title: "The correct utilization is not one hundred percent",
    summary: "Cost per unit of useful work is U-shaped in offered load. Every metric in commercial use says otherwise.",
    detail: "Economic capacity sits strictly below engineering capacity. Across 63,824 requests of real production traffic from two independent operators, the measured optimum is 15 percent utilization at a ten-millisecond deadline — against the 83 to 95 percent a queueing model predicts. A paper publishing only the model would have been directionally right and wrong by a factor of five. Dollars per GPU-hour is flat across that entire range; raw dollars per million tokens falls monotonically and therefore instructs the operator to run at saturation.",
    wrongIf: "The interior optimum vanishes on a workload where it has not yet been tested. On the two tested it is present and severe.",
  },
  {
    id: "C4",
    title: "A trillion-dollar industry's standard telemetry cannot resolve the latency bounds its most valuable workloads are sold against",
    summary: "OpenTelemetry's default histogram for time-per-output-token begins at ten milliseconds.",
    detail: "An interactive objective of six milliseconds — tighter than MLPerf's Interactive bound and well inside what voice agents require — falls in the first bucket and cannot be measured at all. Every figure quoted against it is an interpolation across a discarded distribution.",
    wrongIf: "The conventions are revised or per-request latency is standardized on spans. That is Prediction 8, and its cost is one line in a configuration file.",
  },
  {
    id: "C5",
    title: "Value does not always migrate to the coordination layer",
    summary: "Two of the five historical cases in this paper contradict the thesis.",
    detail: "Semiconductor fabrication kept its margin with no unit of account ever appearing, because the physical layer is not contestable. Cloud computing's coordination layer was bundled into an asset owner before a neutral standard could set — which is why the internet row of this paper's own table names AWS rather than a clearing house. The pattern holds only where the physical layer is contestable and the coordination function is standardized before it can be captured.",
    wrongIf: "Either condition proves unnecessary. Prediction 7 is the test.",
  },
  {
    id: "C6",
    title: "Whether any of this is true cannot currently be scored",
    summary: "That is the paper's central claim rather than an evasion.",
    detail: "No public series of GPU utilization by age cohort exists anywhere, so the depreciation dispute is unresolvable by measurement. Enterprise AI adoption is reported at 20, 50, and 70 percent by three credible instruments, and one survey's measured rate doubled when a question was reworded. The bubble debate compares capital expenditure in dollars to demand in vibes.",
    wrongIf: "The industry transacts in a work-denominated unit by end-2029. If it does not, the central claim of this paper fails on its own kill criterion.",
  },
];

function ClaimCard({ c, isLast }: { c: typeof CLAIMS[number]; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--rule)",
        background: "var(--paper)",
        scrollMarginTop: "110px",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`claim-detail-${c.id}`}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "1rem 1.25rem",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.6rem",
          flexWrap: "wrap",
        }}
      >
        {/* ID */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--ink-light)",
          letterSpacing: "0.06em",
          paddingTop: "2px",
          flexShrink: 0,
        }}>
          {c.id}
        </span>

        {/* Title + summary stacked */}
        <span style={{ flex: "1 1 120px", minWidth: 0 }}>
          <span style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "13.5px",
            color: "var(--ink)",
            lineHeight: 1.3,
            display: "block",
          }}>
            {c.title}
          </span>
          <span style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "12px",
            color: "var(--ink-mid)",
            display: "block",
            marginTop: "0.2rem",
            lineHeight: 1.45,
          }}>
            {c.summary}
          </span>
        </span>

        {/* Chevron */}
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0, paddingTop: "2px" }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            style={{
              transition: "transform 180ms cubic-bezier(0.23,1,0.32,1)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              color: "var(--ink-light)",
            }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {/* Expandable detail */}
      <div
        id={`claim-detail-${c.id}`}
        style={{
          overflow: "hidden",
          maxHeight: open ? "600px" : "0",
          transition: "max-height 280ms cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div style={{ padding: "0 1.25rem 1rem", borderTop: "1px solid var(--rule)" }}>
          <p style={{
            fontSize: "13px",
            color: "var(--ink-mid)",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.65,
            margin: "0.75rem 0 0.35rem",
          }}>
            {c.detail}
          </p>
          <p style={{
            fontSize: "11.5px",
            color: "var(--ink-light)",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.55,
            margin: 0,
            fontStyle: "italic",
          }}>
            Wrong if: {c.wrongIf}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SixClaims() {
  return (
    <div style={{ margin: "2.5rem 0" }}>
      {/* Header */}
      <div style={{
        background: "var(--ink)",
        borderRadius: "8px 8px 0 0",
        padding: "0.7rem 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px" }}>
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
          <span style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "Inter, system-ui, sans-serif",
          }}>
            The Argument in Six Claims
          </span>
        </div>
        <span style={{
          fontSize: "10px",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.04em",
        }}>
          Each claim is counterintuitive, load-bearing, and falsifiable
        </span>
      </div>

      {/* Claim cards */}
      <div style={{ border: "1px solid var(--rule)", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
        {CLAIMS.map((c, i) => (
          <ClaimCard key={c.id} c={c} isLast={i === CLAIMS.length - 1} />
        ))}
      </div>

      {/* Footer note */}
      <p style={{
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', monospace",
        fontStyle: "italic",
        color: "var(--ink-light)",
        margin: "0.75rem 0 0",
        paddingLeft: "1rem",
        borderLeft: "2px solid var(--rule)",
        lineHeight: 1.6,
      }}>
        Sections 8 through 10 defend each claim. Appendix A specifies the unit. Predictions 1 through 9 are the paper's full falsification surface, each dated.
      </p>
    </div>
  );
}
