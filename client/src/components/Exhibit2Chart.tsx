// Exhibit2Chart — Unit cost indexed to turning point, log scale
// Monochromatic: black/grey series, animated draw-in on scroll

import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function buildData() {
  const maxYear = 30;
  const map: Record<number, any> = {};
  for (let y = 0; y <= maxYear; y++) map[y] = { year: y };
  // Rail: 3.1%/yr over 30 yrs
  for (let y = 0; y <= 30; y++) map[y].rail = +(100 * Math.pow(1 - 0.031, y)).toFixed(1);
  // Electricity: 11.5%/yr over 17 yrs
  for (let y = 0; y <= 17; y++) map[y].electricity = +(100 * Math.pow(1 - 0.115, y)).toFixed(1);
  // Internet: 35.9%/yr over 17 yrs
  for (let y = 0; y <= 17; y++) map[y].internet = +(100 * Math.pow(1 - 0.359, y)).toFixed(1);
  // AI inference: 94.8%/yr — 3 data points
  [{ y: 0, v: 100 }, { y: 1, v: 5.2 }, { y: 2, v: 0.27 }].forEach(({ y, v }) => (map[y].ai = v));
  return Object.values(map);
}

const chartData = buildData();

const SERIES = [
  { key: "rail",        label: "Rail freight (3.1%/yr)",       color: "#c8c4be", width: 1.5 },
  { key: "electricity", label: "Electricity (11.5%/yr)",       color: "#a8a49e", width: 1.5 },
  { key: "internet",    label: "Internet transit (35.9%/yr)",  color: "#6b6860", width: 2 },
  { key: "ai",          label: "AI inference (94.8%/yr)",      color: "#c8a84b", width: 3 },
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
        <div style={{ fontWeight: 600, marginBottom: "0.3rem" }}>Year {label} from turning point</div>
        {payload.filter((p: any) => p.value != null).map((p: any) => (
          <div key={p.name} style={{ color: "#a8a49e", marginBottom: "0.15rem" }}>
            <span style={{ color: "#f5f2ee" }}>{SERIES.find(s => s.key === p.name)?.label}: </span>
            {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Exhibit2Chart() {
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
    <div ref={ref} className={`chart-block fade-up${visible ? " visible" : ""}`}>
      <div className="chart-title">Exhibit 2 — Unit Cost Indexed to Turning Point (Log Scale)</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dedad4" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "#6b6860", fontFamily: "Inter, sans-serif" }}
            axisLine={false}
            tickLine={false}
            label={{ value: "Years from turning point", position: "insideBottom", offset: -12, style: { fontSize: 10, fill: "#a8a49e", fontFamily: "Inter, sans-serif" } }}
          />
          <YAxis
            scale="log"
            domain={[0.1, 110]}
            ticks={[0.1, 1, 10, 100]}
            tick={{ fontSize: 11, fill: "#6b6860", fontFamily: "Inter, sans-serif" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#6b6860", fontFamily: "Inter, sans-serif", paddingTop: "0.5rem" }}
            formatter={(value) => SERIES.find(s => s.key === value)?.label ?? value}
          />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={s.width}
              dot={false}
              connectNulls={false}
              isAnimationActive={visible}
              animationDuration={1000 + SERIES.indexOf(s) * 200}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
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
        Unit cost indexed to 100 at each infrastructure turning point. AI inference decline (94.8%/yr) is the steepest
        in recorded infrastructure history. Sources: Stanford AI Index (2025); Crafts (2004); Joskow (1997); Levinson (2006); Historical Statistics of the United States; Norton / DrPeering.
      </p>
    </div>
  );
}
