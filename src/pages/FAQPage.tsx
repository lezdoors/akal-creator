import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { useTranslation } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { t } = useTranslation();

  // FAQ items are an array — access by index
  const faqCount = 7;

  return (
    <>
      <SEOHead
        title={t('seo.faqTitle')}
        description={t('seo.faqDesc')}
        keywords={t('seo.faqKeywords')}
      />
      <Navbar onBookCall={openBooking} />
      <main>
        <section className="pt-28 pb-20 md:pt-36 md:pb-28 px-6 md:px-10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('faq.label')}</p>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground">{t('faq.title')}</h1>
            </div>

            <Accordion type="single" collapsible className="border-t border-border">
              {Array.from({ length: faqCount }, (_, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border">
                  <AccordionTrigger className="text-foreground text-sm font-medium py-5 hover:no-underline">
                    {t(`faq.items.${i}.q`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                    {t(`faq.items.${i}.a`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-16 text-center border-t border-border pt-12">
              <p className="text-muted-foreground text-sm mb-4">{t('faq.stillHaveQuestions')}</p>
              <button
                onClick={openBooking}
                className="bg-foreground text-background text-[11px] uppercase tracking-[0.15em] px-8 py-3.5 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {t('nav.bookCall')}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer onBookCall={openBooking} />
      <BookingSheet isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
};

export default FAQPage;
