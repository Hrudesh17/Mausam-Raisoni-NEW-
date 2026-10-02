'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, Translations, translations } from '../lib/i18n';

export const getLanguageLocale = (lang: Language): string => {
  switch (lang) {
    case 'hi': return 'hi-IN';
    case 'mr': return 'mr-IN';
    case 'bn': return 'bn-IN';
    case 'te': return 'te-IN';
    case 'ta': return 'ta-IN';
    case 'gu': return 'gu-IN';
    case 'kn': return 'kn-IN';
    case 'ml': return 'ml-IN';
    case 'pa': return 'pa-IN';
    case 'or': return 'or-IN';
    case 'as': return 'as-IN';
    case 'ur': return 'ur-IN';
    case 'sa': return 'sa-IN';
    case 'ne': return 'ne-NP';
    default: return 'en-IN';
  }
};

interface LanguageContextType {
  language: Language;
  locale: string;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  locale: 'en-IN',
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load stored language on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mausam_language') as Language;
      if (saved && translations[saved]) {
        setLanguageState(saved);
        if (typeof document !== 'undefined') {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // localStorage may be unavailable in restricted environments
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('mausam_language', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch {
      // ignore
    }
  }, []);

  const t = translations[language] || translations.en;
  const locale = getLanguageLocale(language);

  return (
    <LanguageContext.Provider value={{ language, locale, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);


