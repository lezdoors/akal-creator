import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const STEP_KEYS = ['audit', 'fix', 'scale'];

export const Process: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 px-6 md:px-10 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('process.label')}</p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">{t('process.title')}</h2>
        </div>

        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-[1px] bg-border">
          {STEP_KEYS.map((key, i) => (
            <div
              key={key}
              className="bg-background p-8 md:p-10 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-accent text-3xl font-medium mb-4 block">{t(`process.steps.${key}.num`)}</span>
              <h3 className="text-foreground text-xl font-medium mb-3">{t(`process.steps.${key}.title`)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(`process.steps.${key}.desc`)}</p>
            </div>
          ))}
        </div>

        {/* Mobile: accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible defaultValue="audit">
            {STEP_KEYS.map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="text-foreground text-base hover:no-underline">
                  <span className="flex items-center gap-3">
                    <span className="text-accent font-medium">{t(`process.steps.${key}.num`)}</span>
                    {t(`process.steps.${key}.title`)}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {t(`process.steps.${key}.desc`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
