// PredictionScoreboard — eight dated predictions with live status
// Status, note, and last_updated are loaded from /predictions-status.json at runtime.
// To update a prediction: edit client/public/predictions-status.json — no code changes needed.
// Each card is collapsed by default; click to expand claim + kill criterion.

import { useState, useEffect } from "react";
import { withBase } from "@/lib/asset";

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  "Open":     { bg: "var(--surface)", color: "var(--ink-mid)", border: "var(--rule)" },
  "Half met": { bg: "rgba(212,160,23,0.08)", color: "oklch(0.42 0.12 75)", border: "rgba(212,160,23,0.35)" },
  "Met":      { bg: "rgba(34,120,60,0.07)", color: "oklch(0.35 0.12 145)", border: "rgba(34,120,60,0.3)" },
  "Failed":   { bg: "rgba(180,40,40,0.07)", color: "oklch(0.38 0.14 25)", border: "rgba(180,40,40,0.3)" },
};

// Map prediction IDs to relevant appendix anchors for kill-criterion links
const APPENDIX_LINKS: Record<string, { href: string; label: string }[]> = {
  P1:  [],
  P2:  [{ href: "/#appendix-a3", label: "A.3 Token denominator" }, { href: "/#appendix-a7", label: "A.7 Sensitivity curve" }],
  P2b: [{ href: "/#appendix-a1", label: "A.1 The unit" }, { href: "/#appendix-a8", label: "A.8 Governance" }],
  P3:  [],
  P4:  [],
  P5:  [],
  P6:  [{ href: "/#appendix-a9", label: "A.9 Worked example" }],
  P7:  [{ href: "/#appendix-a3", label: "A.3 Token denominator" }],
  P8:  [{ href: "/#appendix-a7", label: "A.7 Sensitivity curve" }, { href: "/#appendix-a2", label: "A.2 Quality floor" }],
};

// Static prediction definitions — claim text and kill criterion never change.
// Status and note are overridden by predictions-status.json.
const PREDICTIONS_BASE = [
  {
    id: "P1",
    title: "Open-weight token share",
    deadline: "Mid-2028",
    claim: "Majority of inference tokens (by volume) served from open-weight models.",
    killCriterion: "Frontier closed models still carry whole-market majority by mid-2028.",
  },
  {
    id: "P2",
    title: "The unit emerges (prior art path)",
    deadline: "End-2028",
    claim: "The unit resolves through prior art: MLCommons adds a cost denominator to the MLPerf Inference Server scenario (already subject to p99 latency bounds and reference-accuracy floors), or TPC adds a per-request tail-latency constraint to TPCx-AI (which already reports $/AIUCpm@SF under audited pricing rules). Either counts as confirmation rather than refutation.",
    killCriterion: "Neither MLCommons nor TPC moves in this direction by end-2028.",
  },
  {
    id: "P2b",
    title: "The original unit as written",
    deadline: "End-2029",
    claim: "At least one open, multi-party specification for cost-of-useful-work-under-service-level published with measurement methodology and adopted by at least two major clouds or serving frameworks in pricing or disclosure.",
    killCriterion: "If compute is still overwhelmingly transacted in raw GPU-hours with no work-denominated unit in commercial use by end-2029, the central claim of this paper fails on its own kill criterion.",
  },
  {
    id: "P3",
    title: "Depreciation converges downward",
    deadline: "End-2028",
    claim: "At least two of the five largest AI spenders disclose shortened or asset-class-segmented depreciation schedules for AI silicon.",
    killCriterion: "Outright absence by end-2028 would indicate the accounting fog can outlast the cycle.",
  },
  {
    id: "P4",
    title: "The correction, and the survival",
    deadline: "Before end-2028",
    claim: "A material repricing of AI-exposed equities occurs, and total tokens served continues to grow through it quarter over quarter without interruption.",
    killCriterion: "Correction arrives and token volume also contracts for consecutive quarters — demand was all speculative and the Jevons read was off.",
  },
  {
    id: "P5",
    title: "Second-life silicon clears",
    deadline: "Through 2029",
    claim: "Cascaded GPUs (first-generation-behind) sustain secondary-market utilization above ~60% for inference workloads.",
    killCriterion: "Cascaded silicon scraps instead of clearing. If no cohort-level utilization series exists by end-2027, the prediction is unscorable and is counted against the thesis, not for it.",
  },
  {
    id: "P6",
    title: "Routing becomes a line item",
    deadline: "End-2027",
    claim: "Model-routing or inference-optimization appears as a named budget category in mainstream enterprise IT surveys.",
    killCriterion: "Failure is a timing miss, not a falsification.",
  },
  {
    id: "P7",
    title: "The value migration itself",
    deadline: "By 2030",
    claim: "Market value created by companies operating measurement, routing, and agent-settlement layers founded after 2023 exceeds value created by companies whose primary asset is owned accelerators, on capital invested.",
    killCriterion: "The Visa test. Also tests Section 2.1's boundary condition: if the coordination layer is instead bundled into an existing asset owner before a neutral standard sets, the outcome is the AWS case rather than the Visa case — this paper would be right about the layer and wrong about the owner.",
  },
  {
    id: "P8",
    title: "The measurement bus learns to see interactive deadlines",
    deadline: "End-2027",
    claim: "OpenTelemetry's generative-AI semantic conventions either reach stable status with per-request latency expressible on spans, or revise the default explicit bucket boundaries for the gen_ai.server.time_per_output_token histogram to resolve bounds below ten milliseconds. Baseline: SemConv v1.40.0, April 2026 (Development status).",
    killCriterion: "Failure indicates the standard telemetry bus remains unable to measure the service class the interactive market is actually buying, which would slow every prediction above it. This is the smallest concrete change any existing body could make in the direction of this paper's argument — its cost is one line in a configuration file.",
  },
];

type Status = "Open" | "Half met" | "Met" | "Failed";

interface StatusOverride {
  id: string;
  status: Status;
  note?: string | null;
}

interface StatusConfig {
  _last_updated?: string;
  predictions: StatusOverride[];
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      display: "inline-block",
      padding: "0.2rem 0.6rem",
      borderRadius: 3,
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.color,
      fontSize: "11px",
      fontWeight: 600,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      {status}
    </span>
  );
}

type Prediction = typeof PREDICTIONS_BASE[number] & { status: Status; note?: string | null };

function PredictionCard({ p, isLast }: { p: Prediction; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const s = STATUS_STYLES[p.status];

  return (
    <div
      id={`scoreboard-${p.id.toLowerCase()}`}
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--rule)",
        background: p.status === "Half met"
          ? "rgba(212,160,23,0.03)"
          : p.status === "Met"
          ? "rgba(34,120,60,0.02)"
          : p.status === "Failed"
          ? "rgba(180,40,40,0.02)"
          : "var(--paper)",
        scrollMarginTop: "110px",
      }}
    >
      {/* Clickable header row — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`pred-detail-${p.id}`}
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
          {p.id}
        </span>

        {/* Title + deadline stacked */}
        <span style={{ flex: "1 1 120px", minWidth: 0 }}>
          <span style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "13.5px",
            color: "var(--ink)",
            lineHeight: 1.3,
            display: "block",
          }}>
            {p.title}
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10.5px",
            color: "var(--ink-light)",
            letterSpacing: "0.04em",
            display: "block",
            marginTop: "0.2rem",
          }}>
            {p.deadline}
          </span>
        </span>

        {/* Status badge + chevron */}
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <StatusBadge status={p.status} />
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
              flexShrink: 0,
            }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {/* Expandable detail */}
      <div
        id={`pred-detail-${p.id}`}
        style={{
          overflow: "hidden",
          maxHeight: open ? "800px" : "0",
          transition: "max-height 280ms cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div style={{ padding: "0 1.25rem 1rem", borderTop: "1px solid var(--rule)" }}>
          {/* Claim */}
          <p style={{
            fontSize: "13px",
            color: "var(--ink-mid)",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.65,
            margin: "0.75rem 0 0.35rem",
          }}>
            {p.claim}
          </p>

          {/* Note (e.g. half-met evidence) — from JSON config */}
          {p.note && (
            <p style={{
              fontSize: "11.5px",
              color: s.color,
              fontFamily: "'JetBrains Mono', monospace",
              fontStyle: "italic",
              margin: "0 0 0.35rem",
              lineHeight: 1.5,
            }}>
              ↳ {p.note}
            </p>
          )}

          {/* Kill criterion */}
          <p style={{
            fontSize: "11.5px",
            color: "var(--ink-light)",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.55,
            margin: "0 0 0.5rem",
            fontStyle: "italic",
          }}>
            Kill criterion: {p.killCriterion}
          </p>

          {/* Appendix cross-reference links */}
          {APPENDIX_LINKS[p.id]?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink-light)",
                fontFamily: "Inter, sans-serif",
                flexShrink: 0,
              }}>See:</span>
              {APPENDIX_LINKS[p.id].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "var(--amber-dark, #b8860b)",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(184,134,11,0.3)",
                    paddingBottom: "1px",
                    transition: "border-color 120ms ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = "var(--amber-dark, #b8860b)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = "rgba(184,134,11,0.3)"; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PredictionScoreboard() {
  const [overrides, setOverrides] = useState<StatusConfig | null>(null);
  const [lastUpdated, setLastUpdated] = useState("July 31, 2026");

  useEffect(() => {
    fetch(withBase("predictions-status.json"))
      .then((r) => r.json())
      .then((data: StatusConfig) => {
        setOverrides(data);
        if (data._last_updated) {
          // Format ISO date as "Month D, YYYY"
          const d = new Date(data._last_updated + "T00:00:00");
          setLastUpdated(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
        }
      })
      .catch(() => { /* silently fall back to defaults */ });
  }, []);

  // Merge static base with runtime overrides
  const predictions: Prediction[] = PREDICTIONS_BASE.map((base) => {
    const ov = overrides?.predictions.find((o) => o.id === base.id);
    return {
      ...base,
      status: (ov?.status ?? "Open") as Status,
      note: ov?.note ?? null,
    };
  });

  const openCount = predictions.filter((p) => p.status === "Open").length;
  const metCount  = predictions.filter((p) => p.status === "Met" || p.status === "Half met").length;

  return (
    <div style={{ margin: "2rem 0" }}>
      {/* Scoreboard header */}
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
            Prediction Scoreboard
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          <span style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
          }}>
            Last updated: {lastUpdated} · {predictions.length} predictions
          </span>
          {metCount > 0 && (
            <span style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
            }}>
              {openCount} open · {metCount} met/half-met
            </span>
          )}
        </div>
      </div>

      {/* Prediction cards — click to expand */}
      <div style={{ border: "1px solid var(--rule)", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
        {predictions.map((p, i) => (
          <PredictionCard key={p.id} p={p} isLast={i === predictions.length - 1} />
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
        This scoreboard is a public falsifiability commitment. Statuses will be updated as evidence accumulates.
        A prediction marked "Failed" is not a retraction — it is the mechanism by which the argument is tested.
      </p>
    </div>
  );
}
