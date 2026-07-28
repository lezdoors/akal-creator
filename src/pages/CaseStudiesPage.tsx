import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingSheet } from '@/components/BookingSheet';
import { SEOHead } from '@/components/SEOHead';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/Footer';
import { useTranslation } from '@/contexts/LanguageContext';

function useCountUp(end: number, duration = 800) {
  // Start at the final value so no-JS paints, reduced-motion users, and
  // throttled tabs always see the real number; the count-up is a flourish.
  const [count, setCount] = useState(end);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const isDecimal = end % 1 !== 0;

          // rAF can throttle or freeze in background tabs — guarantee the
          // real number lands on a wall clock no matter what.
          const settle = setTimeout(() => setCount(end), duration + 250);

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * end;
            setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.round(current));
            if (progress < 1) requestAnimationFrame(animate);
            else clearTimeout(settle);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { ref, count };
}

function MetricBlock({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, count } = useCountUp(value);
  return (
    <div ref={ref} className="py-6 md:py-8">
      <div className="text-4xl md:text-5xl font-medium text-accent">
        {count}{suffix}
      </div>
      <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mt-2">{label}</div>
    </div>
  );
}

const STUDY_KEYS = ['saas', 'ecommerce', 'b2b'];

const CaseStudiesPage = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('seo.casesTitle')}
        description={t('seo.casesDesc')}
        keywords={t('seo.casesKeywords')}
      />
      <Navbar onBookCall={openBooking} />
      <main>
        {/* Header */}
        <section className="pt-28 pb-16 md:pt-36 md:pb-20 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{t('cases.label')}</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">{t('cases.title')}</h1>
            <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
              {t('cases.intro')}
            </p>
          </div>
        </section>

        {/* Studies */}
        <section className="px-6 md:px-10 pb-20 md:pb-28">
          <div className="max-w-7xl mx-auto divide-y divide-border">
            {STUDY_KEYS.map((key, i) => {
              const isEven = i % 2 === 1;

              const textContent = (
                <div className="flex-1 min-w-0 py-10 md:py-16">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-accent mb-4 block">
                    {t(`cases.items.${key}.label`)}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-8">{t(`cases.items.${key}.headline`)}</h2>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{t('cases.challenge')}</p>
                      <p className="text-foreground text-sm leading-relaxed">{t(`cases.items.${key}.challenge`)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{t('cases.approach')}</p>
                      <p className="text-foreground text-sm leading-relaxed">{t(`cases.items.${key}.approach`)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{t('cases.impact')}</p>
                      <p className="text-foreground text-sm leading-relaxed">{t(`cases.items.${key}.impact`)}</p>
                    </div>
                  </div>
                </div>
              );

              const metricsContent = (
                <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-4 py-10 md:py-16">
                  {[0, 1].map(idx => (
                    <div key={idx} className="border border-border p-6 md:p-8">
                      <MetricBlock
                        value={parseFloat(t(`cases.items.${key}.metrics.${idx}.numValue`))}
                        suffix={t(`cases.items.${key}.metrics.${idx}.suffix`)}
                        label={t(`cases.items.${key}.metrics.${idx}.label`)}
                      />
                    </div>
                  ))}
                  {/* Branded panel */}
                  <div className="bg-foreground p-6 md:p-8 flex items-center justify-center min-h-[120px]">
                    <span className="text-2xl md:text-3xl font-medium uppercase tracking-[0.2em] text-accent">
                      {t(`cases.items.${key}.label`)}
                    </span>
                  </div>
                </div>
              );

              return (
                <div
                  key={key}
                  className={`flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 animate-fade-in`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {textContent}
                  {metricsContent}
                </div>
              );
            })}
          </div>
        </section>

        <FinalCTA onBookCall={openBooking} />
      </main>
      <Footer onBookCall={openBooking} />
      <BookingSheet isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
};

export default CaseStudiesPage;
