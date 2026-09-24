import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import te from './te.json';
import mr from './mr.json';
import bn from './bn.json';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'bn';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  shortLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', shortLabel: 'EN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', shortLabel: 'हि' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', shortLabel: 'த' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', shortLabel: 'తె' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', shortLabel: 'म' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', shortLabel: 'বা' },
];

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (keyPath: string, fallback?: string) => string;
  isHindi: boolean;
  currentLangMeta: LanguageOption;
  languages: LanguageOption[];
}

const translations: Record<LanguageCode, Record<string, any>> = {
  en,
  hi,
  ta,
  te,
  mr,
  bn,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('kaarigar_lang') as LanguageCode;
    const validCodes: LanguageCode[] = ['en', 'hi', 'ta', 'te', 'mr', 'bn'];
    return validCodes.includes(saved) ? saved : 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('kaarigar_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to Hindi if regional, or English
        let fallbackVal: any = translations.en;
        for (const fbKey of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fbKey in fallbackVal) {
            fallbackVal = fallbackVal[fbKey];
          } else {
            return fallback || keyPath;
          }
        }
        return typeof fallbackVal === 'string' ? fallbackVal : (fallback || keyPath);
      }
    }

    return typeof current === 'string' ? current : (fallback || keyPath);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isHindi: language === 'hi',
        currentLangMeta,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
