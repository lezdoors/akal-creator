import React from 'react';
import { Link } from 'react-router-dom';
import logoWhite from '@/assets/latitude-logo-secondary-white.png';
import { useTranslation } from '@/contexts/LanguageContext';

interface FooterProps {
  onBookCall?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBookCall }) => {
  const { t, getLocalizedPath } = useTranslation();

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <img src={logoWhite} alt="Latitude" className="h-16 w-auto" />
            <p className="text-white/40 text-sm max-w-[240px]">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Nav + Legal Links */}
          <div className="flex gap-12">
            <ul className="space-y-2">
              <li><Link to={getLocalizedPath('/services')} className="text-white/50 text-sm hover:text-white transition-colors">{t('nav.services')}</Link></li>
              <li><Link to={getLocalizedPath('/case-studies')} className="text-white/50 text-sm hover:text-white transition-colors">{t('nav.caseStudies')}</Link></li>
              <li><Link to={getLocalizedPath('/about')} className="text-white/50 text-sm hover:text-white transition-colors">{t('nav.about')}</Link></li>
              <li><Link to={getLocalizedPath('/faq')} className="text-white/50 text-sm hover:text-white transition-colors">{t('nav.faq')}</Link></li>
            </ul>
            <ul className="space-y-2">
              <li><Link to={getLocalizedPath('/privacy')} className="text-white/50 text-sm hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to={getLocalizedPath('/terms')} className="text-white/50 text-sm hover:text-white transition-colors">{t('footer.terms')}</Link></li>
            </ul>
            <div className="flex flex-col justify-start gap-2">
              <a
                href="mailto:hello@latitudemarketing.agency"
                className="text-white/50 text-sm hover:text-white transition-colors"
              >
                hello@latitudemarketing.agency
              </a>
              <button
                onClick={onBookCall}
                className="text-left text-white text-sm underline underline-offset-4 decoration-accent hover:text-accent transition-colors w-fit"
              >
                {t('nav.bookCall')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <p className="text-white/25 text-xs">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
