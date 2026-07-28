import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface MobileStickyCTAProps {
  onBookCall: () => void;
}

export const MobileStickyCTA: React.FC<MobileStickyCTAProps> = ({ onBookCall }) => {
  const { getLocalizedPath, t } = useTranslation();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-foreground/10 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
      role="complementary"
      aria-label={t('mobileCTA.aria') || 'Quick actions'}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <Link
          to={getLocalizedPath('/services')}
          className="flex items-center justify-center px-5 py-2.5 border border-foreground/20 text-[11px] uppercase tracking-[0.15em] font-semibold text-foreground hover:bg-foreground/5 transition-colors shrink-0"
        >
          {t('mobileCTA.services') || 'Services'}
        </Link>
        <button
          type="button"
          onClick={onBookCall}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-foreground text-background text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Calendar className="h-4 w-4" />
          {t('mobileCTA.bookCall') || 'Book a call'}
        </button>
      </div>
    </div>
  );
};
