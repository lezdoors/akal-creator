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
import { Scale } from '@/components/sections/Scale';
import { Manifesto } from '@/components/sections/Manifesto';
import { Trust } from '@/components/sections/Trust';
import { Pricing } from '@/components/sections/Pricing';
import { WhoItsFor } from '@/components/sections/WhoItsFor';
import { FAQ } from '@/components/sections/FAQ';
import { FinalCTA } from '@/components/sections/FinalCTA';

/**
 * The document, in order.
 *
 * THE GUTTER INDEX IS DECIDED HERE AND NOWHERE ELSE. Every section takes
 * `index`, `label` and `id` as props, and every one is passed explicitly below,
 * so the running order can be read off this single list. No section hardcodes
 * its own number any more — hardcoding is how `07 / QUESTIONS` and
 * `08 / START` survived two sections being inserted above them.
 *
 *   01 SOURCING   Services           what we run
 *   02 PROCESS    Process            how it runs
 *   03 TRACKING   LiveTrackingDemo   the mechanism, live
 *   04 REACH      Scale              how wide it goes, same unit of record
 *   05 STANDARD   Manifesto          the three checks every placement clears
 *   06 CONTROL    Trust              what stays yours
 *   07 PRICING    Pricing            what it costs
 *   08 FIT        WhoItsFor          where the model breaks
 *   09 QUESTIONS  FAQ
 *   10 START      FinalCTA
 *
 * The argument: what we do (01–02), how it is proved (03–04), what we hold
 * ourselves to (05–06), then price, fit, objections, ask. CONTROL sits
 * immediately before PRICING deliberately — "you keep the relationships, the
 * rates and the link" is the sentence a reader wants settled in the breath
 * before a fee.
 *
 * Ground alternation is derived from this index inside SectionShell (even =
 * band), so the rhythm cannot drift when the order changes. FinalCTA is its own
 * <section> and carries the band explicitly, which keeps it correct at 10.
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
        <Services index="01" label="SOURCING" id="services" />
        <Process index="02" label="PROCESS" id="how-it-works" />
        <LiveTrackingDemo index="03" label="TRACKING" id="tracking" />
        <Scale index="04" label="REACH" id="reach" />
        <Manifesto index="05" label="STANDARD" id="standard" />
        <Trust index="06" label="CONTROL" id="control" />
        <Pricing index="07" label="PRICING" id="pricing" onStartCampaign={openBooking} />
        <WhoItsFor index="08" label="FIT" id="fit" />
        <FAQ index="09" label="QUESTIONS" id="faq" />
        <FinalCTA index="10" label="START" id="start" onBookCall={openBooking} />
      </main>
      <Footer onBookCall={openBooking} />
      <MobileStickyCTA onBookCall={openBooking} />
      <BookingSheet isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
};

export default Index;
