import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

interface FinalCTAProps {
  onBookCall: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onBookCall }) => {
  const { t } = useTranslation();

  return (
    <section className="pt-24 md:pt-32 pb-20 md:pb-28 px-6 md:px-10 bg-background text-foreground border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-7xl font-medium tracking-tighter mb-6">
          {t('cta.title')}
        </h2>
        <p className="text-muted-foreground text-base md:text-lg mb-10 leading-relaxed">
          {t('cta.sub')}
        </p>
        <button
          onClick={onBookCall}
          className="bg-accent text-accent-foreground text-[11px] uppercase tracking-[0.15em] px-10 py-4 hover:opacity-90 transition-opacity"
        >
          {t('cta.button')}
        </button>
      </div>
    </section>
  );
};
