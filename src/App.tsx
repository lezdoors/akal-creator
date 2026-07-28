import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import CaseStudiesPage from "./pages/CaseStudiesPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import NotFound from "./pages/NotFound";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

const PAGES: Array<[string, JSX.Element]> = [
  ["", <Index />],
  ["services", <ServicesPage />],
  ["case-studies", <CaseStudiesPage />],
  ["about", <AboutPage />],
  ["faq", <FAQPage />],
  ["privacy", <PrivacyPage />],
  ["terms", <TermsPage />],
];

const AppRoutes = () => (
  <Routes>
    {PAGES.map(([path, element]) => (
      <Route key={`/${path}`} path={`/${path}`} element={element} />
    ))}
    {PAGES.map(([path, element]) => (
      <Route key={`/fr/${path}`} path={`/fr/${path}`} element={element} />
    ))}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <LanguageProvider>
    <ScrollToTop />
    <AppRoutes />
  </LanguageProvider>
);

export default App;
