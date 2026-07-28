import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';

interface CaseStudiesProps {
  onBookCall: () => void;
}

const STUDY_KEYS = ['saas', 'ecommerce', 'b2b'];

export const CaseStudies: React.FC<CaseStudiesProps> = ({ onBookCall }) => {
  const { t, getLocalizedPath } = useTranslation();

  return (
    <section id="case-studies" className="py-20 md:py-28 px-6 md:px-10 bg-foreground text-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-background/50 mb-3">{t('cases.label')}</p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight">{t('cases.title')}</h2>
          </div>
          <Link
            to={getLocalizedPath('/case-studies')}
            className="hidden md:inline-block text-[11px] uppercase tracking-[0.15em] text-background/70 border-b border-background/40 pb-0.5 hover:text-accent hover:border-accent transition-colors"
          >
            {t('cases.viewAll')} →
          </Link>
        </div>

        <div className="divide-y divide-background/10">
          {STUDY_KEYS.map((key, i) => {
            const isEven = i % 2 === 1;
            return (
              <div
                key={key}
                className={`py-10 md:py-14 flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-start animate-fade-in`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Text side */}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-accent mb-3 block">
                    {t(`cases.items.${key}.label`)}
                  </span>
                  <h3 className="text-xl md:text-2xl font-medium mb-4">{t(`cases.items.${key}.headline`)}</h3>
                  <p className="text-background/60 text-sm leading-relaxed">{t(`cases.items.${key}.summary`)}</p>
                </div>

                {/* Metrics side — read from locale data directly */}
                <div className="flex gap-8 md:gap-12 shrink-0">
                  {/* Metrics are complex objects; use the raw data approach */}
                  {(['0', '1'] as const).map(idx => (
                    <div key={idx}>
                      <div className="text-3xl md:text-4xl font-medium text-accent">
                        {t(`cases.items.${key}.metrics.${idx}.value`)}
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.15em] text-background/50 mt-1">
                        {t(`cases.items.${key}.metrics.${idx}.label`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-background/60 text-sm">{t('cases.readyLine')}</p>
          <button
            onClick={onBookCall}
            className="bg-accent text-accent-foreground text-[11px] uppercase tracking-[0.15em] px-8 py-3.5 hover:opacity-90 transition-opacity"
          >
            {t('nav.bookCall')}
          </button>
        </div>

        <div className="mt-6 md:hidden text-center">
          <Link
            to={getLocalizedPath('/case-studies')}
            className="text-[11px] uppercase tracking-[0.15em] text-background/70 border-b border-background/40 pb-0.5 hover:text-accent hover:border-accent transition-colors"
          >
            {t('cases.viewAllMobile')} →
          </Link>
        </div>
      </div>
    </section>
  );
};
