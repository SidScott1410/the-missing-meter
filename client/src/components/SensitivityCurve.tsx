// SensitivityCurve — A.7 sensitivity curve callout
// Two-dimensional SLO sweep: TPOT floor (tok/s) × TTFT bound (ms)
// Shows which providers remain compliant and how C changes across both axes.
// Design: monochromatic instrument aesthetic matching the rest of the appendix.

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// Provider dataset — anonymised Provider A–O
// ttft_ms: measured p99 TTFT in milliseconds (approximate from paper Table 2)
const PROVIDERS = [
  { name: "Provider A",  pricePerMtok: 0.12, tps: 15.2,  ttft_ms: 2800, color: "#c8b89a" },
  { name: "Provider B",  pricePerMtok: 0.18, tps: 62.4,  ttft_ms: 1850, color: "#b0a090" },
  { name: "Provider C",  pricePerMtok: 0.20, tps: 48.3,  ttft_ms: 2100, color: "#a89880" },
  { name: "Provider D",  pricePerMtok: 0.24, tps: 38.9,  ttft_ms: 1650, color: "#a09070" },
  { name: "Provider E",  pricePerMtok: 0.28, tps: 55.7,  ttft_ms: 1420, color: "#9a8878" },
  { name: "Provider F",  pricePerMtok: 0.32, tps: 61.2,  ttft_ms: 1200, color: "#908070" },
  { name: "Provider G",  pricePerMtok: 0.40, tps: 72.1,  ttft_ms: 980,  color: "#887060" },
  { name: "Provider H",  pricePerMtok: 0.44, tps: 68.5,  ttft_ms: 1100, color: "#806858" },
  { name: "Provider I",  pricePerMtok: 0.52, tps: 84.3,  ttft_ms: 860,  color: "#786050" },
  { name: "Provider J",  pricePerMtok: 0.58, tps: 91.2,  ttft_ms: 780,  color: "#706050" },
  { name: "Provider K",  pricePerMtok: 0.64, tps: 120.5, ttft_ms: 640,  color: "#585040" },
  { name: "Provider L",  pricePerMtok: 0.72, tps: 108.4, ttft_ms: 720,  color: "#504838" },
  { name: "Provider M",  pricePerMtok: 0.80, tps: 145.2, ttft_ms: 520,  color: "#484030" },
  { name: "Provider N",  pricePerMtok: 0.64, tps: 329.6, ttft_ms: 310,  color: "#d4a017" }, // fastest — amber
  { name: "Provider O",  pricePerMtok: 1.05, tps: 88.1,  ttft_ms: 890,  color: "#404030" },
];

// Generate sweep data along the TPOT axis, filtered by TTFT bound
function generateSweepData(ttftBoundMs: number, steps = 60) {
  const maxTps = 350;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const threshold = (i / steps) * maxTps;
    const point: Record<string, number | null> = { threshold: Math.round(threshold) };
    for (const p of PROVIDERS) {
      const tpotOk = p.tps >= threshold;
      const ttftOk = p.ttft_ms <= ttftBoundMs;
      point[p.name] = (tpotOk && ttftOk) ? p.pricePerMtok : null;
    }
    return point;
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const compliant = payload.filter((p: any) => p.value !== null);
  return (
    <div style={{
      background: "#1a1917",
      borderRadius: 6,
      padding: "0.65rem 0.9rem",
      fontSize: "11.5px",
      color: "#f5f2ee",
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      fontFamily: "'JetBrains Mono', monospace",
      minWidth: 180,
    }}>
      <div style={{ fontWeight: 600, marginBottom: "0.4rem", color: "#d4a017", fontSize: "11px", letterSpacing: "0.06em" }}>
        TPOT floor: {label} tok/s
      </div>
      {compliant.length === 0 ? (
        <div style={{ color: "#a8a49e" }}>No compliant providers</div>
      ) : (
        compliant.map((p: any) => (
          <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.15rem" }}>
            <span style={{ color: "#a8a49e" }}>{p.dataKey}</span>
            <span style={{ color: p.color }}>${p.value.toFixed(2)}/Mtok</span>
          </div>
        ))
      )}
    </div>
  );
};

export default function SensitivityCurve() {
  const [tpotFloor, setTpotFloor] = useState(100);
  const [ttftBound, setTtftBound] = useState(1000); // ms

  const sweepData = useMemo(() => generateSweepData(ttftBound), [ttftBound]);

  const compliantAtSlo = useMemo(
    () => PROVIDERS.filter((p) => p.tps >= tpotFloor && p.ttft_ms <= ttftBound),
    [tpotFloor, ttftBound]
  );
  const cheapest = compliantAtSlo.length > 0
    ? compliantAtSlo.reduce((a, b) => a.pricePerMtok < b.pricePerMtok ? a : b)
    : null;

  return (
    <div style={{
      margin: "1.5rem 0",
      border: "1px solid var(--rule)",
      borderRadius: 8,
      overflow: "hidden",
      background: "var(--surface)",
    }}>
      {/* Header */}
      <div style={{
        padding: "0.85rem 1.25rem 0.75rem",
        borderBottom: "1px solid var(--rule)",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}>
        <div>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--amber-dark)",
            fontFamily: "Inter, sans-serif",
          }}>
            A.7 Sensitivity curve
          </span>
          <p style={{ margin: "0.2rem 0 0", fontSize: "12px", color: "var(--ink-mid)", fontFamily: "Inter, sans-serif" }}>
            Sweep both SLO bounds — watch which providers drop out and how C changes
          </p>
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          color: "var(--ink-light)",
          background: "var(--surface-dark, #e8e4df)",
          borderRadius: 4,
          padding: "0.2rem 0.6rem",
        }}>
          {compliantAtSlo.length} / {PROVIDERS.length} compliant
        </div>
      </div>

      {/* Two sliders */}
      <div style={{ padding: "1rem 1.25rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {/* TPOT slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ fontSize: "11.5px", color: "var(--ink-mid)", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap", minWidth: "6rem" }}>
            TPOT floor:
          </label>
          <input
            type="range"
            min={0}
            max={350}
            step={5}
            value={tpotFloor}
            onChange={(e) => setTpotFloor(Number(e.target.value))}
            style={{ flex: 1, minWidth: 120, accentColor: "var(--amber-dark, #b8860b)", cursor: "pointer" }}
          />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--ink)",
            minWidth: "6.5ch",
            textAlign: "right",
          }}>
            {tpotFloor} tok/s
          </span>
        </div>

        {/* TTFT slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ fontSize: "11.5px", color: "var(--ink-mid)", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap", minWidth: "6rem" }}>
            TTFT bound:
          </label>
          <input
            type="range"
            min={200}
            max={3000}
            step={50}
            value={ttftBound}
            onChange={(e) => setTtftBound(Number(e.target.value))}
            style={{ flex: 1, minWidth: 120, accentColor: "#6b8cba", cursor: "pointer" }}
          />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--ink)",
            minWidth: "6.5ch",
            textAlign: "right",
          }}>
            {ttftBound >= 1000 ? `${(ttftBound / 1000).toFixed(1)} s` : `${ttftBound} ms`}
          </span>
        </div>
      </div>

      {/* TTFT filter note */}
      {(() => {
        const ttftDropped = PROVIDERS.filter(p => p.ttft_ms > ttftBound);
        return ttftDropped.length > 0 ? (
          <div style={{
            margin: "0 1.25rem 0.25rem",
            padding: "0.4rem 0.75rem",
            background: "rgba(107, 140, 186, 0.08)",
            borderRadius: 4,
            borderLeft: "2px solid #6b8cba",
            fontSize: "11px",
            color: "var(--ink-mid)",
            fontFamily: "Inter, sans-serif",
          }}>
            TTFT filter removes {ttftDropped.length} provider{ttftDropped.length > 1 ? "s" : ""} before TPOT sweep:{" "}
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--ink-light)" }}>
              {ttftDropped.map(p => p.name).join(", ")}
            </span>
          </div>
        ) : null;
      })()}

      {/* Chart */}
      <div style={{ padding: "0 0.5rem 0.5rem" }}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={sweepData} margin={{ top: 10, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--rule, #ddd)" />
            <XAxis
              dataKey="threshold"
              tick={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fill: "var(--ink-light, #888)" }}
              label={{ value: "TPOT floor (tok/s)", position: "insideBottom", offset: -2, fontSize: 10, fill: "var(--ink-light, #888)", fontFamily: "Inter, sans-serif" }}
              height={36}
            />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              tick={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fill: "var(--ink-light, #888)" }}
              domain={[0, 1.15]}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={tpotFloor}
              stroke="var(--amber-dark, #b8860b)"
              strokeWidth={2}
              strokeDasharray="4 2"
              label={{ value: `← ${tpotFloor}`, position: "top", fontSize: 10, fill: "var(--amber-dark, #b8860b)", fontFamily: "'JetBrains Mono', monospace" }}
            />
            {PROVIDERS.map((p) => (
              <Line
                key={p.name}
                type="stepAfter"
                dataKey={p.name}
                stroke={p.color}
                strokeWidth={p.name === "Provider N" ? 2 : 1.5}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Live readout */}
      <div style={{
        padding: "0.75rem 1.25rem",
        borderTop: "1px solid var(--rule)",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
        background: "var(--paper)",
      }}>
        {cheapest ? (
          <>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--ink-mid)" }}>
              Cheapest compliant at {tpotFloor} tok/s TPOT, {ttftBound >= 1000 ? `${(ttftBound / 1000).toFixed(1)} s` : `${ttftBound} ms`} TTFT:
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 600, color: "var(--amber-dark)" }}>
              {cheapest.name} — ${cheapest.pricePerMtok.toFixed(2)}/Mtok
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "11.5px", color: "var(--ink-light)" }}>
              ({cheapest.tps} tok/s · {cheapest.ttft_ms} ms TTFT)
            </div>
          </>
        ) : (
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "var(--ink-light)", fontStyle: "italic" }}>
            No provider meets this SLO — C is undefined for all placements at these bounds.
          </div>
        )}
      </div>
    </div>
  );
}
