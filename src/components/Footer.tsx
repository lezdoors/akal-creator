import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onBookCall?: () => void;
}

/** Copy lives inline. i18n is retired — do not reintroduce locale keys. */
export const Footer: React.FC<FooterProps> = ({ onBookCall }) => (
  <footer className="border-t border-border bg-background">
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
