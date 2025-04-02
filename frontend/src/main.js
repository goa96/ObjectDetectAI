import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

// Import language files
import en from './locales/en.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';

// Import CSS
import './assets/css/tailwind.css';

// Get initial locale from store or browser
const getInitialLocale = () => {
  // Try to get from store first
  const storedLocale = store.state.settings?.locale;
  if (storedLocale) return storedLocale;
  
  // Try to get from browser
  const browserLang = navigator.language || navigator.userLanguage;
  const lang = browserLang.split('-')[0];
  
  // Check if supported
  const supportedLocales = ['en', 'fr', 'es', 'zh', 'de', 'ja'];
  return supportedLocales.includes(lang) ? lang : 'en';
};

// Configure i18n
const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
    es,
    fr,
    de,
    ja
  },
  silentTranslationWarn: process.env.NODE_ENV === 'production'
});

// Configure Vuetify
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: store.state.settings?.darkMode ? 'dark' : 'light',
    themes: {
      light: {
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#8B5CF6',
          error: '#EF4444',
          info: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          background: '#F9FAFB'
        }
      },
      dark: {
        colors: {
          primary: '#60A5FA',
          secondary: '#9CA3AF',
          accent: '#A78BFA',
          error: '#F87171',
          info: '#60A5FA',
          success: '#34D399',
          warning: '#FBBF24',
          background: '#111827'
        }
      }
    }
  }
});

const app = createApp(App);

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info);
  store.dispatch('app/setError', {
    message: err.message || 'An unexpected error occurred',
    details: info
  });
};

// Register plugins
app.use(router)
   .use(store)
   .use(i18n)
   .use(vuetify);

// Mount app
app.mount('#app'); 