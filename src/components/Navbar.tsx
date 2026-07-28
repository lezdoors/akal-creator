import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoIcon from '@/assets/latitude-logo-secondary-dark.png';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onBookCall: () => void;
}

const NAV_LINKS = [
  { labelKey: 'nav.services', href: '/services' },
  { labelKey: 'nav.caseStudies', href: '/case-studies' },
  { labelKey: 'nav.about', href: '/about' },
  { labelKey: 'nav.faq', href: '/faq' },
];

export const Navbar: React.FC<NavbarProps> = ({ onBookCall }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage, getLocalizedPath } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    const localizedHref = getLocalizedPath(href);
    if (href.includes('#')) {
      return location.pathname === localizedHref.split('#')[0] && location.hash === '#' + href.split('#')[1];
    }
    return location.pathname === localizedHref;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('#')) {
      e.preventDefault();
      const [path, hash] = href.split('#');
      const localizedPath = getLocalizedPath(path);

      if (location.pathname === localizedPath || location.pathname === localizedPath + '/') {
        // Already on the page, just scroll
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Navigate to page first, then scroll
        navigate(localizedPath);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-colors duration-200 ${scrolled ? 'bg-background/95 backdrop-blur-sm border-b' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          <Link to={getLocalizedPath('/')} className="flex items-center gap-3">
            <img src={logoIcon} alt="Latitude Marketing" className="h-10 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="text-foreground text-[15px] font-semibold tracking-[0.08em] uppercase">LATITUDE MARKETING</span>
              <span className="text-foreground text-[15px] font-semibold tracking-[0.08em] uppercase">AGENCY</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-0">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="relative overflow-hidden bg-background text-foreground h-[34px] px-3 flex items-center text-[11px] font-medium uppercase tracking-[0.15em] border border-foreground group"
            >
              <span className="relative z-10">{language === 'en' ? 'FR' : 'EN'}</span>
              <span className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={getLocalizedPath(link.href)}
                onClick={(e) => handleNavClick(e, link.href)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'relative overflow-hidden text-foreground h-[34px] px-3 flex items-center text-[11px] uppercase tracking-[0.15em] border border-foreground border-l-0 group',
                  isActive(link.href) ? 'bg-accent/20 font-semibold' : 'bg-background font-medium'
                )}
              >
                <span className="relative z-10">{t(link.labelKey)}</span>
                <span className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </Link>
            ))}
            <button
              onClick={onBookCall}
              className="relative overflow-hidden bg-foreground text-background h-[34px] px-4 flex items-center text-[11px] font-medium uppercase tracking-[0.15em] border border-foreground border-l-0 group"
            >
              <span className="relative z-10">{t('nav.bookCall')}</span>
              <span className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden text-foreground"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 bg-background z-[99] pt-20 px-6 flex flex-col gap-6 md:hidden">
          <button
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="text-foreground text-lg font-medium text-left border-b border-border pb-4"
          >
            {language === 'en' ? 'Fran\u00e7ais' : 'English'}
          </button>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={getLocalizedPath(link.href)}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-foreground text-2xl font-medium text-left"
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <button
            onClick={() => { setMobileOpen(false); onBookCall(); }}
            className="bg-foreground text-background text-sm uppercase tracking-[0.15em] px-6 py-3 mt-4 w-fit"
          >
            {t('nav.bookCall')}
          </button>
        </div>
      )}
    </>
  );
};
