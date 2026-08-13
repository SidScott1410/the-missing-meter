// MobileTOC — sticky collapsible table of contents for mobile
// Appears below the nav on mobile only (hidden on lg+)
// Shows the active section label when collapsed; expands to full list
// Active section tracked via IntersectionObserver (same logic as desktop TOC)

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const SECTIONS = [
  { id: "abstract", label: "Abstract" },
  { id: "section-1", label: "1. Two facts" },
  { id: "section-2", label: "2. The pattern" },
  { id: "section-3", label: "3. The bust that builds" },
  { id: "section-4", label: "4. Value migrates to the meter" },
  { id: "section-5", label: "5. The objection" },
  { id: "section-6", label: "6. The inheritance mechanism" },
  { id: "section-7", label: "7. Protocols arriving" },
  { id: "section-8", label: "8. The missing meter" },
  { id: "section-9", label: "9. What efficiency requires" },
  { id: "section-10", label: "10. Predictions" },
  { id: "section-11", label: "11. The implication" },
  { id: "closing", label: "Closing" },
  { id: "appendix", label: "Appendix A" },
  { id: "reproduce", label: "Reproduce" },
];

export default function MobileTOC() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("abstract");
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Detect when the bar becomes sticky (sentinel scrolls out of view)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  const activeLabel = SECTIONS.find((s) => s.id === active)?.label ?? "Contents";

  const handleLinkClick = (id: string) => {
    setOpen(false);
    // Small delay to let the drawer close before scrolling
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const offset = 96; // nav + mobile TOC bar height
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 80);
  };

  return (
    <>
      {/* Sentinel — sits just above the TOC bar in normal flow */}
      <div ref={sentinelRef} style={{ height: 1, marginTop: "-1px" }} aria-hidden />

      {/* The sticky bar — only visible on mobile (hidden on lg+) */}
      <div
        className="mobile-toc-bar"
        style={{
          boxShadow: stuck ? "0 1px 8px rgba(26,25,23,0.08)" : "none",
        }}
        aria-label="Table of contents"
      >
        {/* Collapsed trigger */}
        <button
          className="mobile-toc-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-toc-list"
        >
          <span className="mobile-toc-label">
            <span className="mobile-toc-eyebrow">Contents</span>
            <span className="mobile-toc-active">{activeLabel}</span>
          </span>
          <ChevronDown
            size={16}
            style={{
              color: "var(--ink-mid)",
              transition: "transform 220ms cubic-bezier(0.23,1,0.32,1)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              flexShrink: 0,
            }}
          />
        </button>

        {/* Expanded list */}
        <div
          id="mobile-toc-list"
          className="mobile-toc-list"
          style={{
            maxHeight: open ? `${SECTIONS.length * 44}px` : "0px",
          }}
          aria-hidden={!open}
        >
          <ol style={{ listStyle: "none", padding: "0.25rem 0 0.5rem", margin: 0 }}>
            {SECTIONS.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => handleLinkClick(id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      width: "100%",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      padding: "0.55rem 1.25rem",
                      fontSize: "13.5px",
                      fontFamily: "Inter, system-ui, sans-serif",
                      color: isActive ? "var(--ink)" : "var(--ink-mid)",
                      fontWeight: isActive ? 500 : 400,
                      cursor: "pointer",
                      transition: "color 120ms ease",
                    }}
                  >
                    {/* Active dot indicator */}
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: isActive ? "var(--amber)" : "transparent",
                        border: isActive ? "none" : "1.5px solid var(--ink-light)",
                        flexShrink: 0,
                        transition: "background 150ms ease, border-color 150ms ease",
                      }}
                    />
                    {label}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}
