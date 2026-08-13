// WorkedExampleAccordion — A.9 step-by-step tuple walkthrough
// Six fields → C value, expandable steps, reproducible without opening the PDF.
// Design: monochromatic instrument aesthetic matching the rest of the appendix.

import { useState } from "react";

interface Step {
  id: string;
  field: string;
  label: string;
  buyer1: string;
  buyer2: string;
  note: string;
}

const STEPS: Step[] = [
  {
    id: "step-artifact",
    field: "Artifact",
    label: "Step 1 — Declare the artifact",
    buyer1: "Llama 3.3 Instruct 70B · fp8 quantization · Provider N",
    buyer2: "Llama 3.3 Instruct 70B · fp8 quantization · Provider A",
    note: "Both buyers use the same open-weight model. The fp8 quantization must be declared per A.4 — the two buyers are not entitled to assume the same quality floor until it is stated and tested.",
  },
  {
    id: "step-slo",
    field: "SLO",
    label: "Step 2 — State the service-level objective",
    buyer1: "TTFT ≤ 1.0 s · sustained output ≥ 100 tok/s (voice playback floor)",
    buyer2: "Complete within 12 hours · no per-token latency floor",
    note: "The SLO is the condition that determines whether a token was worth anything at all. A voice reply arriving in 4 s is a refund. A batch job finishing in 11 h 59 m is a success.",
  },
  {
    id: "step-spend",
    field: "Spend (S)",
    label: "Step 3 — Record the spend",
    buyer1: "$0.64 / million blended tokens (Provider N list price)",
    buyer2: "$0.12 / million blended tokens (Provider A list price)",
    note: "S is the invoice figure — list, committed, or spot — disclosed per A.5. Both figures are [SPEC] from public provider pricing, accessed July 2026.",
  },
  {
    id: "step-w",
    field: "Compliant output (W)",
    label: "Step 4 — Measure compliant output",
    buyer1: "W ≈ billed output (329.6 tok/s · TTFT 0.95 s — both bounds met)",
    buyer2: "W ≈ billed output (15.2 tok/s — latency floor not applicable)",
    note: "W is the token count that passed the SLO. For Buyer 1, Provider A's 15.2 tok/s fails the 100 tok/s floor, so W ≈ 0 and C diverges. For Buyer 2, every provider is compliant, so W = billed output everywhere.",
  },
  {
    id: "step-c",
    field: "C = S / W",
    label: "Step 5 — Compute C",
    buyer1: "C ≈ $0.64 / Msvt  (cheapest compliant placement)",
    buyer2: "C ≈ $0.12 / Msvt  (cheapest compliant placement)",
    note: "Same weights, same input, opposite rankings. The inversion is invisible to both metrics the industry currently prices with: $/GPU-hour cannot see the workload at all, and raw $/Mtok ranks the placements identically for both buyers — wrongly for one of them.",
  },
  {
    id: "step-routing",
    field: "Routing margin",
    label: "Step 6 — Read the routing margin",
    buyer1: "Buyer 1 pays $0.64 / Msvt — correct placement",
    buyer2: "Buyer 2 pays $0.12 / Msvt — correct placement",
    note: "The spread between those two correct answers — a factor of 5.3× on identical work — is the routing margin of Section 9, computed from nothing but public numbers. Buyer 1's premium placement is paying 21.7× the speed for a deadline that cannot use it.",
  },
];

function StepCard({ step, index, isOpen, onToggle }: {
  step: Step;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      borderBottom: index < STEPS.length - 1 ? "1px solid var(--rule)" : "none",
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
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        {/* Step number */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          fontWeight: 700,
          color: "var(--amber-dark)",
          letterSpacing: "0.08em",
          minWidth: "1.8rem",
          flexShrink: 0,
        }}>
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Field tag */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--ink)",
          background: "var(--surface-dark, #e8e4df)",
          borderRadius: 3,
          padding: "0.15rem 0.5rem",
          flexShrink: 0,
          letterSpacing: "0.04em",
        }}>
          {step.field}
        </span>

        {/* Label */}
        <span style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--ink-mid)",
          flex: 1,
          minWidth: 0,
        }}>
          {step.label.replace(/^Step \d+ — /, "")}
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
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Expanded detail */}
      <div style={{
        overflow: "hidden",
        maxHeight: isOpen ? "600px" : "0",
        transition: "max-height 280ms cubic-bezier(0.23,1,0.32,1)",
      }}>
        <div style={{ padding: "0 1.25rem 1rem 1.25rem", borderTop: "1px solid var(--rule)" }}>
          {/* Two-buyer comparison */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.75rem",
            margin: "0.85rem 0 0.75rem",
          }}>
            <div style={{
              background: "var(--ink)",
              borderRadius: 6,
              padding: "0.85rem 1rem",
              borderLeft: "3px solid var(--amber)",
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontFamily: "Inter, sans-serif", marginBottom: "0.4rem" }}>
                Buyer 1 — Voice agent
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--paper)", lineHeight: 1.5 }}>
                {step.buyer1}
              </div>
            </div>
            <div style={{
              background: "var(--surface)",
              borderRadius: 6,
              padding: "0.85rem 1rem",
              border: "1px solid var(--rule)",
            }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-light)", fontFamily: "Inter, sans-serif", marginBottom: "0.4rem" }}>
                Buyer 2 — Batch job
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--ink)", lineHeight: 1.5 }}>
                {step.buyer2}
              </div>
            </div>
          </div>

          {/* Explanatory note */}
          <p style={{
            fontSize: "12px",
            color: "var(--ink-mid)",
            fontFamily: "Inter, system-ui, sans-serif",
            lineHeight: 1.6,
            margin: 0,
            borderLeft: "2px solid var(--rule)",
            paddingLeft: "0.75rem",
          }}>
            {step.note}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WorkedExampleAccordion() {
  const [openStep, setOpenStep] = useState<string | null>("step-artifact");

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
            A.9 Worked example
          </span>
          <p style={{ margin: "0.15rem 0 0", fontSize: "12px", color: "var(--ink-mid)", fontFamily: "Inter, sans-serif" }}>
            Six fields → C — click each step to expand
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
          Llama 3.3 70B · 15 providers · July 2026
        </span>
      </div>

      {/* Steps */}
      {STEPS.map((step, i) => (
        <StepCard
          key={step.id}
          step={step}
          index={i}
          isOpen={openStep === step.id}
          onToggle={() => setOpenStep(openStep === step.id ? null : step.id)}
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
        All figures [SPEC] for prices, [MEASURED, THIRD PARTY] for latency/throughput from public benchmarks.
        This example uses p50 medians; a fully conforming record requires the declared percentile (typically p99).
      </div>
    </div>
  );
}
