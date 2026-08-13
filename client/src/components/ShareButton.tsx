// ShareButton — polished interactive social sharing
// Desktop: sticky right-side panel with smooth hover animations and descriptive tooltips
// Mobile: floating action button (bottom-right) that expands into a share menu
// Keyboard accessible, amber accent on active/copied state

import { useState, useCallback, useEffect, useRef } from "react";
import { Share2, Twitter, Linkedin, Link, Mail, Check, X as XIcon } from "lucide-react";

const SITE_URL = "https://missingmeter-uiqqchx2.manus.space";
const SHARE_TITLE = "The Missing Meter — What every infrastructure buildout leaves behind, and the unit AI still lacks";
const SHARE_TEXT = "AI is the first trillion-dollar infrastructure that cannot yet state, in a standard unit, what its output costs. A new paper by Sidney Scott.";

function getShareUrl() {
  if (typeof window !== "undefined") return window.location.href;
  return SITE_URL;
}

interface ShareAction {
  label: string;
  shortLabel: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  description: string;
}

export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const shareUrl = getShareUrl();
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(SHARE_TITLE)}&body=${encodeURIComponent(SHARE_TEXT + "\n\n" + shareUrl)}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement("input");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [shareUrl]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const actions: ShareAction[] = [
    {
      label: "Share on X / Twitter",
      shortLabel: "X",
      href: twitterUrl,
      icon: <Twitter size={15} strokeWidth={2} />,
      description: "Post to X (Twitter)",
    },
    {
      label: "Share on LinkedIn",
      shortLabel: "LinkedIn",
      href: linkedinUrl,
      icon: <Linkedin size={15} strokeWidth={2} />,
      description: "Share on LinkedIn",
    },
    {
      label: "Share by email",
      shortLabel: "Email",
      href: emailUrl,
      icon: <Mail size={15} strokeWidth={2} />,
      description: "Send via email",
    },
    {
      label: copied ? "Link copied!" : "Copy link",
      shortLabel: copied ? "Copied!" : "Copy",
      onClick: handleCopy,
      icon: copied ? <Check size={15} strokeWidth={2.5} /> : <Link size={15} strokeWidth={2} />,
      description: copied ? "Link copied to clipboard!" : "Copy link to clipboard",
    },
  ];

  return (
    <>
      {/* ── Desktop: sticky right-side widget ── */}
      <div
        ref={panelRef}
        role="group"
        aria-label="Share this paper"
        className="share-side-widget"
        style={{
          position: "fixed",
          right: "1.25rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.35rem",
        }}
      >
        {/* Expanded action panel */}
        {open && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              animation: "shareExpand 200ms cubic-bezier(0.23,1,0.32,1) both",
            }}
          >
            {actions.map((action, i) => (
              action.href ? (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={action.label}
                  className="share-icon-btn"
                  style={{
                    ...iconBtnStyle,
                    animationDelay: `${i * 30}ms`,
                    animation: "shareItemIn 200ms cubic-bezier(0.23,1,0.32,1) both",
                    background: "var(--paper)",
                    color: "var(--ink-mid)",
                  }}
                  onClick={() => setOpen(false)}
                >
                  {action.icon}
                  <span className="share-tooltip" role="tooltip">{action.description}</span>
                </a>
              ) : (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  aria-label={action.label}
                  className="share-icon-btn"
                  style={{
                    ...iconBtnStyle,
                    cursor: "pointer",
                    border: "none",
                    animationDelay: `${i * 30}ms`,
                    animation: "shareItemIn 200ms cubic-bezier(0.23,1,0.32,1) both",
                    background: copied ? "var(--amber)" : "var(--paper)",
                    color: copied ? "#fff" : "var(--ink-mid)",
                    transition: "background 200ms ease-out, color 200ms ease-out, transform 120ms ease-out, box-shadow 120ms ease-out",
                  }}
                >
                  {action.icon}
                  <span className="share-tooltip" role="tooltip">{action.description}</span>
                </button>
              )
            ))}
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={open ? "Close share menu" : "Share this paper"}
          className="share-toggle-btn"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: open ? "var(--ink)" : "var(--paper)",
            border: "1px solid var(--rule)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: open ? "var(--paper)" : "var(--ink-mid)",
            transition: "background 180ms ease-out, color 180ms ease-out, transform 120ms ease-out, box-shadow 180ms ease-out",
          }}
        >
          <span style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 200ms cubic-bezier(0.23,1,0.32,1)",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
          }}>
            {open ? <XIcon size={15} /> : <Share2 size={15} />}
          </span>
        </button>
      </div>


      <style>{`
        @keyframes shareExpand {
          from { opacity: 0; transform: translateY(10px) scale(0.93); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shareItemIn {
          from { opacity: 0; transform: translateX(8px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }

        /* Desktop widget: visible on desktop only */
        .share-side-widget { display: flex; }
        @media (max-width: 640px) {
          .share-side-widget { display: none !important; }
        }
        @media (max-width: 1100px) {
          .share-side-widget { right: 0.5rem; }
        }

        /* Desktop icon button hover/active */
        .share-icon-btn {
          position: relative;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 120ms ease-out, color 120ms ease-out, transform 120ms ease-out, box-shadow 120ms ease-out;
        }
        .share-icon-btn:hover {
          background: var(--surface, #f0ede8) !important;
          color: var(--ink) !important;
          transform: scale(1.10) translateX(-2px) !important;
          box-shadow: 0 3px 12px rgba(0,0,0,0.13) !important;
        }
        .share-icon-btn:active {
          transform: scale(0.94) !important;
        }
        .share-icon-btn:focus-visible {
          outline: 2px solid var(--amber);
          outline-offset: 2px;
        }

        /* Tooltip — appears to the left of the button */
        .share-tooltip {
          position: absolute;
          right: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%) translateX(4px);
          background: var(--ink);
          color: var(--paper);
          font-family: Inter, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
          white-space: nowrap;
          padding: 4px 9px;
          border-radius: 5px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 140ms ease-out, transform 140ms ease-out;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .share-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 4px solid transparent;
          border-left-color: var(--ink);
        }
        .share-icon-btn:hover .share-tooltip,
        .share-icon-btn:focus-visible .share-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        /* Toggle button hover */
        .share-toggle-btn:hover {
          box-shadow: 0 4px 18px rgba(0,0,0,0.18) !important;
          transform: scale(1.10) !important;
        }
        .share-toggle-btn:active {
          transform: scale(0.93) !important;
        }
        .share-toggle-btn:focus-visible {
          outline: 2px solid var(--amber);
          outline-offset: 2px;
        }

      `}</style>
    </>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "var(--paper)",
  border: "1px solid var(--rule)",
  boxShadow: "0 1px 5px rgba(0,0,0,0.09)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--ink-mid)",
  textDecoration: "none",
  fontSize: "13px",
  cursor: "pointer",
};

