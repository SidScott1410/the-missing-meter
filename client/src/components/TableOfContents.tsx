// TableOfContents — monochromatic sticky left-rail
// Black active indicator, grey inactive, no color accents

import { useState, useEffect } from "react";

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

export default function TableOfContents() {
  const [active, setActive] = useState<string>("abstract");

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

  return (
    <nav aria-label="Table of contents" className="toc-sidebar">
      <div className="toc-title">Contents</div>
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={isActive ? "active" : ""}
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: isActive ? "var(--ink)" : "var(--ink-mid)",
                  textDecoration: "none",
                  padding: "0.28rem 0 0.28rem 0.75rem",
                  borderLeft: isActive ? "2px solid var(--amber)" : "2px solid transparent",
                  fontWeight: isActive ? 500 : 400,
                  lineHeight: 1.4,
                  transition: "color 150ms ease, border-color 150ms ease",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "var(--ink)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--ink-mid)"; }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
