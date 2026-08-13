// PredictionCard — pi.website numbered input-card style
// Amber numbered badge, hover/focus reveals falsification condition
// Active left-border amber accent on hover

import { useState } from "react";

interface PredictionCardProps {
  number: string;
  title: string;
  deadline: string;
  body: string;
  killCriterion?: string;
}

export default function PredictionCard({ number, title, deadline, body, killCriterion }: PredictionCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      style={{
        position: "relative",
        border: "1px solid var(--rule)",
        borderLeft: hovered ? "3px solid var(--amber)" : "3px solid transparent",
        borderRadius: 4,
        background: hovered ? "#faf8f4" : "var(--paper)",
        padding: "1rem 1.1rem 1rem 1.1rem",
        cursor: "default",
        transition: "border-left-color 180ms ease, background 180ms ease, box-shadow 180ms ease",
        boxShadow: hovered ? "0 2px 12px rgba(26,25,23,0.06)" : "0 1px 3px rgba(26,25,23,0.03)",
        outline: "none",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem", marginBottom: "0.45rem" }}>
        {/* Amber numbered badge */}
        <div
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: 3,
            background: "var(--amber)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            color: "#fff",
            marginTop: "1px",
          }}
        >
          {number}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "13.5px",
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 600,
                color: "var(--ink)",
                lineHeight: 1.3,
              }}
            >
              {title}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 500,
                color: "var(--amber-dark)",
                background: "var(--amber-bg)",
                padding: "1px 6px",
                borderRadius: 2,
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
              }}
            >
              {deadline}
            </span>
          </div>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          paddingLeft: "2.4rem",
          fontSize: "12.5px",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "var(--ink-mid)",
          lineHeight: 1.65,
        }}
      >
        {body}
      </p>

      {/* Falsification condition — revealed on hover */}
      {killCriterion && (
        <div
          style={{
            overflow: "hidden",
            maxHeight: hovered ? "120px" : "0px",
            opacity: hovered ? 1 : 0,
            transition: "max-height 260ms cubic-bezier(0.23,1,0.32,1), opacity 200ms ease",
            marginTop: hovered ? "0.7rem" : 0,
            paddingLeft: "2.4rem",
          }}
        >
          <div
            style={{
              borderTop: "1px solid var(--rule)",
              paddingTop: "0.6rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--ink-light)",
                whiteSpace: "nowrap",
                marginTop: "2px",
                flexShrink: 0,
              }}
            >
              Falsified if
            </span>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Inter, system-ui, sans-serif",
                fontStyle: "italic",
                color: "var(--ink-mid)",
                lineHeight: 1.55,
              }}
            >
              {killCriterion}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
