// OpenProblemsAccordion — A.10 four open problems as expandable cards
// Each problem: title, one-line "why deferred", and a fuller explanation.
// Design: matches the A.9 accordion aesthetic — monochromatic, amber accent.

import { useState } from "react";

interface Problem {
  id: string;
  title: string;
  deferred: string;
  detail: string;
}

const PROBLEMS: Problem[] = [
  {
    id: "op-quality",
    title: "Quality floors richer than binary acceptance",
    deferred: "Deferred to keep the unit's first version computable from existing infrastructure.",
    detail: "The current specification uses a binary quality floor: a token either passes or fails the declared acceptance criterion. Richer floors — continuous quality scores, task-specific rubrics, human-preference ratings — are measurable today but require either a standardized evaluation harness or a trusted third-party scorer. Neither exists at the cross-vendor level. The binary floor is a deliberate simplification that makes C computable from public data right now; it is not a claim that quality is binary.",
  },
  {
    id: "op-price",
    title: "Price basis normalization (list, committed, or spot)",
    deferred: "Deferred because normalization requires a multi-party convention the tuple cannot unilaterally set.",
    detail: "The tuple requires the price basis to be declared (A.5) but does not normalize across it. A list-price C and a committed-rate C for the same workload are not directly comparable — the committed rate embeds a capacity reservation that the list rate does not. Normalizing them requires either a standard discount schedule (which vendors do not publish) or a multi-party convention on how to amortize commitment premiums. The tuple's disclosure requirement is the first step; normalization is the second, and it requires a body.",
  },
  {
    id: "op-energy",
    title: "Energy term (joules per compliant token)",
    deferred: "Deferred to keep the unit one-dimensional in its first version; the natural second axis.",
    detail: "Joules per compliant token is measurable today: power draw is reported by NVIDIA's NVML API, AMD's ROCm SMI, and Intel's RAPL interface, all accessible without special access. The energy term is the natural second axis of C — it would make the unit a two-dimensional cost vector (dollars, joules) rather than a scalar. Deferral is a scope decision, not a technical one. The paper notes this explicitly so the omission is not mistaken for a claim that energy is unimportant.",
  },
  {
    id: "op-slo-classes",
    title: "Reference service-level classes",
    deferred: "Deferred because only a multi-party body can legitimately set standard SLO classes.",
    detail: "Reference SLO classes are the analogue of standard voltages: a small set of named, interoperable service levels (e.g. 'interactive', 'batch', 'real-time voice') that buyers and sellers could reference without negotiating every bound from scratch. They would make C values directly comparable across providers and workloads. Setting them unilaterally in this specification would be the wrong governance model — it would create a de facto standard without the legitimacy that comes from multi-party ratification. This is the strongest argument for why the unit needs a body, and the strongest reason to publish the specification as a draft.",
  },
];

function ProblemCard({ problem, index, isOpen, onToggle }: {
  problem: Problem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      borderBottom: index < PROBLEMS.length - 1 ? "1px solid var(--rule)" : "none",
    }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "0.85rem 1.25rem",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        {/* Number */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          fontWeight: 700,
          color: "var(--ink-light)",
          letterSpacing: "0.08em",
          minWidth: "1.5rem",
          flexShrink: 0,
          paddingTop: "2px",
        }}>
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Title + deferred note */}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "13px",
            color: "var(--ink)",
            lineHeight: 1.35,
            display: "block",
          }}>
            {problem.title}
          </span>
          <span style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "11.5px",
            color: "var(--ink-light)",
            fontStyle: "italic",
            display: "block",
            marginTop: "0.2rem",
            lineHeight: 1.4,
          }}>
            {problem.deferred}
          </span>
        </span>

        {/* Chevron */}
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          aria-hidden="true"
          style={{
            transition: "transform 180ms cubic-bezier(0.23,1,0.32,1)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            color: "var(--ink-light)",
            flexShrink: 0,
            marginTop: "3px",
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Expanded detail */}
      <div style={{
        overflow: "hidden",
        maxHeight: isOpen ? "500px" : "0",
        transition: "max-height 260ms cubic-bezier(0.23,1,0.32,1)",
      }}>
        <div style={{ padding: "0 1.25rem 1rem 1.25rem", borderTop: "1px solid var(--rule)" }}>
          <p style={{
            fontSize: "12.5px",
            color: "var(--ink-mid)",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.65,
            margin: "0.75rem 0 0",
            borderLeft: "2px solid var(--rule)",
            paddingLeft: "0.75rem",
          }}>
            {problem.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OpenProblemsAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div style={{
      margin: "1.5rem 0",
      border: "1px solid var(--rule)",
      borderRadius: 8,
      overflow: "hidden",
      background: "var(--paper)",
    }}>
      {/* Header */}
      <div style={{
        padding: "0.75rem 1.25rem",
        borderBottom: "1px solid var(--rule)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}>
        <div>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--amber-dark)",
            fontFamily: "Inter, sans-serif",
          }}>
            A.10 Open problems
          </span>
          <p style={{ margin: "0.15rem 0 0", fontSize: "12px", color: "var(--ink-mid)", fontFamily: "Inter, sans-serif" }}>
            Four genuinely open problems — stated so their omission is not mistaken for resolution
          </p>
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          color: "var(--ink-light)",
          background: "var(--surface-dark, #e8e4df)",
          borderRadius: 3,
          padding: "0.15rem 0.5rem",
        }}>
          {PROBLEMS.length} deferred items
        </span>
      </div>

      {/* Problem cards */}
      {PROBLEMS.map((problem, i) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          index={i}
          isOpen={openId === problem.id}
          onToggle={() => setOpenId(openId === problem.id ? null : problem.id)}
        />
      ))}

      {/* Footer */}
      <div style={{
        padding: "0.65rem 1.25rem",
        borderTop: "1px solid var(--rule)",
        background: "var(--surface)",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "11px",
        color: "var(--ink-light)",
        fontStyle: "italic",
      }}>
        Each is a reason this appendix is a draft. None is a reason the unit cannot be computed today, because A.9 just computed it.
      </div>
    </div>
  );
}
