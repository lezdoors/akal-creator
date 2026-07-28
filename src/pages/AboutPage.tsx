import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { SEOHead } from '@/components/SEOHead';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/Footer';
import { useTranslation } from '@/contexts/LanguageContext';

const AboutPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('seo.aboutTitle')}
        description={t('seo.aboutDesc')}
        keywords={t('seo.aboutKeywords')}
      />
      <Navbar onBookCall={openBooking} />
      <main>
        <section className="pt-28 pb-20 md:pt-36 md:pb-28 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('about.leadershipLabel')}</p>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">{t('about.name')}</h1>
              <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
                {t('about.role')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border mb-16">
              <div className="bg-background p-8 md:p-12">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">{t('about.experience.label')}</p>
                <p className="text-foreground text-base leading-relaxed mb-4">
                  {t('about.experience.main')}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('about.experience.detail')}
                </p>
              </div>
              <div className="bg-background p-8 md:p-12">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">{t('about.credentials.label')}</p>
                <p className="text-foreground text-base leading-relaxed mb-4">
                  {t('about.credentials.main')}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('about.credentials.detail')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border mb-16">
              <div className="bg-background p-8 md:p-12">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">{t('about.positioning.label')}</p>
                <p className="text-foreground text-base leading-relaxed mb-4">
                  {t('about.positioning.main')}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('about.positioning.detail')}
                </p>
              </div>
              <div className="bg-background p-8 md:p-12">
                <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">{t('about.approach.label')}</p>
                <p className="text-foreground text-base leading-relaxed mb-4">
                  {t('about.approach.main')}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('about.approach.detail')}
                </p>
              </div>
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

export default AboutPage;
