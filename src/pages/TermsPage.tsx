import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { useTranslation } from '@/contexts/LanguageContext';

const TermsPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('seo.termsTitle')}
        description={t('seo.termsDesc')}
      />
      <Navbar onBookCall={openBooking} />
      <main className="pt-28 pb-20 md:pt-36 md:pb-28 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-8">
            {t('footer.terms')}
          </h1>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p className="text-sm leading-relaxed">
              <strong className="text-foreground">Effective Date:</strong> January 1, 2026
            </p>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">1. Agreement to Terms</h2>
              <p className="text-sm leading-relaxed">
                By accessing or using the Latitude Marketing website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">2. Services</h2>
              <p className="text-sm leading-relaxed">
                Latitude Marketing provides paid media strategy, campaign management, creative testing, conversion optimization, growth strategy, and analytics services. The specific scope, deliverables, and fees for each engagement are defined in separate service agreements.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">3. Intellectual Property</h2>
              <p className="text-sm leading-relaxed">
                All content on this website, including text, graphics, logos, and design elements, is the property of Latitude Marketing and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">4. Client Obligations</h2>
              <p className="text-sm leading-relaxed">
                Clients are responsible for providing accurate information, timely feedback, and necessary access to advertising accounts and analytics platforms. Delays in providing required materials may impact project timelines and results.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">5. Payment Terms</h2>
              <p className="text-sm leading-relaxed">
                Payment terms are outlined in individual service agreements. Unless otherwise specified, invoices are due within 15 days of receipt. Late payments may result in service suspension.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">6. Limitation of Liability</h2>
              <p className="text-sm leading-relaxed">
                Latitude Marketing shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the fees paid for the specific services giving rise to the claim.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">7. Termination</h2>
              <p className="text-sm leading-relaxed">
                Either party may terminate a service engagement with 30 days written notice. Upon termination, all outstanding fees become due immediately. We will provide reasonable transition support for active campaigns.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">8. Confidentiality</h2>
              <p className="text-sm leading-relaxed">
                Both parties agree to maintain the confidentiality of proprietary information shared during the engagement, including campaign data, business strategies, and financial information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">9. Governing Law</h2>
              <p className="text-sm leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">10. Contact</h2>
              <p className="text-sm leading-relaxed">
                For questions about these terms, contact us at hello@latitudemarketing.agency.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer onBookCall={openBooking} />
      <BookingSheet isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
};

export default TermsPage;
