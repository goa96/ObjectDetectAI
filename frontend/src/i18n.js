import { createI18n } from 'vue-i18n';

// Import locales
import en from './locales/en.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';

// Detect browser language
function getBrowserLanguage() {
  const navigator = window.navigator;
  const browserLang = (navigator.languages && navigator.languages[0]) ||
                      navigator.language ||
                      navigator.userLanguage ||
                      navigator.browserLanguage ||
                      'en';
                      
  // Extract language code only (without region)
  return browserLang.split('-')[0];
}

// Check if language is supported
function getSupportedLanguage(lang) {
  const supportedLanguages = ['en', 'zh', 'es', 'fr', 'de', 'ja'];
  return supportedLanguages.includes(lang) ? lang : 'en';
}

// Try to get language from localStorage, then browser, fallback to English
const storedLang = localStorage.getItem('lang');
const navigatorLang = getBrowserLanguage();
const defaultLocale = storedLang || getSupportedLanguage(navigatorLang) || 'en';

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
    es,
    fr,
    de,
    ja
  },
  silentTranslationWarn: process.env.NODE_ENV === 'production',
  silentFallbackWarn: process.env.NODE_ENV === 'production'
});

export default i18n; 