import { useState, useEffect } from 'react';
import { translations, type Language, type TranslationKey } from '@/lib/i18n';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedLanguage = window.localStorage.getItem('language') as Language | null;
    if (savedLanguage && savedLanguage in translations) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', newLanguage);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] ?? translations.en[key] ?? key;
  };

  return { language, changeLanguage, t };
}
