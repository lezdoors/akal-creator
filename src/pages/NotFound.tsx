import { Link } from "react-router-dom";
import { SEOHead } from '@/components/SEOHead';
import { useTranslation } from '@/contexts/LanguageContext';

const NotFound = () => {
  const { t, getLocalizedPath } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEOHead
        title={t('seo.notFoundTitle')}
        description={t('seo.notFoundDesc')}
      />
      <div className="text-center px-6">
        <h1 className="text-6xl md:text-8xl font-medium text-foreground mb-4">{t('notFound.title')}</h1>
        <p className="text-muted-foreground text-base mb-8">{t('notFound.message')}</p>
        <Link
          to={getLocalizedPath('/')}
          className="bg-foreground text-background text-[11px] uppercase tracking-[0.15em] px-8 py-3.5 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {t('notFound.back')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
