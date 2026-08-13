// InSectionTOC — "In this section:" sub-table-of-contents
// Mirrors situational-awareness.ai's "In this piece:" device
// Appears at the top of longer named sections
// Design: minimal, monochromatic, left-aligned, keyboard navigable

interface InSectionTOCProps {
  items: { id: string; label: string }[];
}

export default function InSectionTOC({ items }: InSectionTOCProps) {
  function handleClick(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 110; // SiteNav + SectionNav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <nav
      aria-label="In this section"
      style={{
        margin: "1.5rem 0 2rem",
        padding: "1rem 1.25rem",
        background: "var(--surface)",
        borderLeft: "2px solid var(--amber)",
        borderRadius: "0 4px 4px 0",
      }}
    >
      <p style={{
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ink-mid)",
        margin: "0 0 0.6rem",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        In this section:
      </p>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {items.map(({ id, label }) => (
          <li key={id}>
            <button
              onClick={() => handleClick(id)}
              style={{
                background: "none",
                border: "none",
                padding: "0.1rem 0",
                fontSize: "13.5px",
                fontFamily: "Inter, system-ui, sans-serif",
                color: "var(--ink-mid)",
                cursor: "pointer",
                textAlign: "left",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                textDecorationColor: "var(--rule)",
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-mid)"; }}
            >
              {label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
