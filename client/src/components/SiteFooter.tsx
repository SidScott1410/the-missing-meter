// SiteFooter — minimal, monochromatic (pi.website style)
// Meter-tick brand motif, light background, thin rule, wordmark, legal line

export default function SiteFooter() {
  return (
    <footer role="contentinfo" style={{
      borderTop: "1px solid var(--rule)",
      padding: "3rem 2rem 2.5rem",
      maxWidth: 1200,
      margin: "4rem auto 0",
    }}>
      {/* Meter calibration strip — brand motif */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "3px",
        marginBottom: "2rem",
      }}>
        {[3, 6, 10, 6, 3, 6, 10, 6, 3, 6, 10, 6, 3, 6, 10, 6, 3, 6, 10, 6, 3].map((h, i) => (
          <span key={i} style={{
            display: "inline-block",
            width: "2px",
            height: `${h}px`,
            background: i === 10 ? "var(--amber)" : "var(--rule)",
            borderRadius: "1px",
            flexShrink: 0,
          }} />
        ))}
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "1.5rem",
      }}>
        {/* Left: wordmark + tagline */}
        <div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 400,
            fontSize: "15px",
            color: "var(--ink)",
            marginBottom: "0.4rem",
            letterSpacing: "-0.01em",
          }}>
            The Missing Meter
          </div>
          <div style={{ fontSize: "12px", color: "var(--ink-mid)", lineHeight: 1.5, maxWidth: "24ch" }}>
            A paper on the unit AI still lacks.
          </div>
        </div>

        {/* Right: links */}
        <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.6rem" }}>Paper</div>
            {[
              { label: "Abstract", href: "#abstract" },
              { label: "Exhibits", href: "#exhibits" },
              { label: "Predictions", href: "#predictions" },
              { label: "Appendix", href: "#appendix" },
            ].map((l) => (
              <a key={l.label} href={l.href} style={{ display: "block", fontSize: "13px", color: "var(--ink-mid)", textDecoration: "none", marginBottom: "0.3rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-mid)")}
              >{l.label}</a>
            ))}
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.6rem" }}>Resources</div>
            {[
              { label: "Download PDF", href: "/downloads/The_Missing_Meter.pdf" },
              { label: "Contact Author", href: "mailto:sidney@themissingmeter.org" },
              { label: "DOI: pending", href: "#" },
            ].map((l) => (
              <a key={l.label} href={l.href} style={{ display: "block", fontSize: "13px", color: "var(--ink-mid)", textDecoration: "none", marginBottom: "0.3rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-mid)")}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        marginTop: "2rem",
        paddingTop: "1.25rem",
        borderTop: "1px solid var(--rule)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "0.75rem",
      }}>
        <span style={{ fontSize: "11.5px", color: "var(--ink-light)" }}>
          © 2026 Sidney Scott.
        </span>
      </div>
    </footer>
  );
}
