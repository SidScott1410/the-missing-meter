// TypewriterCostLog — pi.website "textual memory" style
// Mobile-first: stacked two-line cards instead of a three-column grid
// Triggers on scroll entry

import { useEffect, useRef, useState } from "react";

interface LogLine {
  label: string;
  value: string;
  note: string;
  type?: "header" | "separator" | "normal" | "ai" | "total";
}

const LINES: LogLine[] = [
  { label: "INFRASTRUCTURE", value: "UNIT", note: "COST AT TURNING POINT", type: "header" },
  { label: "", value: "", note: "", type: "separator" },
  { label: "Railway (1850s UK)", value: "£0.005 / ton-mile", note: "indexed → 1.00", type: "normal" },
  { label: "Electricity (1900s US)", value: "$0.22 / kWh", note: "indexed → 1.00", type: "normal" },
  { label: "Telephony (1920s US)", value: "$0.70 / min-mile", note: "indexed → 1.00", type: "normal" },
  { label: "Internet (1995 US)", value: "$1.20 / Mbps-mo", note: "indexed → 1.00", type: "normal" },
  { label: "", value: "", note: "", type: "separator" },
  { label: "AI Inference (2022)", value: "$0.060 / 1K tokens", note: "indexed → 1.00", type: "ai" },
  { label: "AI Inference (2023)", value: "$0.020 / 1K tokens", note: "indexed → 0.33", type: "ai" },
  { label: "AI Inference (2024)", value: "$0.0008 / 1K tokens", note: "indexed → 0.013", type: "ai" },
  { label: "AI Inference (2025)", value: "$0.00021 / 1K tokens", note: "indexed → 0.0035", type: "ai" },
  { label: "", value: "", note: "", type: "separator" },
  { label: "TOTAL DECLINE (2022–2024)", value: "280× in 23 months", note: "⚡ fastest in history", type: "total" },
];

export default function TypewriterCostLog() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    setVisibleLines(0);
    let count = 0;
    intervalRef.current = setInterval(() => {
      count++;
      setVisibleLines(count);
      if (count >= LINES.length && intervalRef.current) clearInterval(intervalRef.current);
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [started]);

  return (
    <div className="typewriter-block" ref={ref} style={{ overflowX: "hidden" }}>
      <div className="tw-label">UNIT COST LOG — INFRASTRUCTURE TURNING POINTS</div>

      {LINES.slice(0, visibleLines).map((line, i) => {
        if (line.type === "separator") {
          return (
            <div key={i} style={{
              height: "1px",
              background: "#3a3835",
              margin: "6px 0",
            }} />
          );
        }

        if (line.type === "header") {
          return (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "0.5rem",
              marginBottom: "4px",
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#6b6860" }}>
                {line.label}
              </span>
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#6b6860", marginLeft: "auto" }}>
                {line.note}
              </span>
            </div>
          );
        }

        const isTotal = line.type === "total";
        const isAI = line.type === "ai";
        const labelColor = isTotal ? "#c8a84b" : isAI ? "#e8d89a" : "#e8e4df";
        const valueColor = isTotal ? "#c8a84b" : isAI ? "#e8d89a" : "#c8c4be";
        const noteColor  = isTotal ? "#c8a84b" : isAI ? "#a89040" : "#6b6860";

        return (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "0.5rem",
            lineHeight: "1.65",
            marginBottom: "1px",
            flexWrap: "wrap",
          }}>
            {/* Label — left */}
            <span style={{
              color: labelColor,
              fontWeight: isTotal ? 600 : 400,
              fontSize: "12.5px",
              flexShrink: 0,
              minWidth: 0,
            }}>
              {line.label}
            </span>

            {/* Value + note — right, stacked on very small screens */}
            <span style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "baseline",
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}>
              <span style={{ color: valueColor, fontWeight: isTotal ? 600 : 400, fontSize: "12.5px", whiteSpace: "nowrap" }}>
                {line.value}
              </span>
              <span style={{ color: noteColor, fontSize: "11px", whiteSpace: "nowrap" }}>
                {line.note}
              </span>
            </span>
          </div>
        );
      })}

      {visibleLines < LINES.length && <span className="tw-cursor" />}
    </div>
  );
}
