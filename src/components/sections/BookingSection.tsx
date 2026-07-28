import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

export const BookingSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="booking" className="py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('bookingSection.label')}</p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-3">
            {t('bookingSection.title')}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto">
            {t('bookingSection.desc')}
          </p>
        </div>

        <div className="border border-border bg-background">
          <iframe
            src="https://calendly.com/ninajchapuis/30min?hide_gdpr_banner=1&background_color=faf9f5&text_color=1a1a1a&primary_color=d948ef"
            width="100%"
            height="700"
            loading="lazy"
            title={t('bookingSection.title')}
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
};
