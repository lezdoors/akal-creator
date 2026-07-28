import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { MobileStickyCTA } from '@/components/MobileStickyCTA';
import { SEOHead } from '@/components/SEOHead';
import { Hero } from '@/components/sections/Hero';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { PlatformCredibility } from '@/components/sections/PlatformCredibility';
import { Services } from '@/components/sections/Services';
import { CaseStudies } from '@/components/sections/CaseStudies';
import { WhyLatitude } from '@/components/sections/WhyLatitude';
import { Process } from '@/components/sections/Process';
import { BookingSection } from '@/components/sections/BookingSection';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/Footer';
import { useTranslation } from '@/contexts/LanguageContext';

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('seo.homeTitle')}
        description={t('seo.homeDesc')}
        keywords={t('seo.homeKeywords')}
      />
      <Navbar onBookCall={openBooking} />
      <main>
        <Hero onBookCall={openBooking} />
        <TrustStrip />
        <PlatformCredibility />
        <Services />
        <CaseStudies onBookCall={openBooking} />
        <WhyLatitude />
        <Process />
        <BookingSection />
        <FinalCTA onBookCall={openBooking} />
      </main>
      <Footer onBookCall={openBooking} />
      <MobileStickyCTA onBookCall={openBooking} />
      <BookingSheet isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
};

export default Index;
