import React, { useEffect, useState } from 'react';

interface MobileStickyCTAProps {
  onBookCall: () => void;
}

/**
 * Mobile action bar. Two actions: read the price, or start.
 * Hairline top rule only — no shadow, no blur panel, no radius.
 * Copy lives inline; i18n is retired.
 *
 * Hidden until the hero has scrolled past. Two reasons, one of them a real bug:
 * the hero already carries "Start a campaign", so pinning a duplicate over it
 * is noise — and at 390x844 the bar sat directly on top of the ledger's budget
 * slider, so the first thing a visitor tried to drag was intercepted by a
 * button. Verified with elementFromPoint, not by eye.
 */
export const MobileStickyCTA: React.FC<MobileStickyCTAProps> = ({ onBookCall }) => {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Reveal once the hero's own CTA is well out of view.
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 1.15);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background border-t border-border
                  transition-[opacity,transform] duration-300 ease-out
                  ${shown ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-full'}`}
      role="complementary"
      aria-label="Quick actions"
      aria-hidden={!shown}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] min-w-0">
        <a
          href="#pricing"
          tabIndex={shown ? 0 : -1}
          className="flex items-center justify-center px-5 py-2.5 border border-foreground/20 text-[11px] uppercase tracking-[0.15em] font-semibold text-foreground hover:bg-foreground/5 transition-colors shrink-0"
        >
          Pricing
        </a>
        <button
          type="button"
          onClick={onBookCall}
          tabIndex={shown ? 0 : -1}
          className="flex-1 min-w-0 flex items-center justify-center gap-2 py-2.5 bg-foreground text-background text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Start a campaign
        </button>
      </div>
    </div>
  );
};
