import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onBookCall?: () => void;
}

/**
 * Copy lives inline. i18n is retired — do not reintroduce locale keys.
 *
 * The banner is the reference footer's device (a full-bleed panoramic frame
 * above the link columns) and it is the only placement on the page where a
 * 2.34:1 frame is used at its native ratio rather than cropped into a column.
 *
 * Composition rules, same as every other frame here: FULL STRENGTH, hard top
 * edge against the footer's own rule, and a gradient spent only on the bottom
 * third where the image has to hand off to the footer ground. Nothing is laid
 * over it — no copy, no scrim across the middle. A banner at reduced opacity
 * with type on top is the watermark failure, and it is not what the reference
 * does either: its `from-transparent via-transparent to-black` fades the last
 * stretch and leaves the frame alone.
 */
export const Footer: React.FC<FooterProps> = ({ onBookCall }) => (
  <footer className="border-t border-border bg-background">
    {/* Decorative: the footer reads complete without it, which is why it is
        aria-hidden and why the height drops on small screens rather than the
        image being stacked or cropped to a letterbox strip. */}
    <div aria-hidden className="relative w-full h-[180px] sm:h-[240px] md:h-[320px] overflow-hidden">
      <img
        src="/images/mo-footer.webp"
        alt=""
        loading="lazy"
        decoding="async"
        /* The ledger at rest — rows of etched glass slabs receding into black,
           the story's last beat. object-bottom keeps the near rows (where the
           etched lines read) in shot as the band shortens on mobile; the far
           rows are the ones that can be lost. */
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />
      {/* Bottom hand-off only. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-background" />
      {/* The reference lays a hairline lattice over its hero frame; used here
          it puts the one full-bleed image on the same ruled grammar as the
          document above it. Effective alpha is 0.20 × 0.14. */}
      <div className="absolute inset-0 opacity-[0.14]">
        {[25, 50, 75].map((t) => (
          <span key={`h${t}`} className="absolute inset-x-0 h-px bg-foreground/20" style={{ top: `${t}%` }} />
        ))}
        {[12.5, 25, 37.5, 50, 62.5, 75, 87.5].map((l) => (
          <span key={`v${l}`} className="absolute inset-y-0 w-px bg-foreground/20" style={{ left: `${l}%` }} />
        ))}
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 min-w-0">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-foreground text-[17px] font-bold tracking-[0.18em] uppercase leading-none">
              AKAL
            </span>
            <span className="num text-[10px] uppercase tracking-[0.16em] text-muted-foreground leading-none">
              / Creator
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-4 max-w-[34ch] leading-relaxed">
            Managed creator marketing for B2B SaaS and AI tools. Every placement
            tracked to clicks and signups.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-6 min-w-0">
          <ul className="space-y-2.5">
            <li>
              <Link
                to="/privacy"
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </li>
          </ul>

          {onBookCall && (
            <button
              onClick={onBookCall}
              className="self-start text-foreground text-sm underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
            >
              Start a campaign
            </button>
          )}
        </div>
      </div>
    </div>

    <div className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 min-w-0">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Operated by Akal Digital Services Ltd · Registered in England &amp;
          Wales · No. <span className="num">17229387</span>
        </p>
      </div>
    </div>
  </footer>
);
