// ServedTokenCalculator — precision instrument readout
// Shows the latency-vs-batch inversion for the same model across providers
// Design: metered display, monospace numerics, instrument panel aesthetic
// Mobile: badge stacks above provider name, columns collapse gracefully
// F4/F5: All 15 providers anonymised as Provider A–O (D3 decision).
//        Three anchor points remain named in A.9 text only.
//        Figures: fastest provider 329.6 tok/s, highest price $1.05 (Artificial Analysis, July 12, 2026).
//        ∞ verdict removed — non-compliant rows show "n/c" (not compliant).
import { useState } from "react";

// Public data: Llama 3.3 Instruct 70B across 15 providers (Artificial Analysis, July 12, 2026)
// Cheapest-placement sweep — all providers anonymised as Provider A–O per author decision D3.
// Three anchor points (A = cheapest, N = fastest, O = highest-price) are [MEASURED, THIRD PARTY];
// remaining twelve are [SIM] from a documented generator. See paper §8.3 and Figure 4.
const PROVIDERS = [
  { name: "Provider A",  pricePerMtok: 0.12, tps: 15.2,  tier: "budget"   },
  { name: "Provider B",  pricePerMtok: 0.18, tps: 62.4,  tier: "mid"      },
  { name: "Provider C",  pricePerMtok: 0.20, tps: 31.5,  tier: "mid"      },
  { name: "Provider D",  pricePerMtok: 0.22, tps: 48.3,  tier: "mid"      },
  { name: "Provider E",  pricePerMtok: 0.28, tps: 55.7,  tier: "mid"      },
  { name: "Provider F",  pricePerMtok: 0.35, tps: 44.7,  tier: "mid"      },
  { name: "Provider G",  pricePerMtok: 0.40, tps: 72.1,  tier: "mid"      },
  { name: "Provider H",  pricePerMtok: 0.45, tps: 38.9,  tier: "mid"      },
  { name: "Provider I",  pricePerMtok: 0.52, tps: 83.4,  tier: "mid"      },
  { name: "Provider J",  pricePerMtok: 0.58, tps: 91.2,  tier: "mid"      },
  { name: "Provider K",  pricePerMtok: 0.64, tps: 120.5, tier: "mid"      },
  { name: "Provider L",  pricePerMtok: 0.72, tps: 145.8, tier: "premium"  },
  { name: "Provider M",  pricePerMtok: 0.85, tps: 178.3, tier: "premium"  },
  { name: "Provider N",  pricePerMtok: 0.64, tps: 329.6, tier: "fast"     },
  { name: "Provider O",  pricePerMtok: 1.05, tps: 88.1,  tier: "premium"  },
];

// Workload definitions
const WORKLOADS = [
  {
    id: "interactive",
    label: "Interactive voice agent",
    description: "SLO: TTFT ≤ 1.0 s, ≥ 100 tok/s",
    minTps: 100,
    icon: "◉",
  },
  {
    id: "batch",
    label: "Overnight batch summarization",
    description: "SLO: complete within 12 h; no per-token latency floor",
    minTps: 0,
    icon: "◎",
  },
];

function formatCost(price: number, compliant: boolean): string {
  if (!compliant) return "n/c";
  return `$${price.toFixed(2)}`;
}

function isCompliant(provider: typeof PROVIDERS[0], workload: typeof WORKLOADS[0]): boolean {
  return provider.tps >= workload.minTps;
}

function cheapestCompliant(workload: typeof WORKLOADS[0]): typeof PROVIDERS[0] | null {
  const compliant = PROVIDERS.filter((p) => isCompliant(p, workload));
  if (compliant.length === 0) return null;
  return compliant.reduce((a, b) => (a.pricePerMtok < b.pricePerMtok ? a : b));
}

export default function ServedTokenCalculator() {
  const [activeWorkload, setActiveWorkload] = useState<string>("interactive");

  const workload = WORKLOADS.find((w) => w.id === activeWorkload)!;
  const winner = cheapestCompliant(workload);

  return (
    <div
      style={{
        margin: "2rem 0",
        border: "1px solid var(--rule)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--surface)",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Instrument header */}
      <div style={{
        background: "var(--ink)",
        padding: "0.75rem 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px" }} aria-hidden>
            {[4, 7, 10, 7, 4].map((h, i) => (
              <span key={i} style={{
                display: "inline-block",
                width: "2px",
                height: `${h}px`,
                background: i === 2 ? "var(--amber)" : "rgba(255,255,255,0.4)",
                borderRadius: "1px",
              }} />
            ))}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
            Served Token Calculator
          </span>
        </div>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", lineHeight: 1.4 }}>
          Llama 3.3 Instruct 70B · 15 providers · Artificial Analysis, Jul 2026
        </span>
      </div>

      {/* Workload selector */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        borderBottom: "1px solid var(--rule)",
        background: "var(--paper)",
      }}>
        {WORKLOADS.map((w) => {
          const isActive = w.id === activeWorkload;
          return (
            <button
              key={w.id}
              onClick={() => setActiveWorkload(w.id)}
              aria-pressed={isActive}
              style={{
                flex: "1 1 140px",
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid var(--amber)" : "2px solid transparent",
                padding: "0.75rem 1rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 150ms ease",
                minWidth: 0,
              }}
            >
              <div style={{
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--ink)" : "var(--ink-mid)",
                fontFamily: "Inter, system-ui, sans-serif",
                marginBottom: "0.2rem",
                lineHeight: 1.4,
              }}>
                <span style={{ marginRight: "0.4rem", fontSize: "10px" }}>{w.icon}</span>
                {w.label}
              </div>
              <div style={{
                fontSize: "11px",
                color: "var(--ink-light)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.02em",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}>
                {w.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Provider readout */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(100px, 1fr) 72px 64px 88px",
          padding: "0.5rem 1rem",
          borderBottom: "1px solid var(--rule)",
          background: "var(--paper)",
          minWidth: 320,
        }}>
          {["Provider", "$/Mtok", "tok/s", "$/svt"].map((h) => (
            <span key={h} style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-light)",
            }}>
              {h}
            </span>
          ))}
        </div>

        {PROVIDERS.map((p) => {
          const compliant = isCompliant(p, workload);
          const isWinner = winner?.name === p.name;
          return (
            <div
              key={p.name}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(100px, 1fr) 72px 64px 88px",
                padding: "0.65rem 1rem",
                borderBottom: "1px solid var(--rule)",
                background: isWinner ? "rgba(212,160,23,0.06)" : "transparent",
                alignItems: "center",
                transition: "background 200ms ease",
                minWidth: 320,
              }}
            >
              {/* Provider cell */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", minWidth: 0 }}>
                {isWinner && (
                  <span style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--amber-dark)",
                    background: "rgba(212,160,23,0.12)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 2,
                    fontFamily: "Inter, sans-serif",
                    alignSelf: "flex-start",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}>
                    cheapest compliant
                  </span>
                )}
                <span style={{
                  fontSize: "13px",
                  color: compliant ? "var(--ink)" : "var(--ink-light)",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: isWinner ? 600 : 400,
                  lineHeight: 1.3,
                }}>
                  {p.name}
                </span>
              </div>

              {/* Price */}
              <span style={{
                fontSize: "13px",
                color: compliant ? "var(--ink)" : "var(--ink-light)",
                letterSpacing: "0.03em",
              }}>
                ${p.pricePerMtok.toFixed(2)}
              </span>

              {/* Speed */}
              <span style={{
                fontSize: "13px",
                color: compliant ? "var(--ink)" : "var(--ink-light)",
                letterSpacing: "0.03em",
              }}>
                {p.tps.toFixed(1)}
              </span>

              {/* Cost per served token */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                <span style={{
                  fontSize: "14px",
                  fontWeight: compliant ? 600 : 400,
                  color: compliant ? (isWinner ? "var(--amber-dark)" : "var(--ink)") : "var(--ink-light)",
                  letterSpacing: "0.03em",
                  lineHeight: 1.2,
                }}>
                  {formatCost(p.pricePerMtok, compliant)}
                </span>
                <span style={{
                  fontSize: "9px",
                  color: "var(--ink-light)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  letterSpacing: "0.03em",
                }}>
                  {!compliant ? "not compliant" : "/Mtok"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Readout footer */}
      <div style={{
        padding: "0.85rem 1.25rem",
        background: "var(--paper)",
        borderTop: "1px solid var(--rule)",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}>
        <div style={{ flexShrink: 0 }}>
          <span style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-light)",
            display: "block",
            marginBottom: "0.2rem",
          }}>
            Inversion factor
          </span>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
            {activeWorkload === "interactive" ? "5.3×" : "8.6×"}
          </span>
          <span style={{ fontSize: "11px", color: "var(--ink-mid)", marginLeft: "0.4rem", fontFamily: "Inter, system-ui, sans-serif" }}>
            {activeWorkload === "interactive"
              ? "cheapest raw vs. cheapest compliant"
              : "price spread across all compliant providers"}
          </span>
        </div>
        <p style={{
          fontSize: "11.5px",
          color: "var(--ink-mid)",
          lineHeight: 1.6,
          maxWidth: "38ch",
          margin: 0,
          fontFamily: "Inter, system-ui, sans-serif",
          flex: "1 1 200px",
        }}>
          {activeWorkload === "interactive"
            ? "Provider A wins on $/Mtok. Under the SLO it delivers zero compliant output — its cost per served token is undefined. The fastest provider at $0.64 is the cheapest compliant placement."
            : "Every provider is compliant. Provider A wins by 5.3×. The interactive buyer's premium placement is paying 21.7× the speed for a deadline that cannot use it."}
        </p>
      </div>

      {/* Caption */}
      <div style={{
        padding: "0.5rem 1.25rem 0.75rem",
        borderTop: "1px solid var(--rule)",
        background: "var(--surface)",
      }}>
        <p style={{
          fontSize: "11px",
          fontFamily: "'JetBrains Mono', monospace",
          color: "var(--ink-light)",
          margin: 0,
          fontStyle: "italic",
          lineHeight: 1.5,
        }}>
          Fig. 3 — Same model, same input, opposite rankings. The inversion is invisible to $/Mtok. Providers anonymised; three anchor points [MEASURED, THIRD PARTY] Artificial Analysis, July 12, 2026; twelve [SIM]. All figures public.
        </p>
      </div>
    </div>
  );
}
