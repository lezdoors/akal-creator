import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AkalWordmark } from '@/components/AkalWordmark';

interface NavbarProps {
  onBookCall: () => void;
}

/** Copy lives inline. i18n is retired — do not reintroduce locale keys. */
const NAV_LINKS = [
  { label: 'What we run', href: '/#services' },
  { label: 'Tracking', href: '/#tracking' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

const CTA_LABEL = 'Start a campaign';

/**
 * The real AKAL mark — Didone wordmark with the red crossbars, vectorised from
 * the brand asset. It is an inline SVG, not a raster: the letterforms take
 * `currentColor` so the mark inherits ink, and the site still ships zero images.
 *
 * The register's no-imagery rule is about decoration. A company's own mark is
 * identity, and typing "AKAL" in Satoshi would be an approximation of the brand
 * rather than the brand.
 */
const Wordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={cn('flex items-baseline gap-2.5 min-w-0', className)}>
    <AkalWordmark className="h-[15px] w-auto shrink-0 text-foreground" />
    <span className="num text-[10px] uppercase tracking-[0.16em] text-muted-foreground leading-none">
      / Creator
    </span>
  </span>
);

export const Navbar: React.FC<NavbarProps> = ({ onBookCall }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

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
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      return location.pathname === (path || '/') && location.hash === `#${hash}`;
    }
    return location.pathname === href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.includes('#')) return;
    e.preventDefault();
    const [rawPath, hash] = href.split('#');
    const path = rawPath || '/';

    const scrollToSection = () => {
      const el = document.getElementById(hash);
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    };

    if (location.pathname === path || location.pathname === `${path}/`) {
      scrollToSection();
    } else {
      navigate(path);
      window.setTimeout(scrollToSection, 100);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between gap-6 h-16 min-w-0">
          <Link to="/" className="min-w-0" aria-label="AKAL Creator — home">
            <Wordmark />
          </Link>

          <div className="hidden md:flex items-center gap-8 min-w-0">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={e => handleNavClick(e, link.href)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'text-[13px] tracking-[0.01em] transition-colors',
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={onBookCall}
              className="bg-foreground text-background h-9 px-5 flex items-center text-[12px] font-medium tracking-[0.02em] hover:bg-foreground/90 transition-colors"
            >
              {CTA_LABEL}
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden text-foreground shrink-0"
          >
            {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 bg-background z-[99] pt-16 md:hidden">
          <div className="px-6 pt-4">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={e => handleNavClick(e, link.href)}
                className="flex items-baseline gap-4 py-5 border-b border-border text-foreground text-xl"
              >
                <span className="num text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                onBookCall();
              }}
              className="mt-8 bg-foreground text-background h-11 px-6 flex items-center text-[13px] font-medium"
            >
              {CTA_LABEL}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
