import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '@/lib/site';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  /**
   * Absolute or root-relative share image. Omitted by default: there is no
   * imagery on this site, and pointing og:image at a file that does not exist
   * is worse than having no card image at all.
   */
  image?: string;
  /** Report pages set this so a token in the URL never reaches an index. */
  noIndex?: boolean;
}

/** English only. The /fr tree and its hreflang alternates are retired. */
export const SEOHead = ({
  title,
  description,
  keywords = 'creator marketing, influencer marketing for B2B SaaS, creator attribution, tracked placements',
  image,
  noIndex = false,
}: SEOHeadProps) => {
  const { pathname } = useLocation();

  const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : null;

  return (
    <Helmet>
      <html lang="en" />
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <link rel="canonical" href={url} />}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
};
