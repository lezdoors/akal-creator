import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Language, LanguageContextType } from '@/types';
import { en } from '@/locales/en';
import { fr } from '@/locales/fr';

const translations: Record<Language, Record<string, unknown>> = { en, fr };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === 'string') return current;
  if (typeof current === 'number') return String(current);
  return path;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const detectLanguage = (): Language => {
    return location.pathname.startsWith('/fr') ? 'fr' : 'en';
  };

  const [language, setLanguageState] = useState<Language>(detectLanguage);

  useEffect(() => {
    setLanguageState(detectLanguage());
  }, [location.pathname]);

  const t = useCallback((key: string): string => {
    return getNestedValue(translations[language], key);
  }, [language]);

  const getLocalizedPath = useCallback((path: string): string => {
    // Strip any existing /fr prefix
    const cleanPath = path.replace(/^\/fr/, '') || '/';
    if (language === 'fr') {
      return cleanPath === '/' ? '/fr' : `/fr${cleanPath}`;
    }
    return cleanPath;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    const currentPath = location.pathname.replace(/^\/fr/, '') || '/';
    if (lang === 'fr') {
      navigate(currentPath === '/' ? '/fr' : `/fr${currentPath}`);
    } else {
      navigate(currentPath);
    }
    setLanguageState(lang);
  }, [location.pathname, navigate]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedPath }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
};
