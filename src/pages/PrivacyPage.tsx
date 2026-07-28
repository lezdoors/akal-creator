import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';

/* -------------------------------------------------------------------------- */
/* Layout primitives — same ledger grammar as the landing page: mono gutter    */
/* label, hairline rules, left-aligned, nothing centred, no radius.            */
/* -------------------------------------------------------------------------- */

const Clause: React.FC<{
  n: string;
  title: string;
  children: React.ReactNode;
}> = ({ n, title, children }) => (
  <section className="grid grid-cols-12 gap-x-6 md:gap-x-8 border-t border-border py-8 md:py-10">
    <div className="col-span-12 md:col-span-3 min-w-0 mb-3 md:mb-0">
      <div className="num text-[12px] text-muted-foreground leading-[1.6]">{n}</div>
      <h2 className="mt-1.5 text-[15px] md:text-base font-medium tracking-[-0.01em] leading-snug">
        {title}
      </h2>
    </div>
    <div className="col-span-12 md:col-span-9 min-w-0 space-y-4 text-[15px] leading-relaxed text-muted-foreground max-w-[64ch]">
      {children}
    </div>
  </section>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-6 border-b border-border py-3 min-w-0">
    <span className="min-w-0 text-[14px] text-foreground">{label}</span>
    <span className="num shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
      {value}
    </span>
  </div>
);

/**
 * Privacy notice.
 *
 * Written against what the code actually does — api/lead.js (form submissions
 * to Neon plus a Resend notification), api/go.js (salted-hash IP, coarse click
 * metadata, one first-party cookie), db/schema.sql (the clicks table). No
 * certifications, no frameworks, no claims we cannot evidence.
 */
const PrivacyPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);

  return (
    <>
      <SEOHead
        title="Privacy | AKAL Creator"
        description="What AKAL Creator collects, why, how long it is kept, and how to have it deleted. Operated by Akal Digital Services Ltd, England and Wales No. 17229387."
      />
      <Navbar onBookCall={openBooking} />

      <main className="pt-28 md:pt-36 pb-24 md:pb-32">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <div className="row-label">LEGAL / PRIVACY</div>
          <div className="mt-3 w-8 border-t border-border" />

          <h1 className="mt-10 max-w-[20ch] text-[clamp(1.85rem,4.2vw,3.1rem)] font-medium leading-[1.06] tracking-[-0.022em]">
            Privacy notice
          </h1>
          <p className="mt-5 max-w-[58ch] text-[15px] md:text-base leading-relaxed text-muted-foreground">
            This is the whole of it. We run a lead form and a click-tracking
            redirect; that is the entire data footprint of this site.
          </p>

          <div className="mt-10 md:mt-14 max-w-[42rem] min-w-0">
            <Row label="Controller" value="Akal Digital Services Ltd" />
            <Row label="Registered in" value="England &amp; Wales" />
            <Row label="Company number" value="17229387" />
            <Row label="Contact" value="creator@akalds.com" />
            <Row label="Last updated" value="28 July 2026" />
          </div>

          <div className="mt-14 md:mt-20 border-b border-border">
            <Clause n="01" title="What we collect">
              <p>
                <strong className="text-foreground">Things you type.</strong>{' '}
                When you submit the campaign form we store your name, email
                address, company, website, budget band and message. That is the
                whole form. There is no scheduler embed and no third-party
                widget behind it — the form posts to our own endpoint.
              </p>
              <p>
                <strong className="text-foreground">Click metadata.</strong>{' '}
                Every creator placement we run uses a tracked redirect. When
                someone opens one, we record the time, a salted{' '}
                <code>SHA-256</code> hash of
                the IP address, the coarse country, the referring site and the
                browser user-agent string. We do not store the raw IP address.
                If no hashing salt is configured, we store no IP value at all
                rather than an unsalted digest.
              </p>
              <p>
                <strong className="text-foreground">One cookie.</strong> The
                redirect sets a single first-party cookie, <code>akal_ref</code>
                , holding the placement code for up to{' '}
                <span className="num">90</span> days, so that a signup
                can be matched back to the creator whose link produced it. It is
                not used for advertising and is not readable by anyone else.
              </p>
              <p>
                <strong className="text-foreground">Conversions.</strong> When a
                client tells us a tracked click became a signup, we store the
                event name, the client&rsquo;s own opaque reference for it, and
                the value they attach to it. We do not receive or want the end
                user&rsquo;s name or email.
              </p>
            </Clause>

            <Clause n="02" title="What we do not collect">
              <p>
                No advertising pixels, no analytics tags, no session recording,
                no heatmaps, no fingerprinting, no ad-network tracking, no
                cross-site profile. Fonts are self-hosted, so loading a page
                here does not tell a font host you visited.
              </p>
            </Clause>

            <Clause n="03" title="Why we are allowed to hold it">
              <p>
                Form submissions: to answer you and, if we work together, to
                perform the contract. Click and conversion records: our
                legitimate interest, and our clients&rsquo;, in knowing which
                paid placements produced results — which is the service itself.
                The <code>akal_ref</code> cookie is strictly necessary for that
                measurement to work; it carries no personal identifier.
              </p>
            </Clause>

            <Clause n="04" title="Who else sees it">
              <p>
                Our hosting and database providers, as processors: Vercel
                (hosting and the tracked redirect), Neon (the Postgres database
                the records live in), and Resend, which delivers the internal
                notification email that a form was submitted. We do not sell,
                rent or share personal data with anyone else.
              </p>
              <p>
                Clients see their own campaign report — per-placement clicks,
                signups and cost. A report contains no personal data about the
                people who clicked.
              </p>
            </Clause>

            <Clause n="05" title="How long we keep it">
              <p>
                Form submissions: up to <span className="num">24</span> months
                from your last contact with us, then deleted. Click and
                conversion records: for the life of the campaign and{' '}
                <span className="num">24</span> months after it ends, because a placement
                keeps producing clicks long after the invoice is settled. Ask us
                to delete a submission sooner and we will.
              </p>
            </Clause>

            <Clause n="06" title="Where it is processed">
              <p>
                Our database and functions run in the European Union and the
                United States depending on the provider region. Where data
                leaves the UK or EEA, our providers rely on the UK International
                Data Transfer Addendum and the EU Standard Contractual Clauses.
              </p>
            </Clause>

            <Clause n="07" title="Your rights">
              <p>
                You can ask for a copy of what we hold about you, ask us to
                correct or delete it, ask us to restrict how we use it, or
                object to it. Email{' '}
                <a
                  className="text-foreground border-b border-border hover:border-foreground transition-colors"
                  href="mailto:creator@akalds.com"
                >
                  creator@akalds.com
                </a>{' '}
                and we will answer within one month.
              </p>
              <p>
                If you are unhappy with the answer you can complain to the UK
                Information Commissioner&rsquo;s Office at ico.org.uk.
              </p>
            </Clause>

            <Clause n="08" title="Changes">
              <p>
                If this notice changes we update the date in the table above.
                We do not keep a mailing list, so there is nothing to unsubscribe
                from; check back here.
              </p>
            </Clause>
          </div>
        </div>
      </main>

      <Footer onBookCall={openBooking} />
      <BookingSheet isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
};

export default PrivacyPage;
