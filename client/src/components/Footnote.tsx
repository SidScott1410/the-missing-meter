// Footnote.tsx — Inline expandable footnote, SA-style
// Click the superscript number to expand/collapse the note in-place.
// No jump to bottom, no scroll disruption.

import { useState, useRef, useEffect } from "react";

interface FootnoteProps {
  n: number;
  children: React.ReactNode;
}

export default function Footnote({ n, children }: FootnoteProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLSpanElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        className="fn-trigger"
        aria-expanded={open}
        aria-label={`Footnote ${n}`}
        onClick={() => setOpen((v) => !v)}
      >
        [{n}]
      </button>
      {open && (
        <span
          ref={panelRef}
          className="fn-panel"
          role="note"
          aria-label={`Footnote ${n} content`}
        >
          <span className="fn-panel-inner">
            <span className="fn-panel-n">{n}</span>
            <span className="fn-panel-body">{children}</span>
            <button
              className="fn-panel-close"
              aria-label="Close footnote"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </span>
        </span>
      )}
    </>
  );
}
