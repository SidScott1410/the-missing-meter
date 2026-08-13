// SectionNav — persistent named-section navigator
// Shows 6 named sections + Reproduce; highlights active section
// Sits below the SiteNav, sticky on scroll; keyboard navigable
// Design: pi.website editorial — monochromatic, amber active indicator

import { useState, useEffect } from "react";

export const NAMED_SECTIONS = [
  { id: "the-scissors",    label: "Two facts"        },
  { id: "six-claims",      label: "Six claims"       },
  { id: "the-pattern",     label: "The pattern"      },
  { id: "the-unit",        label: "The served token" },
  { id: "the-objections",  label: "Objections"       },
  { id: "the-predictions", label: "Predictions"      },
  { id: "reproduce",       label: "Reproduce"        },
];

export default function SectionNav() {
  const [active, setActive] = useState<string>("");
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    NAMED_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Detect sticky state via a sentinel element
  useEffect(() => {
    const sentinel = document.getElementById("section-nav-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  function handleClick(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 100; // nav + section-nav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <>
      <div id="section-nav-sentinel" style={{ height: 1 }} aria-hidden />
      <nav
        aria-label="Sections"
        style={{
          position: "sticky",
          top: 52, // 52px SiteNav height
          zIndex: 40,
          background: "var(--paper)",
          borderBottom: "1px solid var(--rule)",
          boxShadow: stuck ? "0 1px 8px rgba(26,25,23,0.07)" : "none",
          transition: "box-shadow 200ms ease",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            gap: 0,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {NAMED_SECTIONS.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => handleClick(id)}
                aria-current={isActive ? "location" : undefined}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: isActive
                    ? "2px solid var(--amber)"
                    : "2px solid transparent",
                  padding: "0.65rem 1rem",
                  fontSize: "12.5px",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--ink)" : "var(--ink-mid)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 150ms ease, border-color 150ms ease",
                  letterSpacing: isActive ? "0.01em" : "0",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--ink)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--ink-mid)";
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
