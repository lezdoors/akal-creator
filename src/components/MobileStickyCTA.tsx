import React from 'react';

interface MobileStickyCTAProps {
  onBookCall: () => void;
}

/**
 * Mobile action bar. Two actions: read the price, or start.
 * Hairline top rule only — no shadow, no blur panel, no radius.
 * Copy lives inline; i18n is retired.
 */
export const MobileStickyCTA: React.FC<MobileStickyCTAProps> = ({ onBookCall }) => (
  <div
    className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background border-t border-border"
    role="complementary"
    aria-label="Quick actions"
  >
    <div className="flex items-center gap-2 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] min-w-0">
      <a
        href="#pricing"
        className="flex items-center justify-center px-5 py-2.5 border border-foreground/20 text-[11px] uppercase tracking-[0.15em] font-semibold text-foreground hover:bg-foreground/5 transition-colors shrink-0"
      >
        Pricing
      </a>
      <button
        type="button"
        onClick={onBookCall}
        className="flex-1 min-w-0 flex items-center justify-center gap-2 py-2.5 bg-foreground text-background text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Start a campaign
      </button>
    </div>
  </div>
);
