/* ─── InfrastructureTable ─────────────────────────────────────────────────────
   The five-infrastructure pattern table from Section 2.
   Styled as a clean data table matching the Epoch AI aesthetic.
   Swipe indicator: a fade-right gradient + "swipe →" hint appears when the
   container is scrollable and disappears once the user has scrolled.
──────────────────────────────────────────────────────────────────────────── */

import { useRef, useState, useEffect } from "react";

const rows = [
  {
    infra: "Railways (UK)",
    frenzy: "263 railway acts in 1846; capital tripled in a decade",
    turning: "1847 crash; shares fell ~66%",
    unit: "ton-mile",
    coord: "Timetables, clearing houses",
    winner: "Industrial economy on cheap freight",
  },
  {
    infra: "Electricity",
    frenzy: "Competing plants, per-lamp pricing, ~6% utilization",
    turning: "Consolidation, 1900s",
    unit: "kilowatt-hour",
    coord: "Metering + load balancing",
    winner: "The utility model; price fell 20¢ to 2.5¢/kWh by 1909",
  },
  {
    infra: "Payments",
    frenzy: "1958 Fresno card drop; 22% delinquency; ~$20M fraud losses",
    turning: "1970: banks surrender the network",
    unit: "The cleared transaction (interchange)",
    coord: "Authorization + settlement (BASE I/II)",
    winner: "Visa: >50% net margins owning no cards, no banks",
  },
  {
    infra: "Container shipping",
    frenzy: "Incompatible boxes, port-by-port chaos",
    turning: "ISO standardization, 1968",
    unit: "TEU",
    coord: "Intermodal scheduling",
    winner: "Freight cost $5.86 to $0.16/ton; globalization",
  },
  {
    infra: "Internet",
    frenzy: "~$500B–$1T telecom capex; 80M miles of fiber",
    turning: "2000–02: NASDAQ −78%; >60 bankruptcies; ~95% of fiber dark",
    unit: "The metered Mbps, then the API call",
    coord: "TCP/IP, DNS, then virtualization and cloud",
    winner: "AWS, Google, streaming, on stranded fiber",
  },
];

const HEADERS = [
  "Infrastructure",
  "Installation frenzy",
  "Turning point",
  "Unit of account",
  "Coordination layer",
  "Deployment-era winner",
];

export default function InfrastructureTable() {
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
        <table className="data-table" style={{ minWidth: 680, width: "max-content" }}>
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.infra}>
                <td style={{ fontWeight: 600, whiteSpace: "nowrap", color: "var(--ink)" }}>
                  {row.infra}
                </td>
                <td>{row.frenzy}</td>
                <td>{row.turning}</td>
                <td style={{ fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>
                  {row.unit}
                </td>
                <td>{row.coord}</td>
                <td>{row.winner}</td>
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
        Table 1. Five infrastructure cycles compared. Each row follows the same four-phase arc: frenzy → turning point → standardized unit → value migration to coordination layer. Sources: railways [11]; electricity [12]; payments [13][14][15]; containers [16]; internet [17][18][19].
      </p>
    </div>
  );
}
