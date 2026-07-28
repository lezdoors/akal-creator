import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

const ITEM_KEYS = ['trust.item1', 'trust.item2', 'trust.item3'];

export const TrustStrip: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-6 md:py-8 px-6 md:px-10 border-y border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
        {ITEM_KEYS.map((key, i) => (
          <React.Fragment key={key}>
            {i > 0 && <span className="hidden md:inline-block w-px h-4 bg-border mx-8" aria-hidden="true" />}
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground text-center">
              {t(key)}
            </p>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
