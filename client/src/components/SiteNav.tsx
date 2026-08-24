// SiteNav — pi.website + Anthropic style
// Minimal: wordmark left, nav links right (desktop), hamburger (mobile)
// Monochromatic: no color, just black/grey/off-white
// Brand motif: meter tick marks in the wordmark

import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Download } from "lucide-react";
import { withBase } from "@/lib/asset";

const NAV_LINKS = [
  { label: "Abstract", href: "#abstract" },
  { label: "Exhibits", href: "#exhibits" },
  { label: "Predictions", href: "#the-predictions" },
  { label: "Appendix", href: "#appendix" },
];

// Meter mark motif — 5 calibration ticks with the middle one "missing" (amber)
function MeterMark() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        gap: "2px",
        marginRight: "8px",
        verticalAlign: "middle",
        position: "relative",
        top: "-1px",
      }}
    >
      {[6, 9, 12, 9, 6].map((h, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: "2px",
            height: `${h}px`,
            background: i === 2 ? "var(--amber)" : "var(--ink)",
            borderRadius: "1px",
            opacity: i === 2 ? 1 : 0.7,
          }}
        />
      ))}
    </span>
  );
}

export default function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-nav">
      <div className="nav-inner">
        {/* Wordmark with meter motif */}
        <Link
          href="/"
          className="wordmark"
          style={{ display: "flex", alignItems: "center" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <MeterMark />
          The Missing Meter
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
          className="hidden-mobile"
          aria-label="primary"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: "13px",
                color: "var(--ink-mid)",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-mid)")}
            >
              {link.label}
            </a>
          ))}
          <a
            href={withBase("downloads/The_Missing_Meter.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill"
            style={{ fontSize: "12px", padding: "0.3rem 0.85rem" }}
          >
            <Download size={11} />
            PDF
          </a>
        </nav>

        {/* Mobile hamburger — visible only on mobile */}
        <button
          className="visible-mobile"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-dropdown"
          style={{
            background: "none",
            border: "none",
            color: "var(--ink-mid)",
            padding: "0.25rem",
            cursor: "pointer",
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav
          id="mobile-nav-dropdown"
          aria-label="Mobile navigation"
          style={{
            borderTop: "1px solid var(--rule)",
            background: "var(--paper)",
            padding: "0.75rem 1.5rem 1.25rem",
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                fontSize: "15px",
                color: "var(--ink)",
                textDecoration: "none",
                padding: "0.55rem 0",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href={withBase("downloads/The_Missing_Meter.pdf")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "1rem",
              fontSize: "14px",
              color: "var(--ink)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <Download size={13} />
            Request PDF
          </a>
        </nav>
      )}
    </header>
  );
}
