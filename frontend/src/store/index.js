import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

// Import modules
import user from './modules/user';
import detection from './modules/detection';
import settings from './modules/settings';

// App module for global state
const app = {
  namespaced: true,
  state: {
    loading: false,
    loadingMessage: '',
    notification: {
      show: false,
      message: '',
      type: 'info', // info, success, error, warning
      timeout: 3000
    },
    error: null
  },
  mutations: {
    SET_LOADING(state, { loading, message = '' }) {
      state.loading = loading;
      state.loadingMessage = message;
    },
    SET_NOTIFICATION(state, { show, message = '', type = 'info', timeout = 3000 }) {
      state.notification = { show, message, type, timeout };
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', { loading });
    },
    setLoadingWithMessage({ commit }, { loading, message }) {
      commit('SET_LOADING', { loading, message });
    },
    showNotification({ commit, dispatch }, { message, type = 'info', timeout = 3000 }) {
      commit('SET_NOTIFICATION', { show: true, message, type, timeout });
      
      // Auto-hide notification after timeout
      if (timeout > 0) {
        setTimeout(() => {
          dispatch('hideNotification');
        }, timeout);
      }
    },
    hideNotification({ commit }) {
      commit('SET_NOTIFICATION', { show: false });
    },
    setError({ commit, dispatch }, error) {
      commit('SET_ERROR', error);
      dispatch('showNotification', {
        message: error.message || 'An error occurred',
        type: 'error'
      });
    },
    clearError({ commit }) {
      commit('CLEAR_ERROR');
    }
  },
  getters: {
    isLoading: state => state.loading,
    loadingMessage: state => state.loadingMessage,
    notification: state => state.notification,
    hasError: state => state.error !== null,
    error: state => state.error
  }
};

// Create store
export default createStore({
  modules: {
    app,
    user,
    detection,
    settings
  },
  // Enable persistence for specific modules
  plugins: [
    createPersistedState({
      key: 'objectdetectai',
      paths: ['user.token', 'settings', 'user.preferences']
    })
  ],
  strict: process.env.NODE_ENV !== 'production'
}); 