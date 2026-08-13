// ExhibitCarousel — pi.website style horizontal exhibit carousel with labeled tabs
// Palette: --paper, --ink, --ink-mid, --ink-light, --rule, --surface, --amber
// No external images — each slide is a self-contained data visualization card

import { useState, useRef, useEffect } from "react";

interface Slide {
  label: string;
  title: string;
  caption: string;
  content: React.ReactNode;
}

interface ExhibitCarouselProps {
  slides: Slide[];
}

export default function ExhibitCarousel({ slides }: ExhibitCarouselProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  function goTo(i: number) {
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    setActive(clamped);
    setCanPrev(clamped > 0);
    setCanNext(clamped < slides.length - 1);
    if (trackRef.current) {
      const slideWidth = trackRef.current.offsetWidth;
      trackRef.current.scrollTo({ left: clamped * slideWidth, behavior: "smooth" });
    }
  }

  // Sync active index when user swipes manually
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    function onScroll() {
      if (!track) return;
      const slideWidth = track.offsetWidth;
      const idx = Math.round(track.scrollLeft / slideWidth);
      setActive(idx);
      setCanPrev(idx > 0);
      setCanNext(idx < slides.length - 1);
    }
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  return (
    <div style={{ margin: "2.5rem 0" }}>
      {/* Tab labels — pi.website style */}
      <div style={{
        display: "flex",
        gap: "0",
        borderBottom: "1px solid var(--rule)",
        marginBottom: "0",
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {slides.map((s, i) => (
          <button
            key={s.label}
            onClick={() => goTo(i)}
            style={{
              background: "none",
              border: "none",
              borderBottom: i === active ? "2px solid var(--ink)" : "2px solid transparent",
              padding: "0.6rem 1.1rem",
              fontSize: "12px",
              fontWeight: i === active ? 600 : 400,
              fontFamily: "Inter, system-ui, sans-serif",
              color: i === active ? "var(--ink)" : "var(--ink-mid)",
              letterSpacing: "0.02em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "color 150ms ease, border-color 150ms ease",
              marginBottom: "-1px",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Carousel track */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          overflowX: "hidden",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          borderRadius: "0 0 10px 10px",
          border: "1px solid var(--rule)",
          borderTop: "none",
        }}
      >
        {slides.map((s, i) => (
          <div
            key={s.label}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "start",
              background: "var(--surface)",
              padding: "1.5rem",
            }}
          >
            {/* Slide title */}
            <div style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-mid)",
              marginBottom: "1rem",
            }}>
              {s.title}
            </div>

            {/* Slide content */}
            <div>{s.content}</div>

            {/* Monospace italic caption — pi.website style */}
            <p style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              fontSize: "11.5px",
              fontStyle: "italic",
              color: "var(--ink-mid)",
              lineHeight: 1.55,
              marginTop: "1rem",
              marginBottom: 0,
            }}>
              {s.caption}
            </p>
          </div>
        ))}
      </div>

      {/* Prev / Next + counter — pi.website style */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginTop: "0.75rem",
      }}>
        <button
          onClick={() => goTo(active - 1)}
          disabled={!canPrev}
          aria-label="Previous"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "1px solid var(--rule)",
            background: canPrev ? "var(--ink)" : "var(--surface)",
            color: canPrev ? "var(--paper)" : "var(--ink-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canPrev ? "pointer" : "default",
            transition: "background 150ms ease",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          onClick={() => goTo(active + 1)}
          disabled={!canNext}
          aria-label="Next"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "1px solid var(--rule)",
            background: canNext ? "var(--ink)" : "var(--surface)",
            color: canNext ? "var(--paper)" : "var(--ink-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canNext ? "pointer" : "default",
            transition: "background 150ms ease",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <span style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "12px",
          color: "var(--ink-mid)",
          letterSpacing: "0.04em",
        }}>
          {active + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
}
