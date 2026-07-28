import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';

const SERVICE_KEYS = ['paidMedia', 'campaign', 'creative', 'conversion', 'growth', 'analytics'];

export const Services: React.FC = () => {
  const { t, getLocalizedPath } = useTranslation();

  return (
    <section id="services" className="py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('services.label')}</p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">{t('services.title')}</h2>
          </div>
          <Link
            to={getLocalizedPath('/services')}
            className="hidden md:inline-block text-[11px] uppercase tracking-[0.15em] text-foreground border-b border-foreground pb-0.5 hover:text-accent hover:border-accent transition-colors"
          >
            {t('services.viewAll')} →
          </Link>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
          {SERVICE_KEYS.map((key, i) => (
            <Link
              key={key}
              to={getLocalizedPath('/services')}
              className="group bg-background p-8 md:p-10 animate-fade-in hover:bg-accent/5 transition-colors"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <h3 className="text-foreground text-lg font-medium mb-3 group-hover:text-accent transition-colors">
                {t(`services.items.${key}.title`)}
                <span className="inline-block ml-2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true">→</span>
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(`services.items.${key}.desc`)}</p>
            </Link>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden -mx-6 px-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 w-max pb-4">
            {SERVICE_KEYS.map((key) => (
              <Link
                key={key}
                to={getLocalizedPath('/services')}
                className="w-[280px] shrink-0 border border-border bg-background p-6"
              >
                <h3 className="text-foreground text-lg font-medium mb-3">{t(`services.items.${key}.title`)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(`services.items.${key}.desc`)}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <Link
            to={getLocalizedPath('/services')}
            className="text-[11px] uppercase tracking-[0.15em] text-foreground border-b border-foreground pb-0.5 hover:text-accent hover:border-accent transition-colors"
          >
            {t('services.viewAllMobile')} →
          </Link>
        </div>
      </div>
    </section>
  );
};
