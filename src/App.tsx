import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import Index from './pages/Index';
import ReportPage from './pages/ReportPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFound from './pages/NotFound';

/**
 * One landing page, one client report route, two legal pages, a 404.
 * English only — the /fr tree and the locale files are gone.
 */
const App = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/r/:token" element={<ReportPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
