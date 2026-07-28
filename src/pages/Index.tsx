import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { MobileStickyCTA } from '@/components/MobileStickyCTA';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Process } from '@/components/sections/Process';
import { LiveTrackingDemo } from '@/components/sections/LiveTrackingDemo';
import { Manifesto } from '@/components/sections/Manifesto';
import { Pricing } from '@/components/sections/Pricing';
import { WhoItsFor } from '@/components/sections/WhoItsFor';
import { FAQ } from '@/components/sections/FAQ';
import { FinalCTA } from '@/components/sections/FinalCTA';

/**
 * The document, in order. The gutter index passed to each section is the
 * running order and is the only place it is decided — sections that hardcode
 * their own index (Services 01, Process 02, FAQ 07) match this list.
 *
 *   01 SOURCING   Services
 *   02 PROCESS    Process
 *   03 TRACKING   LiveTrackingDemo
 *   04 STANDARD   Manifesto
 *   05 PRICING    Pricing
 *   06 FIT        WhoItsFor
 *   07 QUESTIONS  FAQ
 *   08 START      FinalCTA
 */
const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);

  return (
    <>
      <SEOHead
        title="AKAL Creator | Creator marketing that reports like a paid channel"
        description="Managed creator marketing for B2B SaaS and AI tools. We source, price, contract and pay creators, and every placement carries a tracked link — so you see clicks and signups per creator. 20% of creator budget, month to month."
        keywords="creator marketing, influencer marketing for B2B SaaS, creator attribution, sponsorship tracking, developer tool marketing"
      />
      <Navbar onBookCall={openBooking} />
      <main>
        <Hero onBookCall={openBooking} />
        <Services />
        <Process />
        <LiveTrackingDemo index="03" label="TRACKING" id="tracking" />
        <Manifesto index="04" label="STANDARD" id="standard" />
        <Pricing index="05" label="PRICING" id="pricing" onStartCampaign={openBooking} />
        <WhoItsFor index="06" label="FIT" id="fit" />
        <FAQ />
        <FinalCTA onBookCall={openBooking} />
      </main>
      <Footer onBookCall={openBooking} />
      <MobileStickyCTA onBookCall={openBooking} />
      <BookingSheet isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
};

export default Index;
