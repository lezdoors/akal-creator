import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { useTranslation } from '@/contexts/LanguageContext';

const PrivacyPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('seo.privacyTitle')}
        description={t('seo.privacyDesc')}
      />
      <Navbar onBookCall={openBooking} />
      <main className="pt-28 pb-20 md:pt-36 md:pb-28 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-8">
            {t('footer.privacy')}
          </h1>

          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <p className="text-sm leading-relaxed">
              <strong className="text-foreground">Effective Date:</strong> January 1, 2026
            </p>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">1. Information We Collect</h2>
              <p className="text-sm leading-relaxed">
                We collect information you provide directly when using our services, including your name, email address, company name, and monthly advertising budget when you book a strategy call or submit a contact form.
              </p>
              <p className="text-sm leading-relaxed">
                We also automatically collect certain technical information when you visit our website, including your IP address, browser type, device information, and pages visited. We use cookies and similar technologies to enhance your experience.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">2. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
                <li>Respond to your inquiries and schedule strategy calls</li>
                <li>Provide and improve our paid media services</li>
                <li>Send you relevant communications about our services</li>
                <li>Analyze website usage to improve user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">3. Information Sharing</h2>
              <p className="text-sm leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">4. Data Security</h2>
              <p className="text-sm leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">5. Cookies</h2>
              <p className="text-sm leading-relaxed">
                Our website uses cookies to analyze traffic and optimize your experience. You can control cookie preferences through your browser settings. Disabling cookies may affect certain website functionality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">6. Your Rights</h2>
              <p className="text-sm leading-relaxed">
                You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, contact us at the email address below.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">7. Changes to This Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground">8. Contact</h2>
              <p className="text-sm leading-relaxed">
                If you have questions about this privacy policy, please contact us at hello@latitudemarketing.agency.
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

export default PrivacyPage;
