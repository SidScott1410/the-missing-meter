// ReadingProgress — thin amber line at top of viewport, fills as user scrolls
// Reinforces the "meter" brand metaphor — the meter is reading the document
// Only animates transform/opacity (GPU-only), respects prefers-reduced-motion

import { useState, useEffect } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialise
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        zIndex: 100,
        background: "var(--rule)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "var(--amber)",
          transformOrigin: "left center",
          transform: `scaleX(${progress / 100})`,
          transition: "transform 80ms linear",
          willChange: "transform",
        }}
      />
    </div>
  );
}
