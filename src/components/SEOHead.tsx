import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '@/contexts/LanguageContext';
import { SITE_URL } from '@/lib/site';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

export const SEOHead = ({
  title,
  description,
  keywords = 'paid media, performance marketing, growth strategy, paid advertising agency',
  image = '/og-image.png'
}: SEOHeadProps) => {
  const { pathname } = useLocation();
  const { language } = useTranslation();

  const basePath = pathname.replace(/^\/fr/, '') || '/';
  const enUrl = `${SITE_URL}${basePath === '/' ? '' : basePath}`;
  const frUrl = `${SITE_URL}/fr${basePath === '/' ? '' : basePath}`;
  const url = language === 'fr' ? frUrl : enUrl;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      <html lang={language} />
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="fr" href={frUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={language === 'fr' ? 'fr_FR' : 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};
