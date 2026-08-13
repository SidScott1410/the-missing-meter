// ArchitectureDiagram — pi.website style vertical stacked-card flow
// Light dotted-grid background (like pi.website/blog/pi07 architecture diagrams)
// Amber accent on the "served token" node — the paper's central claim
// Monospace italic caption below
// Fully mobile-responsive single column

import { useRef, useEffect, useState } from "react";

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  accent?: boolean;
}

interface FlowArrow {
  label: string;
  amber?: boolean;
}

type FlowItem = FlowNode | FlowArrow;

function isArrow(item: FlowItem): item is FlowArrow {
  return !("id" in item);
}

const FLOW: FlowItem[] = [
  {
    id: "hyperscaler",
    label: "Hyperscaler GPU Clusters",
    sublabel: "Physical infrastructure — NVIDIA, AMD · $725B capex guidance (2026)",
  },
  { label: "compute capacity" },
  {
    id: "cloud",
    label: "Cloud AI APIs",
    sublabel: "OpenAI · Anthropic · Google · Mistral — inference-as-a-service",
  },
  { label: "API calls (tokens billed)", amber: true },
  {
    id: "served-token",
    label: "The Served Token (svt)",
    sublabel: "1 output token · delivered inside SLO · above quality floor",
    accent: true,
  },
  { label: "priced, routed, metered", amber: true },
  {
    id: "enterprise",
    label: "Enterprise Orchestration",
    sublabel: "Agents, RAG pipelines, workflow automation — Finance · Healthcare · Legal",
  },
  { label: "end-user requests" },
  {
    id: "consumer",
    label: "End Users & Applications",
    sublabel: "The demand layer — consumers, developers, embedded AI products",
  },
];

export default function ArchitectureDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const nodes = FLOW.filter((f) => !isArrow(f)) as FlowNode[];

  return (
    <div ref={containerRef} style={{ margin: "2rem 0" }}>
      {/* Eyebrow label */}
      <div style={{
        fontSize: "10px",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ink-mid)",
        marginBottom: "0.75rem",
      }}>
        Figure — The served token as unit of account
      </div>

      {/* Dotted-grid container — pi.website style */}
      <div style={{
        position: "relative",
        borderRadius: "10px",
        border: "1px solid var(--rule)",
        background: "var(--paper)",
        backgroundImage: "radial-gradient(circle, var(--rule) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        padding: "1.5rem 1.25rem",
        overflow: "hidden",
      }}>
        {/* Supply / Demand labels */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}>
          <span style={{ fontSize: "9px", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)" }}>Supply</span>
          <span style={{ fontSize: "9px", fontFamily: "Inter, system-ui, sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)" }}>Demand</span>
        </div>

        {/* Flow items */}
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {FLOW.map((item, i) => {
            if (isArrow(item)) {
              return (
                <div
                  key={`arrow-${i}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0.15rem 0",
                    opacity: visible ? 1 : 0,
                    transition: `opacity 400ms ${60 + i * 55}ms ease`,
                  }}
                >
                  <span style={{
                    fontSize: "9.5px",
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: item.amber ? "var(--amber)" : "var(--ink-light)",
                    marginBottom: "0.1rem",
                  }}>
                    {item.label}
                  </span>
                  <svg width="16" height="22" viewBox="0 0 16 22" fill="none" aria-hidden>
                    <line x1="8" y1="0" x2="8" y2="14" stroke={item.amber ? "var(--amber)" : "var(--ink-light)"} strokeWidth="1.5" />
                    <polyline points="2,10 8,18 14,10" fill="none" stroke={item.amber ? "var(--amber)" : "var(--ink-light)"} strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
              );
            }

            const node = item as FlowNode;
            const nodeIndex = nodes.indexOf(node);
            const delay = 80 + nodeIndex * 90;

            return (
              <div
                key={node.id}
                style={{
                  position: "relative",
                  border: node.accent ? `2px solid var(--amber)` : `1px solid var(--rule)`,
                  borderRadius: 6,
                  background: node.accent ? "var(--amber)" : "white",
                  padding: "0.85rem 1rem 0.85rem 2.75rem",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 500ms ${delay}ms cubic-bezier(0.23,1,0.32,1), transform 500ms ${delay}ms cubic-bezier(0.23,1,0.32,1)`,
                  boxShadow: node.accent
                    ? "0 4px 16px rgba(200,168,75,0.25)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {/* Step number badge — pi.website style */}
                <div style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  width: 22,
                  height: 22,
                  borderRadius: 3,
                  background: node.accent ? "rgba(255,255,255,0.25)" : "var(--surface)",
                  border: node.accent ? "1px solid rgba(255,255,255,0.4)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 700,
                  color: node.accent ? "white" : "var(--ink-mid)",
                  flexShrink: 0,
                }}>
                  {nodeIndex + 1}
                </div>

                <div style={{
                  fontSize: "13.5px",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 700,
                  color: node.accent ? "white" : "var(--ink)",
                  lineHeight: 1.3,
                  marginBottom: node.sublabel ? "0.25rem" : 0,
                }}>
                  {node.label}
                </div>
                {node.sublabel && (
                  <div style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: "10.5px",
                    fontStyle: "italic",
                    color: node.accent ? "rgba(255,255,255,0.85)" : "var(--ink-mid)",
                    lineHeight: 1.5,
                  }}>
                    {node.sublabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: "1.25rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--rule)",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1.5rem",
          justifyContent: "center",
        }}>
          {[
            { color: "var(--amber)", label: "Served token — the missing unit" },
            { color: "var(--rule)", label: "Existing layers (GPU-hours, raw tokens)" },
          ].map(a => (
            <div key={a.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: a.color, border: "1px solid var(--rule)", flexShrink: 0 }} />
              <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "11px", color: "var(--ink-mid)" }}>
                {a.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monospace italic caption — pi.website style */}
      <p style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        fontSize: "11.5px",
        fontStyle: "italic",
        color: "var(--ink-mid)",
        lineHeight: 1.55,
        marginTop: "0.65rem",
        marginBottom: 0,
      }}>
        The served token (svt) sits between the GPU-hour on the invoice and the verified useful work on the income
        statement. It is the unit that makes the layer above it legible and the layer below it a commodity.
      </p>
    </div>
  );
}
