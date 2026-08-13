// Exhibit1Chart — Capex vs Inference Cost
// Monochromatic: near-black bars, grey line
// Animated draw-in on scroll entry, hover tooltips

import { useEffect, useRef, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DATA = [
  { year: "2022", capex: 150, cost: 20.0 },
  { year: "2023", capex: 150, cost: 4.0 },
  { year: "2024", capex: 228, cost: 0.07 },
  { year: "2025E", capex: 410, cost: 0.025 },
  { year: "2026E", capex: 725, cost: 0.007 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1a1917",
        borderRadius: 6,
        padding: "0.6rem 0.9rem",
        fontSize: "12px",
        color: "#f5f2ee",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      }}>
        <div style={{ fontWeight: 600, marginBottom: "0.3rem", color: "#e8e4df" }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ marginBottom: "0.15rem", color: "#a8a49e" }}>
            <span style={{ color: "#f5f2ee" }}>
              {p.name === "capex" ? "Capex: " : "Inference Cost: "}
            </span>
            {p.name === "capex" ? `$${p.value}B` : `$${p.value}/Mtok`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Exhibit1Chart() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`chart-block fade-up${visible ? " visible" : ""}`} id="exhibits">
      <div className="chart-title">Exhibit 1 — Hyperscaler Capex vs. Inference Cost</div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dedad4" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "#6b6860", fontFamily: "Inter, sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            scale="log"
            domain={[100, 1000]}
            ticks={[100, 200, 400, 800]}
            tick={{ fontSize: 11, fill: "#6b6860", fontFamily: "Inter, sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}B`}
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            scale="log"
            domain={[0.001, 100]}
            ticks={[0.01, 0.1, 1, 10]}
            tick={{ fontSize: 11, fill: "#6b6860", fontFamily: "Inter, sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(26,25,23,0.04)" }} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#6b6860", fontFamily: "Inter, sans-serif", paddingTop: "0.5rem" }}
            formatter={(value) => value === "capex" ? "Capex ($B, log scale)" : "Inference cost $/Mtok (log scale)"}
          />
          <Bar
            yAxisId="left"
            dataKey="capex"
            name="capex"
            fill="#1a1917"
            radius={[2, 2, 0, 0]}
            isAnimationActive={visible}
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cost"
            name="cost"
            stroke="#c8a84b"
            strokeWidth={2.5}
            dot={{ fill: "#c8a84b", r: 3.5, strokeWidth: 0 }}
            isAnimationActive={visible}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <p style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        fontSize: "11.5px",
        fontStyle: "italic",
        color: "var(--ink-mid)",
        lineHeight: 1.55,
        marginTop: "0.75rem",
        marginBottom: 0,
      }}>
        Combined hyperscaler capex (Microsoft, Google, Amazon, Meta) vs. inference cost per million tokens
        at GPT-3.5 capability, log scale. Sources: Company filings; Artificial Analysis (2025); author estimates.
      </p>
    </div>
  );
}
