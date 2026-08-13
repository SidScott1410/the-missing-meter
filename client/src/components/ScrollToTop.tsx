// ScrollToTop — floating "↑" button that appears after scrolling 600px
// Visible on all viewports, especially useful on mobile for long pages.
// Design: monochromatic, amber on hover, snappy scale animation.

import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.25rem",
        zIndex: 40,
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "1px solid var(--rule)",
        background: "var(--paper)",
        color: "var(--ink-mid)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.95)",
        transition: "opacity 220ms cubic-bezier(0.23,1,0.32,1), transform 220ms cubic-bezier(0.23,1,0.32,1), color 120ms ease, border-color 120ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--amber-dark, #b8860b)";
        e.currentTarget.style.borderColor = "var(--amber-dark, #b8860b)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--ink-mid)";
        e.currentTarget.style.borderColor = "var(--rule)";
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(0) scale(0.93)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
