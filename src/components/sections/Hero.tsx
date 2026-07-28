import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface HeroProps {
  onBookCall: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookCall }) => {
  const { t, getLocalizedPath } = useTranslation();

  return (
    <section className="relative isolate min-h-[92vh] flex items-center px-6 md:px-10 overflow-hidden">
      {/* Aurora — soft accent wash, sits behind content */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-1/3 -left-[15%] h-[70vh] w-[70vh] rounded-full opacity-40 blur-3xl animate-aurora-1"
          style={{ background: 'radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.45), transparent 65%)' }}
        />
        <div
          className="absolute -bottom-1/3 -right-[10%] h-[60vh] w-[60vh] rounded-full opacity-35 blur-3xl animate-aurora-2"
          style={{ background: 'radial-gradient(circle at 70% 70%, hsl(var(--foreground) / 0.20), transparent 70%)' }}
        />
        {/* Hairline grid overlay for editorial feel */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full pt-32 pb-16">
        {/* Headline */}
        <h1 className="font-medium tracking-tighter leading-[0.95] text-foreground max-w-5xl mb-8">
          <span
            className="block text-[3rem] sm:text-6xl md:text-7xl lg:text-[5.75rem] animate-headline-in"
            style={{ animationDelay: '0.1s' }}
          >
            {t('hero.line1')} {t('hero.line2')}{' '}
            <span style={{ color: 'hsl(var(--accent))' }}>{t('hero.accent')}.</span>
          </span>
          <span
            className="block text-[3rem] sm:text-6xl md:text-7xl lg:text-[5.75rem] text-muted-foreground animate-headline-in"
            style={{ animationDelay: '0.25s' }}
          >
            {t('hero.line3')} {t('hero.line4')}.
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="text-muted-foreground text-base md:text-lg max-w-xl mb-10 leading-relaxed animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          {t('hero.sub')}
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3 animate-fade-in"
          style={{ animationDelay: '0.7s' }}
        >
          <button
            onClick={onBookCall}
            className="group inline-flex items-center justify-center gap-2 bg-foreground text-background text-[11px] uppercase tracking-[0.18em] font-semibold px-8 py-4 hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {t('hero.ctaPrimary')}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <Link
            to={getLocalizedPath('/case-studies')}
            className="inline-flex items-center justify-center gap-2 border border-foreground/30 text-foreground text-[11px] uppercase tracking-[0.18em] font-semibold px-8 py-4 hover:bg-foreground hover:text-background transition-colors"
          >
            {t('hero.ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
};
