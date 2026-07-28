import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const REASON_KEYS = ['senior', 'noFluff', 'results', 'founder'];

export const WhyLatitude: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('why.label')}</p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">{t('why.title')}</h2>
        </div>

        {/* Desktop: 2x2 grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-[1px] bg-border">
          {REASON_KEYS.map((key, i) => (
            <div
              key={key}
              className="bg-background p-8 md:p-10 animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <h3 className="text-foreground text-lg font-medium mb-3">{t(`why.items.${key}.title`)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(`why.items.${key}.desc`)}</p>
            </div>
          ))}
        </div>

        {/* Mobile: accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible defaultValue="senior">
            {REASON_KEYS.map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-foreground text-base hover:no-underline">
                  {t(`why.items.${key}.title`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t(`why.items.${key}.desc`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
