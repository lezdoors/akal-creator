import { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { SEOHead } from '@/components/SEOHead';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/Footer';
import { useTranslation } from '@/contexts/LanguageContext';
import { InteractiveImageAccordion } from '@/components/ui/interactive-image-accordion';
import serviceCreative from '@/assets/service-creative-opt.webp';

const SERVICE_KEYS = ['paidMedia', 'campaign', 'creative', 'conversion', 'growth', 'analytics'];

const ServicesPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { t } = useTranslation();
  const serviceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToService = (id: string) => {
    const el = serviceRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Map accordion items with translated titles
  const accordionItems = SERVICE_KEYS.map(key => ({
    id: key, // Used by scrollToService
    title: t(`services.items.${key}.title`),
  }));

  return (
    <>
      <SEOHead
        title={t('seo.servicesTitle')}
        description={t('seo.servicesDesc')}
        keywords={t('seo.servicesKeywords')}
      />
      <Navbar onBookCall={openBooking} />
      <main>
        {/* Hero with accordion */}
        <section className="pt-28 pb-12 md:pt-36 md:pb-20 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            {/* Image Accordion — click scrolls to service detail */}
            <div className="w-full flex justify-center mb-12">
              <InteractiveImageAccordion
                items={accordionItems}
                imageSrc={serviceCreative}
                defaultActiveIndex={2}
                onItemClick={scrollToService}
              />
            </div>

            {/* Title and intro below accordion */}
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('services.label')}</p>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">{t('services.title')}</h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                {t('services.intro')}
              </p>
            </div>
          </div>
        </section>

        {/* Service details */}
        <section className="pb-20 md:pb-28 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-[1px] bg-border">
              {SERVICE_KEYS.map((key, i) => {
                const outcomes = [0, 1, 2].map(j => t(`services.items.${key}.outcomes.${j}`));
                return (
                  <div
                    key={key}
                    ref={el => { serviceRefs.current[key] = el; }}
                    id={`service-${key}`}
                    className="bg-background p-8 md:p-12 animate-fade-in"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      <div className="md:col-span-5">
                        <h2 className="text-foreground text-xl md:text-2xl font-medium mb-3">{t(`services.items.${key}.title`)}</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">{t(`services.items.${key}.desc`)}</p>
                      </div>
                      <div className="md:col-span-4">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('services.outcomes')}</p>
                        <ul className="space-y-2">
                          {outcomes.map((o, j) => (
                            <li key={j} className="text-foreground text-sm leading-relaxed flex items-start gap-2">
                              <span className="text-accent mt-0.5">—</span>
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="md:col-span-3">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('services.howItWorks')}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{t(`services.items.${key}.how`)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <FinalCTA onBookCall={openBooking} />
      </main>
      <Footer onBookCall={openBooking} />
      <BookingSheet isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
};

export default ServicesPage;
