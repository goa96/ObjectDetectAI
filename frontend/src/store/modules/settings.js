import { nextTick } from 'vue';
import i18n from '@/i18n';

export default {
  namespaced: true,
  state: {
    locale: 'en',
    darkMode: false,
    uiSettings: {
      sidebarCollapsed: false,
      showTips: true
    }
  },
  mutations: {
    SET_LOCALE(state, locale) {
      state.locale = locale;
    },
    TOGGLE_DARK_MODE(state) {
      state.darkMode = !state.darkMode;
    },
    SET_DARK_MODE(state, isDark) {
      state.darkMode = isDark;
    },
    SET_SIDEBAR_COLLAPSED(state, isCollapsed) {
      state.uiSettings.sidebarCollapsed = isCollapsed;
    },
    TOGGLE_TIPS(state) {
      state.uiSettings.showTips = !state.uiSettings.showTips;
    }
  },
  actions: {
    // Set application locale
    async setLocale({ commit, dispatch }, locale) {
      try {
        // Update i18n locale
        i18n.global.locale = locale;
        commit('SET_LOCALE', locale);
        
        // Also update user preferences if logged in
        dispatch('user/setLanguage', locale, { root: true });
        
        // Apply RTL if needed (for languages like Arabic, Hebrew)
        const isRTL = ['ar', 'he'].includes(locale);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        
        return locale;
      } catch (error) {
        console.error('Failed to set locale:', error);
      }
    },
    
    // Toggle dark mode
    toggleDarkMode({ commit, state, dispatch }) {
      commit('TOGGLE_DARK_MODE');
      
      // Apply dark mode class to body
      if (state.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      // Also update user preferences if logged in
      dispatch('user/toggleDarkMode', null, { root: true });
    },
    
    // Set dark mode explicitly
    setDarkMode({ commit, dispatch }, isDark) {
      commit('SET_DARK_MODE', isDark);
      
      // Apply dark mode class to body
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      // Update user preferences if logged in
      if (isDark !== undefined) {
        dispatch('user/updatePreferences', { darkMode: isDark }, { root: true });
      }
    },
    
    // Initialize settings on app load
    initSettings({ state, dispatch }) {
      // Apply current settings
      
      // Apply locale
      i18n.global.locale = state.locale;
      document.documentElement.lang = state.locale;
      
      // Apply RTL if needed
      const isRTL = ['ar', 'he'].includes(state.locale);
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      
      // Apply dark mode
      if (state.darkMode) {
        nextTick(() => {
          document.body.classList.add('dark-mode');
        });
      }
    },
    
    // UI Settings
    setSidebarCollapsed({ commit }, isCollapsed) {
      commit('SET_SIDEBAR_COLLAPSED', isCollapsed);
    },
    
    toggleTips({ commit }) {
      commit('TOGGLE_TIPS');
    }
  },
  getters: {
    locale: state => state.locale,
    darkMode: state => state.darkMode,
    isSidebarCollapsed: state => state.uiSettings.sidebarCollapsed,
    showTips: state => state.uiSettings.showTips
  }
}; 