import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';
import ml from './locales/ml.json';
import kn from './locales/kn.json';
import te from './locales/te.json';

const STORAGE_KEY = 'oceanguard-lang';

const savedLanguage =
  typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;

const supported = (code: string | null): code is 'en' | 'ta' | 'ml' | 'kn' | 'te' =>
  !!code && ['en', 'ta', 'ml', 'kn', 'te'].includes(code);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
    ml: { translation: ml },
    kn: { translation: kn },
    te: { translation: te },
  },
  lng: supported(savedLanguage) ? savedLanguage : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Persist the user's language choice so it survives reloads.
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18n;
