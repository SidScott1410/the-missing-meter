// DraftBanner — pinned top bar for pre-launch drafts
// To remove at launch: delete <DraftBanner /> from App.tsx
// One edit, no other changes needed.
// Design: quiet but present — amber-tinted, monospace, not alarming

export default function DraftBanner() {
  return (
    <div
      role="banner"
      aria-label="Draft status notice"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60, // above SiteNav (z-50) and SectionNav (z-40)
        background: "oklch(0.96 0.04 85)",
        borderBottom: "1px solid oklch(0.88 0.06 80)",
        padding: "0.45rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
      }}
    >
      {/* Meter tick motif */}
      <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
        {[3, 5, 7, 5, 3].map((h, i) => (
          <span key={i} style={{
            display: "inline-block",
            width: "2px",
            height: `${h}px`,
            background: i === 2 ? "oklch(0.55 0.12 75)" : "oklch(0.65 0.08 75)",
            borderRadius: "1px",
          }} />
        ))}
      </span>
      <p style={{
        margin: 0,
        fontSize: "12px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        color: "oklch(0.38 0.07 75)",
        letterSpacing: "0.04em",
        lineHeight: 1,
      }}>
        Working draft — not for circulation
      </p>
    </div>
  );
}
