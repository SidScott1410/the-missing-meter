/* ─── DepreciationTable ───────────────────────────────────────────────────────
   Hyperscaler depreciation schedules table from Prediction 3 / Section 10.
   Swipe indicator: fade-right gradient + "swipe →" hint on mobile.
──────────────────────────────────────────────────────────────────────────── */

import { useRef, useState, useEffect } from "react";

const rows = [
  {
    company: "Amazon",
    life: "5 yrs (subset; rest 6)",
    change: "Jan 2025",
    direction: "Shortened, 6→5, citing AI",
    impact: "−$0.7B 2025 op. income, plus $920M accelerated depreciation",
    shortened: true,
  },
  {
    company: "Alphabet",
    life: "6 yrs",
    change: "Jan 2023",
    direction: "Extended",
    impact: "+$3.9B lower 2023 depreciation",
    shortened: false,
  },
  {
    company: "Microsoft",
    life: "6 yrs",
    change: "FY2023",
    direction: "Extended",
    impact: "~$3.7B FY2023 benefit",
    shortened: false,
  },
  {
    company: "Meta",
    life: "5 to 5.5 yrs",
    change: "Jan 2025",
    direction: "Extended",
    impact: "−$2.9B 2025 depreciation expense",
    shortened: false,
  },
  {
    company: "Oracle",
    life: "6 yrs",
    change: "FY2025",
    direction: "Extended",
    impact: "+$573M FY2025 net income",
    shortened: false,
  },
];

export default function DepreciationTable() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <div style={{ margin: "1.5rem 0", maxWidth: "100%", position: "relative" }}>
      {/* Swipe-right fade gradient + label */}
      {canScrollRight && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 72,
            pointerEvents: "none",
            zIndex: 2,
            background: "linear-gradient(to right, transparent, var(--paper) 85%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: "0.5rem",
          }}
        >
          <span style={{
            fontSize: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "var(--amber-dark)",
            letterSpacing: "0.04em",
            fontWeight: 600,
            userSelect: "none",
            whiteSpace: "nowrap",
          }}>
            swipe →
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
      >
        <table className="data-table" style={{ minWidth: 560, width: "max-content" }}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Server/network useful life</th>
              <th>Last change</th>
              <th>Direction</th>
              <th>Disclosed impact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.company}>
                <td style={{ fontWeight: 600, color: "var(--ink)" }}>{row.company}</td>
                <td>{row.life}</td>
                <td style={{ whiteSpace: "nowrap" }}>{row.change}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "1px 8px",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: row.shortened ? "var(--ink)" : "var(--surface)",
                      color: row.shortened ? "var(--paper)" : "var(--ink-mid)",
                    }}
                  >
                    {row.direction}
                  </span>
                </td>
                <td style={{ color: "var(--ink-mid)" }}>{row.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          fontSize: "11.5px",
          fontStyle: "italic",
          color: "var(--ink-mid)",
          lineHeight: 1.55,
          marginTop: "0.75rem",
          marginBottom: 0,
        }}
      >
        Table 2. Hyperscaler depreciation schedules. Only Amazon has shortened useful lives, citing AI; the other four most recently extended them. Source: property and equipment notes, most recent Form 10-K filings, SEC EDGAR [63].
      </p>
    </div>
  );
}
