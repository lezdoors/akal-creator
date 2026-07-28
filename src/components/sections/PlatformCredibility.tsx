import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import {
  siGoogleads,
  siMeta,
  siTiktok,
  siYoutube,
  siGoogleanalytics,
  siShopify,
  siHubspot,
  siLooker,
  siSemrush,
  type SimpleIcon,
} from 'simple-icons';

// Official brand paths that simple-icons removed under its brand policy
// (sourced from simple-icons@10, same viewBox). Kept local so the marquee
// pills stay visually consistent.
const siLinkedinLocal = {
  title: 'LinkedIn',
  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
} as SimpleIcon;
const siSalesforceLocal = {
  title: 'Salesforce',
  path: 'M10.006 5.415a4.195 4.195 0 013.045-1.306c1.56 0 2.954.9 3.69 2.205.63-.3 1.35-.45 2.1-.45 2.85 0 5.159 2.34 5.159 5.22s-2.31 5.22-5.176 5.22c-.345 0-.69-.044-1.02-.104a3.75 3.75 0 01-3.3 1.95c-.6 0-1.155-.15-1.65-.375A4.314 4.314 0 018.88 20.4a4.302 4.302 0 01-4.05-2.82c-.27.062-.54.076-.825.076-2.204 0-4.005-1.8-4.005-4.05 0-1.5.811-2.805 2.01-3.51-.255-.57-.39-1.2-.39-1.846 0-2.58 2.1-4.65 4.65-4.65 1.53 0 2.85.705 3.72 1.8',
} as SimpleIcon;

interface PlatformItem {
  name: string;
  icon: SimpleIcon | null;
  color: string;
}

const row1: PlatformItem[] = [
  { name: 'Google Ads', icon: siGoogleads, color: '#4285F4' },
  { name: 'Meta Ads', icon: siMeta, color: '#0081FB' },
  { name: 'LinkedIn Ads', icon: siLinkedinLocal, color: '#0A66C2' },
  { name: 'TikTok Ads', icon: siTiktok, color: '#010101' },
  { name: 'YouTube', icon: siYoutube, color: '#FF0000' },
  { name: 'GA4', icon: siGoogleanalytics, color: '#E37400' },
];

const row2: PlatformItem[] = [
  { name: 'Shopify', icon: siShopify, color: '#7AB55C' },
  { name: 'Klaviyo', icon: null, color: '#253342' },
  { name: 'HubSpot', icon: siHubspot, color: '#FF7A59' },
  { name: 'Salesforce', icon: siSalesforceLocal, color: '#00A1E0' },
  { name: 'Looker Studio', icon: siLooker, color: '#4285F4' },
  { name: 'Semrush', icon: siSemrush, color: '#FF642D' },
];

const PlatformIcon: React.FC<{ icon: SimpleIcon | null; color: string }> = ({ icon, color }) => {
  if (!icon) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} />
    </svg>
  );
};

const MarqueeRow: React.FC<{ items: PlatformItem[]; direction: 'left' | 'right' }> = ({ items, direction }) => {
  return (
    <div className="overflow-hidden">
      <div
        className={`flex gap-4 w-max ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
      >
        {[0, 1, 2, 3].map(copy => (
          <div key={copy} aria-hidden={copy > 0 || undefined} className="flex gap-4">
            {items.map(item => (
              <span
                key={item.name}
                className="border border-border px-4 py-2 text-[12px] uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap flex items-center gap-2"
              >
                <PlatformIcon icon={item.icon} color={item.color} />
                {item.name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PlatformCredibility: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="pt-8 md:pt-12 pb-16 md:pb-24 px-6 md:px-10 border-b border-border">
      <div className="max-w-7xl mx-auto mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
          {t('platforms.label')}
        </p>
        <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-2 max-w-xl">
          {t('platforms.title')}
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-lg">
          {t('platforms.desc')}
        </p>
      </div>

      <div className="space-y-4">
        <MarqueeRow items={row1} direction="left" />
        <MarqueeRow items={row2} direction="right" />
      </div>
    </section>
  );
};
