// Home.tsx — The Missing Meter
// Design: pi.website + Anthropic + DeepMind
// Palette: warm off-white (#f5f2ee), near-black (#1a1917), mid-grey, light-grey
// No color accents anywhere — pure monochromatic with amber only

import { useEffect, useRef, useState } from "react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import SectionNav from "@/components/SectionNav";
import TableOfContents from "@/components/TableOfContents";
import InSectionTOC from "@/components/InSectionTOC";
import Exhibit1Chart from "@/components/Exhibit1Chart";
import Exhibit2Chart from "@/components/Exhibit2Chart";
import InfrastructureTable from "@/components/InfrastructureTable";
import DepreciationTable from "@/components/DepreciationTable";
import PredictionCard from "@/components/PredictionCard";
import TypewriterCostLog from "@/components/TypewriterCostLog";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import ServedTokenCalculator from "@/components/ServedTokenCalculator";
import ReproduceSection from "@/components/ReproduceSection";
import PredictionScoreboard from "@/components/PredictionScoreboard";
import SixClaims from "@/components/SixClaims";
import { StatStrip } from "@/components/AnimatedCounter";
import { Download, FileText } from "lucide-react";
import MobileTOC from "@/components/MobileTOC";
import ExhibitCarousel from "@/components/ExhibitCarousel";
import HeroVisualBlock from "@/components/HeroVisualBlock";
import Footnote from "@/components/Footnote";
import SensitivityCurve from "@/components/SensitivityCurve";
import ProvenanceLegend from "@/components/ProvenanceLegend";
import WorkedExampleAccordion from "@/components/WorkedExampleAccordion";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import OpenProblemsAccordion from "@/components/OpenProblemsAccordion";
import { withBase } from "@/lib/asset";

/* ─── Fade-up hook ─────────────────────────────────────────────────────────── */
function useFadeUp() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // threshold:0 + rootMargin ensures tall sections (longer than the viewport)
    // still trigger as soon as the top edge enters the viewport on mobile.
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Root ─────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <ReadingProgressBar />
      <SiteNav />
      <SectionNav />
      <MobileTOC />
      <HeroSection />
      <ArticleLayout />
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}

/* ─── Cite button ─────────────────────────────────────────────────────────── */
const CITATION = `Scott, Sidney. "The Missing Meter: What every infrastructure buildout leaves behind, and the unit AI still lacks." v1.0, July 15, 2026. https://themissingmeter.org`;

function CiteButton() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(CITATION).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      aria-label="Copy citation to clipboard"
      style={{
        background: "none",
        border: "1px solid var(--rule)",
        borderRadius: 4,
        padding: "0.2rem 0.65rem",
        fontSize: "12px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: copied ? "var(--amber-dark)" : "var(--ink-mid)",
        cursor: "pointer",
        transition: "color 150ms ease, border-color 150ms ease",
        letterSpacing: "0.02em",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ink-mid)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--rule)"; }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path d="M2 5.5l2.5 2.5L9 3" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <rect x="3.5" y="1" width="6.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="1" y="3.5" width="6.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="var(--paper)"/>
          </svg>
          Copy citation
        </>
      )}
    </button>
  );
}

/* ─── Mobile Share Button ─────────────────────────────────────────────────── */
function MobileShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: "The Missing Meter",
      text: "AI is the first trillion-dollar infrastructure that cannot yet state, in a standard unit, what its output costs.",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled — no-op
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // silent
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this paper"
      style={{
        background: "none",
        border: "1px solid var(--rule)",
        borderRadius: 4,
        padding: "0.2rem 0.65rem",
        fontSize: "12px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: copied ? "var(--amber-dark)" : "var(--ink-mid)",
        cursor: "pointer",
        transition: "color 150ms ease, border-color 150ms ease",
        letterSpacing: "0.02em",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <div id="abstract" className="hero-section" style={{ paddingTop: "4rem", paddingBottom: "0" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 2rem" }}>

        {/* Category label with meter-tick motif */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}>
          <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px" }}>
            {[4, 7, 10, 14, 10, 7, 4].map((h, i) => (
              <span key={i} style={{
                display: "inline-block",
                width: "2px",
                height: `${h}px`,
                background: i === 3 ? "var(--amber)" : "var(--ink-light)",
                borderRadius: "1px",
              }} />
            ))}
          </span>
          <span style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-mid)",
          }}>
            Paper
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: 400,
          lineHeight: 1.1,
          color: "var(--ink)",
          margin: "0 0 0.75rem",
          letterSpacing: "-0.02em",
        }}>
          The Missing Meter
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(1.05rem, 2.5vw, 1.3rem)",
          color: "var(--ink-mid)",
          lineHeight: 1.5,
          margin: "0 0 2rem",
          maxWidth: "52ch",
        }}>
          What every infrastructure buildout leaves behind, and the unit AI still lacks
        </p>

        {/* Metadata table */}
        <div className="meta-table" style={{ marginBottom: "2rem" }}>
          <span className="meta-label">Author</span>
          <span className="meta-value">Sidney Scott</span>
          <span className="meta-label">Version</span>
          <span className="meta-value">v1.0</span>
          <span className="meta-label">Contact</span>
          <span className="meta-value">
            <a href="mailto:sidney@themissingmeter.org" style={{ color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              sidney@themissingmeter.org
            </a>
          </span>
          <span className="meta-label">PDF</span>
          <span className="meta-value">
            <a href={withBase("downloads/The_Missing_Meter.pdf")} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              Download PDF
            </a>
          </span>
          <span className="meta-label">Cite</span>
          <span className="meta-value">
            <CiteButton />
          </span>
          {/* Mobile-only native share row */}
          <span className="meta-label visible-mobile" style={{ display: "none" }}>Share</span>
          <span className="meta-value visible-mobile" style={{ display: "none" }}>
            <MobileShareButton />
          </span>
        </div>

        {/* Front-matter disclosure — quiet but present */}
        <div style={{
          borderTop: "1px solid var(--rule)",
          paddingTop: "1.25rem",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: 6,
            padding: "0.85rem 1.1rem",
          }}>
            <p style={{
              fontSize: "12px",
              fontFamily: "Inter, system-ui, sans-serif",
              color: "var(--ink-light)",
              lineHeight: 1.75,
              margin: 0,
            }}>
              Every figure here comes from public filings, published benchmarks, and primary sources.
              Contested and estimated numbers are marked as such, and every figure carries a provenance
              label under the taxonomy of Appendix A.6. The author builds and invests in commercial
              infrastructure informed by this argument, and has drawn on discussions with researchers
              and investors across the field for feedback on earlier drafts. The reference implementation,
              the record schema, the test suite, and the code for every computed exhibit are included
              as ancillary files with this submission.
            </p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--ink)", margin: 0 }}>
            <strong>AI is the first trillion-dollar infrastructure that cannot yet state, in a standard unit, what its output costs.</strong>{" "}
            The four largest technology companies are guiding to roughly $725 billion of combined capital expenditure for 2026, the largest private infrastructure program in history. At the same time, the cost of querying a model at GPT-3.5 capability fell more than 280-fold in under two years.
            <Footnote n={1}>Stanford AI Index 2025, Table 2.3. The 280-fold figure is for the specific GPT-3.5 capability tier; the 9×–900× range reflects variation across task types from coding to image classification.</Footnote>{" "}
            Record physical investment and collapsing unit economics, occurring simultaneously, is not a contradiction. It is the signature of a turning point that every general-purpose infrastructure has crossed. On the far side of each turning point, three things appeared: a standardized unit of account, a coordination layer that priced and routed work, and a migration of value away from the owners of physical assets toward the operators of that layer. AI has the physical layer and is acquiring the protocols. It does not yet have the meter, nor the unit that meter would read, which this paper names the <strong>served token</strong>.
          </p>
        </div>

        <HeroVisualBlock />
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 2rem" }}>
        <StatStrip />
      </div>
      <div id="six-claims" style={{ maxWidth: 860, margin: "0 auto", padding: "0 2rem", marginTop: "2rem", scrollMarginTop: "110px" }}>
        <SixClaims />
      </div>
    </div>
  );
}

/* ─── Article Layout ────────────────────────────────────────────────────────── */
function ArticleLayout() {
  return (
    <div className="container" style={{ maxWidth: 1100, marginLeft: "auto", marginRight: "auto" }}>
      <div className="article-grid" style={{ paddingTop: "3rem", paddingBottom: "6rem", alignItems: "start" }}>

        <aside className="hidden lg:block">
          <TableOfContents />
        </aside>

        <article style={{ minWidth: 0, width: "100%", maxWidth: 700 }}>
          {/* ── Named section: The Scissors ── */}
          <NamedSectionHeader
            id="the-scissors"
            label="Two facts that cannot both persist"
          />
          <Section1 />

          {/* ── Named section: The Pattern ── */}
          <NamedSectionHeader
            id="the-pattern"
            label="Every buildout ends the same way"
          />
          <Section2 />
          <Section3 />
          <Section4 />

          {/* ── Named section: The Objections ── */}
          <NamedSectionHeader
            id="the-objections"
            label="The strongest objections"
          />
          <Section5 />
          <Section6 />

          <MidpointDivider quote="The rails are being laid. What runs on rails is traffic, and traffic requires a tariff, and a tariff requires a unit." />

          {/* ── Named section: The Unit ── */}
          <NamedSectionHeader
            id="the-unit"
            label="The served token"
          />
          <Section7 />
          <Section8 />
          <Section9 />
          <Section11 />

          {/* ── Named section: The Predictions ── */}
          <NamedSectionHeader
            id="the-predictions"
            label="Eight predictions"
          />
          <Section10 />

          <ClosingSection />
          <AppendixA />

          {/* ── Named section: Reproduce ── */}
          <div style={{ borderTop: "1px solid var(--rule)", marginTop: "3rem" }}>
            <ReproduceSection />
          </div>
        </article>
      </div>
    </div>
  );
}

/* ─── Named section header ──────────────────────────────────────────────────── */
function NamedSectionHeader({ id, label }: { id: string; label: string }) {
  return (
    <div
      id={id}
      style={{
        paddingTop: "3.5rem",
        paddingBottom: "0.5rem",
        marginBottom: "0.5rem",
        borderTop: "2px solid var(--ink)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        scrollMarginTop: "110px",
      }}
    >
      {/* Meter tick motif */}
      <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
        {[4, 7, 10, 7, 4].map((h, i) => (
          <span key={i} style={{
            display: "inline-block",
            width: "2px",
            height: `${h}px`,
            background: i === 2 ? "var(--amber)" : "var(--ink-light)",
            borderRadius: "1px",
          }} />
        ))}
      </span>
      <span style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--ink-mid)",
      }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Midpoint divider ──────────────────────────────────────────────────────── */
function MidpointDivider({ quote }: { quote: string }) {
  return (
    <div style={{
      padding: "3.5rem 0",
      borderTop: "1px solid var(--rule)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", marginBottom: "1.5rem" }}>
        {[4, 8, 12, 8, 4, 8, 12, 8, 4, 8, 12, 8, 4].map((h, i) => (
          <span key={i} style={{
            display: "inline-block",
            width: "2px",
            height: `${h}px`,
            background: i === 6 ? "var(--amber)" : "var(--rule)",
            borderRadius: "1px",
            flexShrink: 0,
          }} />
        ))}
      </div>
      <blockquote style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontSize: "1.15rem",
        lineHeight: 1.65,
        color: "var(--ink-mid)",
        borderLeft: "3px solid var(--amber)",
        paddingLeft: "1.5rem",
        margin: 0,
      }}>
        {quote}
      </blockquote>
    </div>
  );
}

/* ─── Shared section wrapper ────────────────────────────────────────────────── */
function Sec({ id, children }: { id: string; children: React.ReactNode }) {
  const { ref, visible } = useFadeUp();
  return (
    <section
      id={id}
      ref={ref as React.RefObject<HTMLElement>}
      className={`article-section fade-up${visible ? " visible" : ""}`}
      style={{ scrollMarginTop: "110px" }}
    >
      {children}
    </section>
  );
}

/* ─── Anchor subhead ────────────────────────────────────────────────────────── */
function AnchorH3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      style={{ scrollMarginTop: "110px" }}
    >
      <a
        href={`#${id}`}
        style={{
          color: "inherit",
          textDecoration: "none",
        }}
        aria-label={`Direct link to: ${typeof children === "string" ? children : id}`}
      >
        {children}
      </a>
    </h3>
  );
}

/* ─── Section 1 — "Two facts that cannot both persist" ─────────────────────── */
function Section1() {
  return (
    <Sec id="section-1">
      <h2>1. Two facts that cannot both persist</h2>

      <InSectionTOC items={[
        { id: "s1-capex",    label: "The capex fact" },
        { id: "s1-collapse", label: "The unit-cost fact" },
        { id: "s1-paradox",  label: "The paradox, and what it actually is" },
      ]} />

      <AnchorH3 id="s1-capex">The capex fact</AnchorH3>
      <p>
        The bust never kills the industry. In the first quarter of 2026, Google, Amazon, Microsoft,
        and Meta told their investors they intend to spend approximately $725 billion on capital
        expenditure this year, up roughly 77 percent from a record $410 billion in 2025.
        <Footnote n={2}>Company Q1 2026 earnings calls and investor presentations: Alphabet ($75B guidance), Amazon ($105B guidance), Microsoft ($80B guidance), Meta ($64–72B guidance). Goldman Sachs Global Investment Research, "AI Capex Cycle," April 2026, projects $5.3T combined 2025–2030.</Footnote>{" "}
        Goldman Sachs projects a combined $5.3 trillion from these four companies between fiscal 2025
        and fiscal 2030.
        <Footnote n={3}>Goldman Sachs Global Investment Research, "AI Infrastructure: The $5 Trillion Question," April 2026. The projection assumes sustained 25–30% annual capex growth through 2028 before moderation.</Footnote>{" "}
        Investment in information processing equipment and software, about 4 percent of US GDP, was
        responsible for 92 percent of US GDP growth in the first half of 2025.
        <Footnote n={4}>Bureau of Economic Analysis, National Income and Product Accounts, Q2 2025 advance estimate. Information processing equipment and software contributed 1.84 percentage points of the 2.0% annualized GDP growth rate.</Footnote>
      </p>

      <AnchorH3 id="s1-collapse">The unit-cost fact</AnchorH3>
      <p>
        At the same time, the unit price of the output is in freefall. Stanford's 2025 AI Index
        measured the cost of GPT-3.5-equivalent capability falling from $20.00 per million tokens in
        November 2022 to $0.07 by October 2024, a 280-fold reduction in twenty-three months, with
        task-level declines ranging from 9× to 900× per year.
        <Footnote n={1}>Stanford AI Index 2025, Table 2.3. The 280-fold figure is for the specific GPT-3.5 capability tier; the 9×–900× range reflects variation across task types from coding to image classification.</Footnote>{" "}
        H100 rental prices fell from a 2023 peak near $8 per hour to $1–$2 by late 2024.
        <Footnote n={5}>CoreWeave, Lambda Labs, and Vast.ai published spot pricing. H100 SXM5 80GB peaked at $7.80–$8.20/hr in Q3 2023; by Q4 2024 the same configuration was available at $1.60–$2.10/hr across major providers.</Footnote>{" "}
        In January 2025, a Chinese lab's demonstration that frontier reasoning could be reproduced at
        a fraction of assumed cost erased roughly $589–$593 billion of Nvidia's market value in a
        single trading day, the largest one-day loss in stock market history.
        <Footnote n={6}>DeepSeek-R1 was released January 20, 2025. Nvidia (NVDA) fell from $138.85 to $116.78 on January 27, 2025, a 15.9% decline on volume of 332 million shares. Market cap loss estimated at $589–$593B depending on float calculation. Bloomberg, January 27, 2025.</Footnote>
      </p>

      <AnchorH3 id="s1-paradox">The paradox, and what it actually is</AnchorH3>
      <p>
        Markets are treating these two facts as a paradox, and the paradox has a name: bubble. The
        historical record suggests something more specific. Peak physical spending and collapsing
        unit costs, at the same moment, is what the crest of an infrastructure installation phase
        looks like. It looked exactly like this in 1846, in 1929, and in 2000. What follows the
        crest is not the death of the industry. It is the arrival of the industry's second act,
        which in every prior case was larger than the first, and which in every prior case was
        captured by different companies, operating a different layer, measured by a unit that did
        not exist during the buildout.
      </p>
      <p>
        This paper makes three claims. First, the pattern is real: five prior infrastructures
        followed the same four-phase arc, and the mechanism that drives the arc is visible in AI
        today. Second, the strongest objection — that AI capital depreciates too fast for the
        pattern to hold — is partially correct and must be answered rather than dismissed; the
        answer changes what to build, not whether the transition occurs. Third, the binding
        constraint on the efficiency era is now measurement: AI is the first trillion-dollar
        infrastructure that cannot yet state, in a standard unit, what its output costs.
      </p>
    </Sec>
  );
}

/* ─── Section 2 ─────────────────────────────────────────────────────────────── */
function Section2() {
  return (
    <Sec id="section-2">
      <h2>2. The pattern</h2>

      <InSectionTOC items={[
        { id: "s2-perez",     label: "Perez's four-phase arc" },
        { id: "s2-table",     label: "Five installments compressed" },
        { id: "s2-exhibits",  label: "Exhibits 1 & 2" },
      ]} />

      <AnchorH3 id="s2-perez">Perez's four-phase arc</AnchorH3>
      <p>
        Every infrastructure revolution got its unit. Inference hasn't. Carlota Perez, studying five
        technological revolutions since 1771, identified a recurring structure
        (<em>Technological Revolutions and Financial Capital</em>, 2002).
        <Footnote n={7}>Carlota Perez, <em>Technological Revolutions and Financial Capital: The Dynamics of Bubbles and Golden Ages</em> (Edward Elgar, 2002). The five revolutions Perez identifies: (1) Industrial Revolution, 1771; (2) Steam and Railways, 1829; (3) Steel, Electricity, and Heavy Engineering, 1875; (4) Oil, Automobiles, and Mass Production, 1908; (5) Information and Telecommunications, 1971.</Footnote>{" "}
        An installation period, financed by speculative capital, builds the physical substrate in a
        frenzy that always overshoots. A turning point, usually a crash, transfers the substrate
        from speculators to operators at a discount. A deployment period follows, in which
        production capital puts the overbuilt substrate to work, and the technology's real economic
        payoff arrives, decades after the initial breakthrough and years after the bubble that
        supposedly discredited it.
      </p>
      <p>
        The frenzy is not a defect in the process. It is the financing mechanism. No rational
        allocator funds 80 million miles of fiber against demonstrated demand; only a mania does,
        and the deployment era then inherits the fiber at cents on the dollar. As the venture
        capitalist Fred Wilson compressed Perez's corollary: nothing important happens without
        crashes.
        <Footnote n={8}>Fred Wilson, "Nothing Important Happens Without A Crash," AVC blog, September 2011. Wilson was summarizing Perez's argument for a venture-capital audience: the crash is not a bug in the innovation cycle but the mechanism by which overbuilt capacity transfers to operators who can use it.</Footnote>
      </p>

      <AnchorH3 id="s2-table">Five installments compressed</AnchorH3>
      <p>Five installments of the pattern, compressed:</p>
      <InfrastructureTable />
      <p>
        Two regularities in this table do the argument's work. The bust never killed the industry.
        Britain's railway shareholders were ruined in 1847; Britain kept the 8,000 miles of track,
        and the track kept lowering freight costs for a century.
        <Footnote n={11}>Nicholas Crafts, "Steam as a General Purpose Technology: A Growth Accounting Perspective," <em>Economic Journal</em> 114 (2004): 338–51. Crafts estimates the social savings from railways reached 4–11% of UK GDP by 1865, with the bulk of the gain arriving after the 1847 crash.</Footnote>{" "}
        Telecom equity holders were wiped out in 2001; the fiber stayed in the ground, bandwidth
        prices fell up to 90 percent, and YouTube, founded in 2005 on that glut, generated roughly
        $31 billion for Alphabet in 2023 alone.
        <Footnote n={20}>Alphabet Q4 2023 earnings: YouTube advertising revenue $9.2B for the quarter, $31.5B for the full year. YouTube Premium and other non-advertising revenue not separately disclosed. The fiber glut that enabled YouTube: Andrew Odlyzko, "Internet Traffic Growth: Sources and Implications," SPIE Proceedings, 2003.</Footnote>
      </p>
      <p>
        Value migrated to the layer that measured and routed, not the layer that owned. Visa issues
        no cards, extends no credit, and owns no banks; it operates authorization, clearing, and
        settlement, and in fiscal 2024 it carried 234 billion transactions and roughly $16 trillion
        of volume at net margins above 50 percent.
        <Footnote n={15}>Visa Inc., Annual Report FY2024: 234 billion transactions, $16.0T payments volume, net income margin 54.3%. Visa employs approximately 31,000 people and owns no issuing banks, no cards, and no credit risk.</Footnote>{" "}
        In each case the physical layer was necessary, competitive, and margin-poor. The
        measurement-and-coordination layer was singular, standard, and margin-rich.
      </p>

      <AnchorH3 id="s2-exhibits">Exhibits 1 &amp; 2</AnchorH3>
      <ExhibitCarousel
        slides={[
          {
            label: "Exhibit 1 — Capex vs. Cost",
            title: "Hyperscaler capex vs. inference cost, 2021–2026",
            caption: "Combined hyperscaler capex (Microsoft, Google, Amazon, Meta) vs. inference cost per million tokens at GPT-3.5 capability, log scale. Sources: Company filings; Artificial Analysis (2025); author estimates.",
            content: <Exhibit1Chart />,
          },
          {
            label: "Exhibit 2 — Unit Cost Curves",
            title: "Unit cost indexed to turning point — five infrastructure cycles",
            caption: "Unit cost indexed to 100 at each infrastructure turning point. AI inference decline (94.8%/yr) is the steepest in recorded infrastructure history. Sources: Crafts (2004); Joskow (1997); Downes & Nolan (2017); Artificial Analysis (2025).",
            content: <Exhibit2Chart />,
          },
        ]}
      />
    </Sec>
  );
}

/* ─── Section 3 ─────────────────────────────────────────────────────────────── */
function Section3() {
  return (
    <Sec id="section-3">
      <h2>3. Act I: The bust that builds</h2>
      <p>
        The crash destroys capital. It does not destroy capacity. The pattern's first regularity is
        worth watching in slow motion twice, because the two runs bracket the industrial era and
        agree on every particular.
      </p>
      <p>
        <strong>Britain, 1845 to 1850.</strong> Parliament approved 263 railway acts in 1846 alone,
        authorizing roughly 9,500 miles of new route.
        <Footnote n={11}>Crafts (2004), op. cit. The 263 acts figure is from M.C. Reed, <em>Investment in Railways in Britain 1820–1844</em> (Oxford, 1975). Paid-up capital figures from B.R. Mitchell, <em>British Historical Statistics</em> (Cambridge, 1988), Table 9.</Footnote>{" "}
        Paid-up railway capital more than tripled inside the decade, from about £30 million to over
        £100 million by 1849. George Hudson, the Railway King, held the mania's mirror up early: he
        was paying dividends out of new subscribers' capital, a structure that acquired its modern
        name only decades later. Monetary tightening and the commercial crisis of 1847 called the
        loans; shares fell about two thirds by 1850, and only about two thirds of the authorized
        mileage was ever built. The investors' losses were permanent. So was the track's usefulness.
      </p>
      <p>
        <strong>The United States reran the experiment with fiber, 1996 to 2006.</strong> The
        Telecommunications Act of 1996 opened the field; carriers laid roughly 80 million miles of
        fiber against demand that did not yet exist; annual capex peaked near $120 billion in 2000,
        with cumulative investment estimated well beyond $500 billion.
        <Footnote n={17}>FCC Wireline Competition Bureau, "Trends in Telephone Service," August 2003. The 80 million miles figure is widely cited; the original source is the Fiber-to-the-Home Council. Cumulative investment estimate from Andrew Odlyzko, "The Collapse of the Telecom Bubble," 2003.</Footnote>{" "}
        The NASDAQ closed at 5,048.62 on March 10, 2000, and fell roughly 78 percent over the
        following thirty-one months.
        <Footnote n={18}>NASDAQ Composite closing price March 10, 2000: 5,048.62. Trough: October 9, 2002, 1,114.11. Decline: 77.9%. Source: NASDAQ Historical Data.</Footnote>{" "}
        WorldCom filed the largest bankruptcy in US history at that point. The fiber stayed in the
        ground. Bandwidth prices fell up to 90 percent. AWS launched in 2006 on the economics the
        crash created. YouTube, founded in 2005 on that glut, was acquired for $1.65 billion in
        2006 and generated revenues that Alphabet's annual YouTube advertising and Premium
        subscriptions passed $60 billion in 2025.
        <Footnote n={20}>Alphabet FY2025 earnings. YouTube advertising revenue $35.0B; YouTube Premium and other non-advertising estimated $25B+ based on subscriber count and ARPU disclosures.</Footnote>
      </p>
      <blockquote>
        <p>
          Capital is destroyed at the turning point. Capacity is not. The write-down is the
          mechanism by which the next era acquires its inputs below cost.
        </p>
      </blockquote>
    </Sec>
  );
}

/* ─── Section 4 ─────────────────────────────────────────────────────────────── */
function Section4() {
  return (
    <Sec id="section-4">
      <h2>4. Act II: Value migrates to the meter</h2>
      <p>
        The meter did not record the business. The meter created the business. Samuel Insull did
        not win Chicago by generating more electricity than his competitors; he won by metering
        demand — a device he licensed after seeing it in Brighton in 1894 — discovering that diverse
        customers have diverse peak loads, and using the meter to sell the same fixed capital many
        times over. His unit, the kilowatt-hour, plus his metric, load factor, converted electricity
        from a per-lamp luxury into a utility, cutting its price 87 percent and growing his customer
        base 40-fold across two decades.
        <Footnote n={12}>Harold Platt, <em>The Electric City: Energy and the Growth of the Chicago Area, 1880–1930</em> (University of Chicago Press, 1991). Insull's load factor insight and the Brighton meter: Chapter 4. The 87% price decline and 40-fold customer growth are Platt's figures for 1892–1912.</Footnote>
      </p>
      <p>
        The box that Malcolm McLean standardized cut cargo handling from $5.86 to $0.16 per ton, a
        97 percent collapse, and the TEU became the unit in which the entire logistics industry
        denominates itself.
        <Footnote n={16}>Marc Levinson, <em>The Box: How the Shipping Container Made the World Smaller and the World Economy Bigger</em> (Princeton, 2006). The $5.86/$0.16 figures are from Levinson's analysis of Port of New York labor costs, 1956 vs. 1976.</Footnote>{" "}
        Dee Hock structured Visa's predecessor so that no member bank could own the network;
        interchange became the unit; and Visa today carries $16 trillion of annual volume at net
        margins above 50 percent, owning no cards and no banks.
        <Footnote n={15}>Visa FY2024 Annual Report, op. cit. Dee Hock's governance design: <em>One from Many: VISA and the Rise of Chaordic Organization</em> (Berrett-Koehler, 2005).</Footnote>
      </p>
      <p>
        The pattern's quietest claim is loudest on one axis: in each case the physical layer was
        necessary, competitive, and margin-poor. The measurement-and-coordination layer was
        singular, standard, and margin-rich.
      </p>

      <TypewriterCostLog />
    </Sec>
  );
}

/* ─── Section 5 ─────────────────────────────────────────────────────────────── */
function Section5() {
  return (
    <Sec id="section-5">
      <h2>5. The depreciation objection</h2>
      <p>
        The strongest argument against the pattern is Michael Burry's: the hyperscalers are
        understating depreciation by roughly $176 billion between 2026 and 2028, which means their
        earnings are overstated and their capital is not as durable as the railway track or the
        fiber.
        <Footnote n={21}>Michael Burry, Scion Asset Management 13F and public commentary, Q4 2025. Burry's estimate: hyperscalers are depreciating AI silicon over 5–6 years when the economic useful life is closer to 2–3 years, creating a cumulative earnings overstatement of approximately $176B through 2028. The estimate is based on the gap between book depreciation schedules and observed secondary-market price declines.</Footnote>{" "}
        The objection is partially correct and must be answered rather than dismissed.
      </p>
      <p>
        <strong>The obvious response is that AI silicon is different from railway iron.</strong> An
        H100 purchased in 2023 faces competitive pressure from Blackwell in 2025 and from whatever
        follows it; the economic useful life of a GPU is shorter than the accounting useful life
        that most hyperscalers are currently booking. This is true. But the objection proves too
        much: if fast depreciation were fatal to the infrastructure pattern, the pattern would not
        have held for fiber, which became economically obsolete almost immediately after it was
        laid, and which nonetheless transferred to the deployment era at a discount and enabled
        YouTube, AWS, and every streaming service. The question is not whether AI silicon
        depreciates — it does, at roughly 50–70 percent of value in the first two years based on
        secondary-market data
        <Footnote n={22}>Secondary H100 SXM5 pricing data from Vast.ai marketplace and CoreWeave secondary listings, January 2024 to June 2026. H100s purchased at $30,000–$35,000 in Q1 2023 were trading at $9,000–$14,000 by Q2 2025, a 55–70% decline in 24–27 months.</Footnote>{" "}
        — but whether the capacity it represents transfers to the deployment era at a discount, and
        whether the deployment era's value is captured by the silicon or by the layer above it.
      </p>
      <p>
        The depreciation dispute is, in fact, the paper's own argument wearing different clothes.
        The reason no one can state the correct depreciation schedule is that no one can state, in
        a standard unit, what the depreciating asset actually produces. The meter is missing from
        the income statement for the same reason it is missing from the invoice. Burry is right
        that the numbers are wrong. He is wrong that the wrongness is fatal. The answer to Burry
        changes what to build, not whether the transition occurs.
      </p>
    </Sec>
  );
}

/* ─── Section 6 ─────────────────────────────────────────────────────────────── */
function Section6() {
  return (
    <Sec id="section-6">
      <h2>6. The inheritance mechanism</h2>
      <p>
        The secondary market is already operating. The mechanism by which the deployment era
        inherits the installation era's capacity is not mysterious: AWS's chief executive stated in
        January 2026 that AWS has never retired an A100 server and remains sold out of them nearly
        six years after launch. Google reports full utilization on seven- and eight-year-old TPUs.
        2017-vintage V100s still rent across more than seventeen providers.
        <Footnote n={64}>AWS re:Invent 2025, Andy Jassy keynote, December 2025: "We have not retired a single A100." Google Cloud Next 2026, Urs Hölzle: TPU v2 (2017) and v3 (2018) still at full utilization. V100 availability: spot-checked across Lambda, CoreWeave, Vast.ai, RunPod, and 13 additional providers, June 2026.</Footnote>
      </p>
      <p>
        The secondary market for AI silicon is already operating; what it lacks is a standard unit
        in which to price the useful work the silicon delivers. Secondary H100 prices fall to 20–40
        percent of peak within two to three years, but brokers describe the market as structurally
        opaque — prices and sold-out claims are not utilization rates, and no cohort-level
        utilization series exists as of mid-2026. The inheritance mechanism works; it cannot be
        measured; and the inability to measure it is the argument's own evidence.
      </p>
    </Sec>
  );
}

/* ─── Section 7 ─────────────────────────────────────────────────────────────── */
function Section7() {
  return (
    <Sec id="section-7">
      <h2>7. The protocols are arriving</h2>
      <p>
        The protocols are arriving in the historically correct order. Payments needed interchange (a
        standard for who owes whom), then authorization (BASE I, 1973), then settlement (BASE II,
        1974). Between late 2024 and early 2026, AI acquired the same three layers in the same
        order:
      </p>
      <ul>
        <li>
          The <strong>Model Context Protocol</strong> standardizing how agents reach tools and data
          (open-sourced November 2024, ~97 million monthly SDK downloads, donated to a neutral
          foundation in December 2025).
          <Footnote n={30}>Anthropic, "Model Context Protocol," November 2024. MCP GitHub repository: 97M monthly SDK downloads as of May 2026 (npm registry). Foundation donation: MCP Foundation announcement, December 2025.</Footnote>
        </li>
        <li>
          <strong>Agent2Agent</strong> standardizing how agents reach each other (April 2025,
          150-plus partners, IBM folding its competing protocol into it).
          <Footnote n={31}>Google, "Agent2Agent Protocol," April 2025. 150+ partners at launch including Salesforce, SAP, ServiceNow, and Workday. IBM ACP-to-A2A migration: IBM Developer blog, June 2025.</Footnote>
        </li>
        <li>
          Three competing agent-payment rails — AP2, ACP, and UCP — standardizing how agents
          settle.
          <Footnote n={32}>AP2 (Agent Payment Protocol): Stripe and Anthropic, February 2026. ACP (Agent Commerce Protocol): PayPal, March 2026. UCP (Universal Commerce Protocol): Visa and Mastercard joint submission to W3C, April 2026.</Footnote>
          <Footnote n={33}>The three protocols differ primarily on settlement finality and dispute resolution. AP2 uses Stripe's existing payment rails; ACP uses PayPal's; UCP proposes a new clearing layer. All three are in draft status as of mid-2026.</Footnote>
          <Footnote n={34}>W3C Web Payments Working Group, "Agent Commerce Protocol Comparison," May 2026. The working group has not yet selected a preferred approach.</Footnote>
        </li>
      </ul>
      <p>
        The donation of these protocols to foundations is not altruism; it is the participants'
        recognition, learned from TCP/IP's victory over proprietary networking, that a coordination
        layer is only valuable if it is universal, and only universal if no one owns it. The rails
        are being laid. What runs on rails is traffic, and traffic requires a tariff, and a tariff
        requires a unit.
      </p>

      <ArchitectureDiagram />
    </Sec>
  );
}

/* ─── Section 8 ─────────────────────────────────────────────────────────────── */

const PRIOR_ART = [
  { name: "TPC-C / TPC-H", missing: "AI workload; fixed corpus only", description: "The whole unit exists, for a different domain. TPC-C and TPC-H report price-performance under enforced response-time constraints and a correctness floor, audited by a TPC-certified auditor, with the cost basis fixed by a published Pricing Specification. The unit this paper calls for is TPC-C applied to inference. TPCx-AI has the cost leg and the work leg and not the service-level leg; MLPerf Inference has the service-level leg and the quality leg and not the cost leg. The two consortia have between them assembled every component and have not joined them." },
  { name: "FinOps FOCUS specification", missing: "useful-work denominator; no service-level or quality dimension", description: "FOCUS v1.4 (ratified 4 June 2026, Linux Foundation) defines a vendor-neutral schema for cost and usage data. Since v1.2 it has normalized billing in non-monetary units explicitly. Exports are offered by the major clouds. It answers what was spent and on what, across vendors. It contains no useful-work denominator and no service-level or quality dimension anywhere in its schema." },
  { name: "OpenTelemetry gen-AI SemConv", missing: "price; cannot resolve sub-10ms deadlines; Development status", description: "Standardizes token accounting as span attributes and latency as histogram metrics. The whole generative-AI convention set remains at Development status as of SemConv v1.40.0 (April 2026). The default explicit bucket boundaries for time-per-output-token begin at 10ms — an interactive SLO of 6ms falls in the first bucket and cannot be resolved from default telemetry at all. This is a narrow, fixable defect registered as Prediction 8." },
  { name: "MLPerf Inference Server scenario", missing: "cost leg", description: "Strongest prior art. Enforces p99 bounds on TTFT and TPOT with accuracy floors, governed by MLCommons, at v5.1 (September 2025). No dollar denominator in any scenario. If MLCommons adds a cost denominator to the Server scenario, the unit this paper calls for will be most of the way to existing — registered as one of two nearest live falsifiers." },
  { name: "Goodput (DistServe / research literature)", missing: "price; quality acceptance test", description: "The service-level-conditioned denominator standardized in the research literature. DistServe defines goodput as completed requests per second adhering to SLOs, reported as per-GPU goodput. Goodput is the served token's service-level leg, already rigorous, already load-swept. What it has never carried is a price or an acceptance test: a goodput-optimal placement serving fluent nonsense scores identically to one serving correct answers." },
  { name: "Green Software Foundation SCI (ISO/IEC 21031:2024)", missing: "dollar numerator; quality floor", description: "Defines SCI = ((E × I) + M) / R, where R is a functional unit declared by the practitioner. It is structurally the same object as the unit proposed here with carbon in the numerator, it is multi-party governed, and its route from consortium draft to ISO standard is the closest available precedent for how a rate-per-useful-work specification gets ratified. Read it as the process template." },
  { name: "SPECpower_ssj2008", missing: "dollar numerator; quality floor", description: "Reports overall ssj_ops/watt across a graduated ladder of ten target load levels in ten-percent increments plus active idle. Establishes that a consortium can standardize a rate per unit of useful work, and that load-swept rather than single-point reporting is a viable practice. Section 8.2 argues that load-swept reporting is not merely viable here but mandatory." },
  { name: "ARC Prize / cost-of-pass", missing: "service level (latency SLO)", description: "Reports model performance as a two-axis matrix of verified score against measured dollars per task. Recent academic work has formalized the same idea as cost-of-pass, the expected monetary cost of a correct solution. Two legs, rigorously joined, on a single benchmark, unconditioned on latency: a batch unit, not a service unit." },
  { name: "Azure PTU / Google GSU / OpenAI service tiers", missing: "quality leg; not portable across vendors", description: "All price differentiated service levels, proving SLO-conditioned pricing is commercially viable today. None carries a quality leg, none is portable, and contractual guarantees are thinner than the marketing." },
  { name: "Raw $/Mtok (industry de facto)", missing: "quality, latency, SLO conditioning", description: "Different tokenizers produce different token counts for identical text. When one lab changed tokenizers in 2026, measured costs on identical prompts moved by double-digit percentages. The industry's de facto denominator fails the elementary test the kilowatt-hour passes. Appendix A.3 makes this a rule rather than a caveat." },
];

function Section8() {
  return (
    <Sec id="section-8">
      <h2>8. The missing meter</h2>

      <InSectionTOC items={[
        { id: "s8-problem",   label: "The strangest fact about a trillion-dollar industry" },
        { id: "s8-prior-art", label: "The prior art, and which leg each one amputates" },
        { id: "s8-calculator", label: "The inversion: same model, opposite rankings" },
      ]} />

      <AnchorH3 id="s8-problem">The strangest fact about a trillion-dollar industry</AnchorH3>
      <p>
        AI cannot say what its output costs. As of mid-2026 there exists no standardized,
        cross-vendor unit of account that expresses dollars per unit of verified useful work,
        conditioned on a stated service-level objective and a quality floor, governed by a
        multi-party body, and adopted in production pricing or disclosure.
      </p>
      <p>
        Compute is bought in GPU-hours. It is consumed as answered queries, completed tasks,
        resolved tickets, and generated tokens, each under a latency constraint that determines
        whether the output was worth anything at all: a voice agent's reply that arrives in 200
        milliseconds is a product, and the same reply in four seconds is a refund. Between the
        GPU-hour on the invoice and the useful-work-under-a-deadline on the income statement, there
        is no standard unit.
      </p>
      <blockquote>
        <p>
          Dollars per million tokens is the leading candidate and the industry's de facto price
          sheet, but a raw token is a kilowatt-hour with no voltage standard: tokens vary in quality
          (which model, verified against what), in urgency (batch overnight or interactive p99), and
          in usefulness (a token of correct answer and a token of hallucination invoice identically).
        </p>
      </blockquote>
      <p>
        The historical sequence is exact enough to be a specification. Before Insull's meter,
        electricity was priced per lamp: a flat fee per connected bulb, whatever it consumed —
        exactly as AI subscriptions today price per seat whatever the seat consumes. Per-lamp
        pricing made load invisible, so plants ran at 6 percent utilization, so capital costs stayed
        brutal, so electricity stayed a luxury. The demand meter made consumption visible; visibility
        revealed that customers peak at different hours; diversity of peaks meant the same turbine
        could serve the factory by day and the streetcar by night; load factor became the metric
        that turned utilization into strategy; and the price fell 87 percent while the market grew
        40-fold. The meter did not record the business. The meter created the business.
      </p>
      <p>
        AI's equivalent unit must denominate what the buyer actually buys, and what the buyer buys
        has three legs: cost, useful output, and a service-level condition. This paper names that
        unit the <strong>served token</strong>, abbreviated <em>svt</em>, and specifies it in
        Appendix A: one output token delivered inside its SLO and above its quality floor.
      </p>

      <AnchorH3 id="s8-prior-art">The prior art, and which leg each one amputates</AnchorH3>
      <p>
        The industry and the standards bodies have built every leg of the meter separately, which
        makes the survey of near-misses the strongest evidence that the fused unit is missing rather
        than impossible. Each candidate below is real, useful, and incomplete in a specific,
        documentable way.
      </p>
      <p>
        <strong>The obvious objection is that dollars per million tokens is already good enough.</strong>{" "}
        It is not, for a precise reason. In 2026, one major lab changed its tokenizer; measured
        costs on identical prompts moved by double-digit percentages with no change in the
        underlying work.
        <Footnote n={59}>The tokenizer change and its pricing effect: Artificial Analysis, "Tokenizer Comparison Report," March 2026. The lab is not named because the change was not publicly announced as a pricing event; the effect was discovered by third-party benchmarkers.</Footnote>{" "}
        The kilowatt-hour is defined by physics; it does not change when the utility upgrades its
        meters. A unit that changes when the vendor changes its implementation is not a unit. It is
        a price list in disguise.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0", margin: "1.5rem 0", border: "1px solid var(--rule)", borderRadius: 8, overflow: "hidden" }}>
        {PRIOR_ART.map((item, i) => (
          <div
            key={item.name}
            style={{
              padding: "1rem 1.25rem",
              borderBottom: i < PRIOR_ART.length - 1 ? "1px solid var(--rule)" : "none",
              background: i % 2 === 0 ? "var(--paper)" : "var(--surface)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--amber-dark)",
                background: "rgba(212,160,23,0.1)",
                padding: "0.15rem 0.5rem",
                borderRadius: 2,
                fontFamily: "Inter, sans-serif",
                /* Allow wrapping on mobile — no whiteSpace:nowrap */
                wordBreak: "break-word",
                overflowWrap: "break-word",
                alignSelf: "flex-start",
                display: "inline-block",
                maxWidth: "100%",
              }}>
                missing: {item.missing}
              </span>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13.5px", color: "var(--ink)", margin: 0 }}>
                {item.name}
              </p>
            </div>
            <p style={{ fontSize: "13px", color: "var(--ink-mid)", lineHeight: 1.65, margin: "0.4rem 0 0" }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "13.5px", lineHeight: 1.7, color: "var(--ink-mid)", fontStyle: "italic", borderLeft: "2px solid var(--rule)", paddingLeft: "1rem", margin: "1.5rem 0" }}>
        TPC has price and correctness without the deadline. TPCx-AI has price without the deadline.
        MLPerf has the deadline and the quality floor without price. Goodput has the deadline without
        either. FOCUS has the money without the work. OpenTelemetry has the counting without the
        price, and cannot resolve the tightest deadlines. SPECpower and SCI have the rate form with
        a different numerator. Every leg is measured somewhere by someone competent, priced nowhere
        in common, and no congress has been convened.
      </p>

      <AnchorH3 id="s8-calculator">The inversion: same model, opposite rankings</AnchorH3>
      <p>
        The same open-weight model served by fifteen providers inverts in cost-effectiveness
        depending on the workload's latency requirement. The cheap-but-slow provider delivers zero compliant output for the latency-strict workload —
        its cost per served token is undefined — and wins decisively for the batch workload. Toggle the workload to see the inversion:
      </p>
      <ServedTokenCalculator />
    </Sec>
  );
}

/* ─── Section 9 ─────────────────────────────────────────────────────────────── */

const REQUIREMENTS = [
  { n: "1", title: "A unit of account with three legs", body: "Cost, verified output, service level: dollars per unit of useful work at a stated latency percentile and quality floor. Defined by an open specification, measurable by independent parties with published methodology, and stated with provenance. The unit that wins will be boring, auditable, and slightly too conservative, because the kWh and the TEU were." },
  { n: "2", title: "Meters before markets", body: "An instrumentation layer that measures delivered work under real workloads, as distinct from benchmark performance under ideal ones. Load factor's AI analogue — delivered-useful-work over provisioned-capacity — becomes the operator's core metric. The silicon layer has already begun competing on it: new inference architectures marketed in 2026 claim model FLOPs utilization above 80 percent against the 20 to 50 percent GPUs typically deliver, and their designers' framing — that the unit of analysis is the cluster rather than the chip — is the load-factor argument restated in hardware. Measurement is being bought and sold; it is not yet being standardized." },
  { n: "3", title: "Routing as load balancing", body: (<>Once work is metered in a common unit, placement becomes an optimization: which model, which silicon, which region, which batch window, subject to the task's deadline. The demand-diversity arbitrage is now quantified rather than asserted: Mooncake, the serving platform behind Kimi, replayed real traces across twenty nodes in each configuration. Roughly 100 percent of requests met the time-between-tokens objective under the disaggregated placement against 57 percent under the coupled baseline, and the platform served approximately 75 percent more requests within the same objectives<Footnote n={88}>R. Qin et al., “Mooncake: A KVCache-centric Disaggregated Architecture for LLM Serving,” arXiv:2407.00079v4, 2025. Production traces (23,608 long-context and 12,031 conversation requests) released at github.com/kvcache-ai/Mooncake. The 75 percent throughput improvement and 100 vs. 57 percent SLO attainment figures are from the replay experiment reported in Section 6 of that paper.</Footnote> — identical spend, identical silicon, a 1.75-fold difference in compliant work, produced entirely by placement. Dollars per GPU-hour is exactly equal across that comparison. The served token is the quantity in which the difference is denominated.</>) },
  { n: "4", title: "Honest depreciation, denominated in the unit", body: "Assets carried at the value of the useful work they can still deliver, disclosed by asset class rather than blended. This is the answer to Burry that the hyperscalers cannot currently give, because giving it requires the meter." },
  { n: "5", title: "Protocols owned by no one", body: "The coordination layer is only valuable if it is universal, and only universal if no one owns it. The historical instruction is uniform: interchange worked because Hock's consortium prevented any member from owning the rules; TCP/IP beat better-funded proprietary stacks because it had no owner to distrust." },
];

function Section9() {
  return (
    <Sec id="section-9">
      <h2>9. What the efficiency era requires</h2>
      <p>Prescriptively, and in the order the history suggests:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0", margin: "1.5rem 0", border: "1px solid var(--rule)", borderRadius: 8, overflow: "hidden" }}>
        {REQUIREMENTS.map((req, i) => (
          <div
            key={req.title}
            style={{
              display: "flex",
              gap: "1.25rem",
              padding: "1.1rem 1.25rem",
              borderBottom: i < REQUIREMENTS.length - 1 ? "1px solid var(--rule)" : "none",
              background: i % 2 === 0 ? "var(--paper)" : "var(--surface)",
              alignItems: "flex-start",
            }}
          >
            <div style={{
              flexShrink: 0,
              width: 26,
              height: 26,
              borderRadius: 3,
              background: "var(--amber)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              marginTop: "2px",
            }}>
              {req.n}
            </div>
            <div>
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "var(--ink)", marginBottom: "0.2rem" }}>
                {req.title}
              </p>
              <p style={{ fontSize: "13.5px", color: "var(--ink-mid)", lineHeight: 1.65, margin: 0 }}>
                {req.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Sec>
  );
}

/* ─── Section 10 — Predictions ──────────────────────────────────────────────── */
function Section10() {
  return (
    <Sec id="section-10">
            <h2>10. Eight predictions</h2>
      <InSectionTOC items={[
        { id: "pred-p1", label: "P1 — Open-weight token share" },
        { id: "pred-p2", label: "P2 — The unit emerges" },
        { id: "pred-p2b", label: "P2b — The original unit as written" },
        { id: "pred-p3", label: "P3 — Depreciation converges downward" },
        { id: "pred-p4", label: "P4 — The correction, and the survival" },
        { id: "pred-p5", label: "P5 — Second-life silicon clears" },
        { id: "pred-p6", label: "P6 — Routing becomes a line item" },
        { id: "pred-p7", label: "P7 — The value migration itself" },
        { id: "pred-p8", label: "P8 — The measurement bus learns to see" },
      ]} />
      <p>
        A thesis that cannot lose is not a thesis. Eight dated, checkable predictions, with the
        conditions under which this paper is wrong. Prediction 3 is currently half met.
      </p>
      <PredictionScoreboard />
      <DepreciationTable />
    </Sec>
  );
}

/* ─── Section 11 ─────────────────────────────────────────────────────────────── */
function Section11() {
  return (
    <Sec id="section-11">
      <h2>11. The implication, stated in full</h2>
      <p>
        The Transformer paper closed by noting the authors were excited to apply attention to other
        tasks, eight sentences before the architecture that would reorganize a trillion dollars of
        capital. Underclaiming is the characteristic failure of correct papers, so, against that
        precedent, the implication of this one stated without hedge:
      </p>
      <blockquote>
        <p>
          If the pattern holds, the most valuable layer in artificial intelligence will not be the
          models and will not be the chips. It will be the layer that measures, prices, and routes
          intelligence as work: the interchange, the meter, and the dispatcher, fused. That layer
          does not exist yet. Its unit does not exist yet. The protocols beneath it arrived in the
          last eighteen months, the buyers began demanding it this year, and every prior
          infrastructure cycle produced exactly one such layer, within a decade of its turning
          point, operated by an institution that did not exist at the peak of the frenzy.
        </p>
      </blockquote>
      <p>
        Visa's predecessor was founded in 1970, twelve years after the Fresno drop, in the wreckage
        of the card mania. AWS launched in 2006, six years after the NASDAQ peak, on hardware
        economics the crash created. The equivalent institution for intelligence is being founded,
        by someone, now.
      </p>
      <p>
        The historical record adds one more regularity, and it is the one this document exists to
        exploit: at every prior turning point there was a memo. The proposal marked "vague but
        exciting," the internal warning about a tidal wave, the nine pages from a pseudonym. None
        of them were early; Berners-Lee wrote fifteen years after TCP/IP's design, Satoshi
        twenty-six years after Chaum's first digital-cash paper, and it did not matter, because the
        leverage was never in being first to the technology. It was in being first to state, plainly
        and falsifiably, which layer the value was about to move to, and to build the boring
        instrument that let everyone else see it move.
      </p>
      <p style={{ fontWeight: 500, color: "var(--ink)" }}>
        Railways got a clearing house. Power got a meter. Freight got a box. Money got interchange.
        Packets got a protocol.
      </p>
      <p style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "1.2rem",
        fontStyle: "italic",
        fontWeight: 400,
        color: "var(--ink)",
        marginTop: "1.5rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid var(--rule)",
      }}>
        Intelligence gets a meter next. The only open questions are whose, and whether it is neutral before it is bundled.
      </p>
    </Sec>
  );
}

/* ─── Closing Section ───────────────────────────────────────────────────────── */
function ClosingSection() {
  return (
    <Sec id="closing">
      <div style={{
        padding: "3rem 0 2rem",
        borderTop: "2px solid var(--ink)",
      }}>
        {/* Meter calibration strip */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", marginBottom: "2rem" }}>
          {[3, 6, 9, 12, 9, 6, 3, 6, 9, 12, 9, 6, 3, 6, 9, 12, 9, 6, 3].map((h, i) => (
            <span key={i} style={{
              display: "inline-block",
              width: "2px",
              height: `${h}px`,
              background: i === 9 ? "var(--amber)" : "var(--ink-light)",
              borderRadius: "1px",
              flexShrink: 0,
            }} />
          ))}
        </div>

        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(1.05rem, 2vw, 1.2rem)",
          lineHeight: 1.75,
          color: "var(--ink)",
          maxWidth: "60ch",
          marginBottom: "1.5rem",
        }}>
          The meter will be built. Every prior infrastructure built one. The question is not whether
          it arrives but who builds it, what it measures, and whether the institution that operates
          it is accountable to the market or to the infrastructure it prices.
        </p>

        <p style={{
          fontSize: "15px",
          lineHeight: 1.8,
          color: "var(--ink-mid)",
          maxWidth: "60ch",
          marginBottom: "1.5rem",
        }}>
          The served token is a proposal, not a standard. It is offered as a draft for public
          comment, amendment, or replacement. The specification in Appendix A is deliberately boring.
          The kilowatt-hour is boring. The TEU is boring. The interchange rate is boring. That is
          what made each of them work: they were too simple to argue with and too useful to ignore.
          The unit that wins will be the one that is easiest to audit, not the one that is most
          elegant to describe.
        </p>

        <p style={{
          fontSize: "15px",
          lineHeight: 1.8,
          color: "var(--ink-mid)",
          maxWidth: "60ch",
          marginBottom: "2rem",
        }}>
          If this paper is wrong, the kill criterion is in Section 10. If it is right, the
          predictions will resolve by 2030, and the institution that built the meter will be worth
          more than the institutions that built the infrastructure it measures. That is not a
          prediction about AI. It is a description of how infrastructure transitions have ended,
          every time, without exception, since 1771.
        </p>

        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.1rem",
          fontStyle: "italic",
          color: "var(--ink)",
          borderLeft: "3px solid var(--amber)",
          paddingLeft: "1.25rem",
          margin: 0,
        }}>
          The boring instrument is the one that changes everything.
        </p>
      </div>
    </Sec>
  );
}

/* ─── Appendix A ─────────────────────────────────────────────────────────────── */
function AppendixA() {
  return (
    <Sec id="appendix">
      <div style={{ marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)" }}>
          Appendix A
        </span>
      </div>
      <h2 style={{ marginTop: "0.25rem" }}>A draft specification for the unit</h2>
      <InSectionTOC items={[
        { id: "appendix-a1", label: "A.1 Scope and design goals" },
        { id: "appendix-a2", label: "A.2 Definitions" },
        { id: "appendix-a3", label: "A.3 The unit" },
        { id: "appendix-a4", label: "A.4 The conditioning tuple" },
        { id: "appendix-a5", label: "A.5 Pre-registration rule" },
        { id: "appendix-a6", label: "A.6 Provenance taxonomy" },
        { id: "appendix-a7", label: "A.7 Conforming record" },
        { id: "appendix-a8", label: "A.8 Governance" },
        { id: "appendix-a9", label: "A.9 Worked example" },
        { id: "appendix-a10", label: "A.10 What this specification excludes" },
      ]} />
      <p>
        <em>Status: draft for public comment. This appendix is deliberately boring. The kilowatt-hour is boring. That is what made it work.</em>
      </p>

      <ProvenanceLegend />
      <h3 id="appendix-a1" style={{ scrollMarginTop: "110px" }}>A.1 Scope and design goals</h3>
      <p>
        This appendix specifies a unit of account for machine intelligence delivered as a service,
        and the measurement rules without which the unit is meaningless. Design goals, in priority
        order: the unit must denominate what the buyer buys rather than what the seller owns; two
        parties with the same inputs must compute the same number; every number must carry its
        provenance; and no single vendor may control the definition. The unit is designed to be
        computed today from data that already exists.
      </p>

      <h3 id="appendix-a2" style={{ scrollMarginTop: "110px" }}>A.2 Definitions</h3>
      <p>
        A <strong>task</strong> is a request with a defined acceptable output. A{" "}
        <strong>quality floor</strong> is the acceptance test for that output, declared before
        measurement. A <strong>service-level objective (SLO)</strong> is the latency contract under
        which output has value, stated as percentile bounds on time-to-first-token (TTFT) and
        time-per-output-token (TPOT). <strong>Compliant work</strong> is output that passes the
        quality floor and meets every term of the SLO. Output that fails either is not discounted
        work; it is zero work that was paid for.
      </p>

      <h3 id="appendix-a3" style={{ scrollMarginTop: "110px" }}>A.3 The unit</h3>
      <p>
        The cost of useful work over a window is measured in <strong>served tokens (svt)</strong>,
        the unit this paper proposes. One served token is one output token delivered within the
        stated SLO and above the quality floor; a token emitted late, or wrong, is not a served
        token. The cost of useful work is then:
      </p>
      <div style={{
        background: "var(--surface-dark)",
        borderRadius: 6,
        padding: "1rem 1.5rem",
        margin: "1rem 0",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: "13.5px",
        color: "var(--paper)",
        lineHeight: 1.7,
      }}>
        <p style={{ margin: "0 0 0.5rem" }}>cost_per_svt = total_spend / served_tokens</p>
        <p style={{ margin: "0 0 0.5rem", color: "rgba(245,242,238,0.6)" }}>where:</p>
        <p style={{ margin: "0 0 0.25rem", paddingLeft: "1rem" }}>served_tokens = Σ(output_tokens_i × compliant_i)</p>
        <p style={{ margin: 0, paddingLeft: "1rem" }}>compliant_i = 1 iff quality_i ≥ floor AND latency_i ≤ SLO</p>
      </div>

      <h3 id="appendix-a4" style={{ scrollMarginTop: "110px" }}>A.4 The conditioning tuple</h3>
      <p>
        A value of C is non-conforming and undefined unless stated with all six of: (1) workload
        — the trace or trace-class measured; (2) model artifact — weights, version, quantization,
        and tokenizer, explicitly; (3) placement — provider or self-host, silicon, region, batching
        policy, and offered load; (4) service-level objective — the percentile bounds, stated
        numerically; (5) quality floor — the acceptance test, stated operationally, with the
        evaluated fraction; and (6) window — start, end, and sustained load, with figures reported
        at declared percentiles. The window must be long relative to the system's own response time
        and stationary within itself. A conforming record reports window length divided by measured
        p99 request latency, and a split-half comparison of C over the first and second halves.
        Where the halves differ by more than ten percent, the window is non-stationary, C describes
        a transient rather than a placement, and the record is marked accordingly.
      </p>
      <h3 id="appendix-a5" style={{ scrollMarginTop: "110px" }}>A.5 Pre-registration rule</h3>
      <p>
        The workload scope and objective are declared before measurement, and results are reported
        for the declared scope and for the aggregate, both. Scope declared after the fact is
        selection, not measurement. This rule exists because it is the one every party will be
        tempted to break, and because the difference between a scoped number and an aggregate
        number, honestly co-reported, is itself diagnostic information about where a placement fails.
      </p>
      <h3 id="appendix-a6" style={{ scrollMarginTop: "110px" }}>A.6 Provenance taxonomy</h3>
      <p>
        Every figure in a conforming record carries exactly one label: [MEASURED], observed on the
        declared workload in the declared window; [CONFIG], read from configuration rather than
        observed; [SPEC], taken from a datasheet or published price list; [SIM], produced by a
        model of the system; or [EST], judgment. Two rules complete the taxonomy. Inheritance: a
        derived figure carries the weakest label among its inputs. The red line: a comparison
        between placements may be labeled measured only if every side of it is measured; a measured
        number divided by a simulated one is a simulation, and presenting it otherwise is the
        accounting fog reproduced at the level of a single line item.
      </p>
      <h3 id="appendix-a7" style={{ scrollMarginTop: "110px" }}>A.7 Conforming record</h3>
      <p>
        A conforming measurement is publishable as one row: the six-field tuple, S, W, C, the
        provenance label of each, and the measuring party. Three further fields are required: an
        interval on C (derived from the Wilson score interval on the compliance rate, propagated
        through the reciprocal — a record reporting C as a scalar is non-conforming); a sensitivity
        curve sweeping the objective across a declared range and reporting compliance and C at each
        point; and a margin to the objective (the ratio of measured percentile to bound, for
        time-to-first-token and time-per-output-token — a placement compliant at 0.99 of its bound
        and one compliant at 0.40 report the same C and are not the same asset).
      </p>
      <SensitivityCurve />
      <h3 id="appendix-a8" style={{ scrollMarginTop: "110px" }}>A.8 Governance</h3>
      <p>
        The specification succeeds only if no one owns it. The historical instruction is uniform:
        interchange worked because Hock's consortium prevented any member from owning the rules;
        TCP/IP beat better-funded proprietary stacks because it had no owner to distrust; TPC's
        price-performance metrics are trusted across four decades of adversarial vendor competition
        because the pricing rules and the audit are the consortium's and not the submitter's; and
        MCP's donation to a neutral foundation followed the same logic. This draft is offered
        accordingly, for adoption, amendment, or replacement by any multi-party body that preserves
        A.3 through A.7. The two bodies best positioned are named in Prediction 2.
      </p>

      <h3 id="appendix-a9" style={{ scrollMarginTop: "110px" }}>A.9 Worked example, entirely from public data</h3>
      <p>
        The same open-weight model (Llama 3.3 Instruct 70B) is served by 15 providers. The public
        price spread is 8.6×: $0.12 per million blended tokens at the cheapest (fp8 quantized)
        to $1.05 at the most expensive. Throughput spreads further: 15.2 tokens per second at the
        cheapest against 329.6 tokens per second at the fastest. Expand each step below to follow
        the tuple from declaration to C.
      </p>
      <WorkedExampleAccordion />
      <p>
        Same weights, same input, opposite rankings, and the inversion is invisible to both metrics
        the industry currently prices with. The spread between those two correct answers — a factor
        of five on identical work — is the routing margin of Section 9, computed from nothing but
        public numbers. One further detail the tuple forces into the open: the cheapest artifact is
        fp8-quantized, so the two buyers are not entitled to assume the same quality floor until it
        is declared and tested, which under A.4 they must state, and under current market convention
        they are never asked to.
      </p>

      <h3 id="appendix-a10" style={{ scrollMarginTop: "110px" }}>A.10 What this specification excludes, knowingly</h3>
      <p>
        Multi-tenant attribution of S is no longer excluded. Two bases are defensible and they
        bracket the honest answer. Under reserved share, spend is attributed in proportion to
        reserved capacity, which charges idle reserved capacity to the tenant that reserved it;
        this is the correct basis under a reservation and the conservative one. Under token share,
        spend is attributed in proportion to realized compliant output, which ignores idle capacity
        entirely and is a strict lower bound. A conforming record reports C on both bases and names
        which it uses. The gap between them is not noise to be eliminated. It is the tenant's own
        load factor restated in dollars, and it is diagnostic in exactly the way Section 4's
        diversity factor was.
      </p>
      <OpenProblemsAccordion />
      <p>
        Each is a reason this appendix is a draft. None is a reason the unit cannot be computed
        today, because A.9 just computed it.
      </p>
    </Sec>
  );
}
