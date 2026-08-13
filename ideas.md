# The Missing Meter — Design System

## Chosen Approach: Premium Investigative Research Dossier

**Design Movement:** Premium editorial longform / forensic investigative report

**Core Principles:**
1. Warm paper ground (#f5f2ee) with near-black ink (#1a1917) — no gradients, no color except one amber accent
2. Playfair Display for all display/heading text; Inter for body/UI; JetBrains Mono for captions/code
3. Every animation must serve comprehension — fade-up on scroll, chart draw-in, typewriter sequence only
4. Evidence panels (tables, charts, code blocks) form a unified "forensic report" visual language

**Color Philosophy:** Strictly monochromatic with a single warm amber (#C8A84B) used only on the highest-signal elements: stat numbers, active TOC indicator, served-token node in architecture diagram, blockquote left borders, prediction card active state, meter-tick motif center mark.

**Layout Paradigm:** Asymmetric sidebar (TOC) + reading column on desktop. Single column on mobile. No centered hero layout — the title is left-aligned and the page reads like a document, not a landing page.

**Signature Elements:**
1. Meter calibration tick strip — 5-13 vertical ticks with the center one in amber, used in nav wordmark, hero eyebrow, section dividers, and footer
2. Amber left-border blockquotes — all pull quotes and key callouts use a 3px amber left border
3. JetBrains Mono italic figure captions — all exhibits, tables, and charts use monospace italic captions

**Interaction Philosophy:** Hover reveals falsification conditions on prediction cards. Scroll-triggered fade-up on sections. Typewriter animation on cost log. Chart draw-in on scroll entry. ExhibitCarousel with labeled tabs and prev/next navigation.

**Animation:** Functional only. Fade-up: 500ms cubic-bezier(0.23,1,0.32,1). Chart draw-in: 900-1200ms ease-out. Typewriter: character-by-character with blinking cursor. No parallax, no color transitions.

**Typography System:**
- Display: Playfair Display 400, clamp(2.5rem, 5vw, 4rem), letter-spacing -0.02em
- Section h2: Playfair Display 400, clamp(1.4rem, 2.6vw, 1.75rem), border-bottom rule
- Section h3: Playfair Display 400 italic, 1.1rem
- Body: Inter 400, 17px, line-height 1.75
- Captions: JetBrains Mono italic, 11.5px, color var(--ink-mid)
- Metadata: Inter 500, 11px, letter-spacing 0.08em, uppercase, color var(--ink-mid)

**Brand Essence:** The definitive working paper on AI's missing unit of account — for infrastructure investors, AI operators, and standards bodies who need to see the pattern clearly.

**Brand Voice:** Precise, skeptical, investigative. Every heading sounds authored by a forensic analyst, not a marketer.
- "What every infrastructure buildout leaves behind, and the unit AI still lacks"
- "The meter did not record the business. The meter created the business."

**Wordmark & Logo:** Meter calibration tick strip (5 vertical bars, center one amber) + "The Missing Meter" in Playfair Display 400.

**Signature Brand Color:** Warm amber #C8A84B — the color of the missing measurement.

## Style Decisions

- Site direction: premium investigative research dossier — warm paper ground, high-contrast editorial serif display, restrained technical sans/mono support, no generic SaaS-style gradients or card decoration.
- Brand motif: "missing measurement" — meter ticks, calibration lines, gaps, audit marks, and a single muted yellow highlight as the recurring visual language across hero, dividers, callouts, figures, and footer.
- Copy voice: precise, skeptical, report-like — every heading and caption sounds authored by an investigator, not by a generic marketing or documentation template.
- Section h2 headings have a thin bottom border to create clear chapter landmarks.
- Blockquotes use amber left border (3px) to distinguish them from regular text.
- All figure captions use JetBrains Mono italic for a consistent "forensic report" technical voice.
