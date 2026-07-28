import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

/** Left-aligned, like everything else. Copy lives inline; i18n is retired. */
const NotFound = () => (
  <div className="min-h-screen bg-background flex items-start">
    <SEOHead
      title="Page not found | AKAL Creator"
      description="That page does not exist."
      noIndex
    />
    <div className="mx-auto w-full max-w-[1280px] px-6 pt-32 md:pt-48 pb-24">
      <div className="row-label">404 / NOT FOUND</div>
      <div className="mt-3 w-8 border-t border-border" />

      <h1 className="num mt-10 text-[clamp(3rem,12vw,7rem)] font-medium leading-none tracking-tight text-foreground">
        404
      </h1>
      <p className="mt-6 max-w-[46ch] text-[15px] md:text-base leading-relaxed text-muted-foreground">
        That page does not exist. If you followed a report link, check that the
        full address was copied — report tokens are long.
      </p>

      <div className="mt-10 border-t border-border pt-8">
        <Link
          to="/"
          className="inline-flex items-center bg-foreground text-background text-[11px] uppercase tracking-[0.18em] font-semibold px-8 py-4 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Back to the site
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
