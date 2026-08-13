// HeroVisualBlock — full-width annotated chart block for the hero section
// pi.website style: white card on off-white background, dotted-grid texture,
// large annotated chart with callout labels, monospace italic caption
// Palette: --paper, --ink, --ink-mid, --ink-light, --rule, --surface, --amber

import { useEffect, useRef, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";

const DATA = [
  { year: "2021", capex: 100, cost: 100 },
  { year: "2022", capex: 148, cost: 100 },
  { year: "2023", capex: 210, cost: 33 },
  { year: "2024", capex: 320, cost: 3.6 },
  { year: "2025", capex: 480, cost: 0.75 },
  { year: "2026E", capex: 725, cost: 0.36 },
];

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--ink)",
      color: "var(--paper)",
      padding: "0.6rem 0.9rem",
      borderRadius: 6,
      fontSize: "12px",
      fontFamily: "Inter, system-ui, sans-serif",
      lineHeight: 1.6,
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color === "#1a1917" ? "var(--paper)" : p.color }}>
          {p.name === "capex" ? `Capex: $${p.value}B` : `Inference cost: ${p.value}× (indexed)`}
        </div>
      ))}
    </div>
  );
}

export default function HeroVisualBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        margin: "2.5rem 0 0",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 600ms cubic-bezier(0.23,1,0.32,1), transform 600ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Eyebrow */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "0.6rem",
      }}>
        <span style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-mid)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
          Exhibit 1
        </span>
        <div style={{ flex: 1, height: "1px", background: "var(--rule)" }} />
        <span style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-mid)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}>
          The paradox in one chart
        </span>
      </div>

      {/* Chart card — white on off-white, dotted grid */}
      <div style={{
        background: "white",
        border: "1px solid var(--rule)",
        borderRadius: "10px",
        padding: "1.5rem 1.5rem 1rem",
        backgroundImage: "radial-gradient(circle, var(--rule) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* White overlay to soften the grid behind the chart */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.82)",
          borderRadius: "10px",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Annotation callouts */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: 20, height: 10, background: "#1a1917", borderRadius: 2 }} />
              <span style={{ fontSize: "11.5px", fontFamily: "Inter, system-ui, sans-serif", color: "var(--ink-mid)" }}>
                Hyperscaler capex ($B, indexed 2021=100)
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: 20, height: 2, background: "var(--amber)", borderRadius: 1 }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)" }} />
              <span style={{ fontSize: "11.5px", fontFamily: "Inter, system-ui, sans-serif", color: "var(--ink-mid)" }}>
                Inference cost (indexed 2022=100, log scale)
              </span>
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={DATA} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fontFamily: "Inter, system-ui, sans-serif", fill: "var(--ink-mid)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="capex"
                  orientation="left"
                  tick={{ fontSize: 10, fontFamily: "Inter, system-ui, sans-serif", fill: "var(--ink-mid)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}B`}
                />
                <YAxis
                  yAxisId="cost"
                  orientation="right"
                  scale="log"
                  domain={[0.1, 200]}
                  tick={{ fontSize: 10, fontFamily: "Inter, system-ui, sans-serif", fill: "var(--amber)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}×`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  yAxisId="capex"
                  x="2022"
                  stroke="var(--rule)"
                  strokeDasharray="4 4"
                >
                  <Label
                    value="Turning point"
                    position="insideTopLeft"
                    style={{ fontSize: 9, fill: "var(--ink-light)", fontFamily: "Inter, system-ui, sans-serif" }}
                  />
                </ReferenceLine>
                <Bar yAxisId="capex" dataKey="capex" fill="#1a1917" radius={[2, 2, 0, 0]} maxBarSize={40} />
                <Line
                  yAxisId="cost"
                  type="monotone"
                  dataKey="cost"
                  stroke="var(--amber)"
                  strokeWidth={2}
                  dot={{ fill: "var(--amber)", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "var(--amber)" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Annotation strip */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--rule)",
          }}>
            <div>
              <div style={{ fontSize: "18px", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, color: "var(--ink)", lineHeight: 1 }}>
                $725B
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-mid)", fontFamily: "Inter, system-ui, sans-serif", marginTop: "2px" }}>
                combined capex guided for 2026
              </div>
            </div>
            <div>
              <div style={{ fontSize: "18px", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, color: "var(--amber)", lineHeight: 1 }}>
                280×
              </div>
              <div style={{ fontSize: "11px", color: "var(--ink-mid)", fontFamily: "Inter, system-ui, sans-serif", marginTop: "2px" }}>
                cost decline in under two years — fastest in history
              </div>
            </div>
          </div>
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
        Record physical investment and collapsing unit economics, occurring simultaneously, is not a contradiction.
        It is the signature of a turning point that every general-purpose infrastructure has crossed.
      </p>
    </div>
  );
}
