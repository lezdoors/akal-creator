import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';

/* Same ledger grammar as the privacy notice. */

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
 * Site terms. These govern the website and the standing commercial terms of
 * the service as it is actually sold — 20% of creator budget, month to month.
 * Any engagement is still papered separately; this page says so rather than
 * pretending to be the contract.
 */
const TermsPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);

  return (
    <>
      <SEOHead
        title="Terms | AKAL Creator"
        description="Website and service terms for AKAL Creator, operated by Akal Digital Services Ltd, England and Wales No. 17229387."
      />
      <Navbar onBookCall={openBooking} />

      <main className="pt-28 md:pt-36 pb-24 md:pb-32">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <div className="row-label">LEGAL / TERMS</div>
          <div className="mt-3 w-8 border-t border-border" />

          <h1 className="mt-10 max-w-[20ch] text-[clamp(1.85rem,4.2vw,3.1rem)] font-medium leading-[1.06] tracking-[-0.022em]">
            Terms
          </h1>
          <p className="mt-5 max-w-[58ch] text-[15px] md:text-base leading-relaxed text-muted-foreground">
            These cover the use of this website and the standing terms of the
            service. A campaign is papered separately; where that agreement and
            this page disagree, the agreement wins.
          </p>

          <div className="mt-10 md:mt-14 max-w-[42rem] min-w-0">
            <Row label="Supplier" value="Akal Digital Services Ltd" />
            <Row label="Registered in" value="England &amp; Wales" />
            <Row label="Company number" value="17229387" />
            <Row label="Contact" value="creator@akalds.com" />
            <Row label="Last updated" value="28 July 2026" />
          </div>

          <div className="mt-14 md:mt-20 border-b border-border">
            <Clause n="01" title="Who we are">
              <p>
                AKAL Creator is a trading name of Akal Digital Services Ltd, a
                company registered in England and Wales, company number{' '}
                <span className="num">17229387</span>. Using this site means you
                accept these terms.
              </p>
            </Clause>

            <Clause n="02" title="What the service is">
              <p>
                We run creator marketing as a managed service: we source
                creators, negotiate and agree rates, issue contracts and briefs,
                pay creators, and issue a tracked link for every placement so
                clicks and reported signups can be attributed to the placement
                that produced them.
              </p>
              <p>
                We do not guarantee views, clicks, signups, revenue or any other
                outcome. Nothing on this site is a forecast or a promise of
                results.
              </p>
            </Clause>

            <Clause n="03" title="Fees">
              <p>
                Our fee is{' '}
                <span className="num">20%</span> of the creator budget for the
                period. The creator budget is the money that reaches creators;
                the fee is charged on top of it and invoiced with it. We do not
                mark up creator rates, and we do not take a commission from
                creators.
              </p>
              <p>
                Engagements run month to month. Either side can stop at the end
                of a month with written notice. Placements already contracted
                with a creator must still be paid for — the creator has
                committed to the work.
              </p>
              <p>
                Invoices are due within <span className="num">15</span> days
                unless the campaign agreement
                says otherwise. Creator budget is payable before placements are
                booked, because we pay creators from it.
              </p>
            </Clause>

            <Clause n="04" title="What we need from you">
              <p>
                Accurate information about your product, audience and what
                counts as a signup; timely approval of shortlists and briefs;
                and, if you want conversions in the report, a call to our
                conversion endpoint when one happens. Late approvals move
                launch dates, because creator calendars are not ours to move.
              </p>
            </Clause>

            <Clause n="05" title="Tracking and reporting">
              <p>
                Attribution here means last-click on a tracked link, plus any
                conversions you report to us against it. It is measurement, not
                truth: ad blockers, shared devices, copied links, dark social
                and app-store detours all mean some real activity will never
                appear in a report. We show what the link and your own
                conversion calls can evidence, and nothing beyond it.
              </p>
              <p>
                Report links are unguessable but unauthenticated. Anyone holding
                the link can read the report, so treat it as a credential.
              </p>
            </Clause>

            <Clause n="06" title="Creator content and rights">
              <p>
                Creators own their content unless a placement agreement says
                otherwise. Usage rights — whether you may reuse a video in paid
                media, for how long, and where — are negotiated per placement
                and written into that placement&rsquo;s agreement. Do not assume
                a right you have not bought.
              </p>
              <p>
                Placements are disclosed as advertising, as UK ASA and US FTC
                rules require. We will not run an undisclosed placement.
              </p>
            </Clause>

            <Clause n="07" title="This website">
              <p>
                The text, layout and code of this site belong to us. Any figures
                shown in the site&rsquo;s example ledger are illustrative and
                labelled as such; they are not client results.
              </p>
            </Clause>

            <Clause n="08" title="Liability">
              <p>
                Nothing here limits liability for death or personal injury
                caused by negligence, for fraud, or for anything else that
                cannot lawfully be limited. Subject to that, we are not liable
                for indirect or consequential loss, or for lost profits or lost
                revenue, and our total liability for any claim is capped at the
                fees you paid us in the three months before the claim arose.
              </p>
            </Clause>

            <Clause n="09" title="Confidentiality">
              <p>
                Each side keeps the other&rsquo;s non-public information
                confidential — rates, campaign data, roadmaps, results — and
                uses it only to run the work.
              </p>
            </Clause>

            <Clause n="10" title="Governing law">
              <p>
                These terms are governed by the laws of England and Wales, and
                the courts of England and Wales have exclusive jurisdiction.
              </p>
            </Clause>

            <Clause n="11" title="Contact">
              <p>
                Questions about these terms:{' '}
                <a
                  className="text-foreground border-b border-border hover:border-foreground transition-colors"
                  href="mailto:creator@akalds.com"
                >
                  creator@akalds.com
                </a>
                .
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

export default TermsPage;
