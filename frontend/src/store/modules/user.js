import AuthService from '@/services/auth';
import router from '@/router';

export default {
  namespaced: true,
  state: {
    token: null,
    user: null,
    preferences: {
      language: 'en',
      darkMode: false
    }
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    CLEAR_AUTH(state) {
      state.token = null;
      state.user = null;
    },
    SET_PREFERENCES(state, preferences) {
      state.preferences = { ...state.preferences, ...preferences };
    },
    SET_LANGUAGE(state, language) {
      state.preferences.language = language;
    },
    TOGGLE_DARK_MODE(state) {
      state.preferences.darkMode = !state.preferences.darkMode;
    }
  },
  actions: {
    // Register a new user
    async register({ commit, dispatch }, userData) {
      try {
        dispatch('app/setLoadingWithMessage', { 
          loading: true, 
          message: 'Creating your account...' 
        }, { root: true });
        
        const response = await AuthService.register(userData);
        
        commit('SET_TOKEN', response.token);
        commit('SET_USER', response.user);
        
        dispatch('app/showNotification', {
          message: 'Account created successfully!',
          type: 'success'
        }, { root: true });
        
        // Set default preferences from API
        if (response.user.preferences) {
          commit('SET_PREFERENCES', response.user.preferences);
        }
        
        // Redirect to detection page
        router.push('/detect');
        
        return response;
      } catch (error) {
        dispatch('app/setError', error, { root: true });
        throw error;
      } finally {
        dispatch('app/setLoading', false, { root: true });
      }
    },
    
    // Login user
    async login({ commit, dispatch }, credentials) {
      try {
        dispatch('app/setLoadingWithMessage', { 
          loading: true, 
          message: 'Logging in...' 
        }, { root: true });
        
        const response = await AuthService.login(credentials);
        
        commit('SET_TOKEN', response.token);
        commit('SET_USER', response.user);
        
        // Set language preference
        if (response.user.preferences && response.user.preferences.language) {
          commit('SET_LANGUAGE', response.user.preferences.language);
        }
        
        dispatch('app/showNotification', {
          message: 'Login successful',
          type: 'success'
        }, { root: true });
        
        // Redirect to previous page or default
        const redirectPath = router.currentRoute.value.query.redirect || '/detect';
        router.push(redirectPath);
        
        return response;
      } catch (error) {
        dispatch('app/setError', error, { root: true });
        throw error;
      } finally {
        dispatch('app/setLoading', false, { root: true });
      }
    },
    
    // Logout user
    async logout({ commit, dispatch }) {
      try {
        dispatch('app/setLoading', true, { root: true });
        
        await AuthService.logout();
        
        commit('CLEAR_AUTH');
        
        dispatch('app/showNotification', {
          message: 'You have been logged out',
          type: 'info'
        }, { root: true });
        
        // Redirect to home
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        dispatch('app/setLoading', false, { root: true });
      }
    },
    
    // Check if user is authenticated (call on app load)
    async checkAuth({ commit, dispatch, state }) {
      // If we have a token but no user, fetch user data
      if (state.token && !state.user) {
        try {
          dispatch('app/setLoading', true, { root: true });
          
          const user = await AuthService.getProfile();
          commit('SET_USER', user);
          
          // Update preferences
          if (user.preferences) {
            commit('SET_PREFERENCES', user.preferences);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is likely invalid, clear auth
          commit('CLEAR_AUTH');
        } finally {
          dispatch('app/setLoading', false, { root: true });
        }
      }
    },
    
    // Update user profile
    async updateProfile({ commit, dispatch }, userData) {
      try {
        dispatch('app/setLoadingWithMessage', { 
          loading: true, 
          message: 'Updating profile...' 
        }, { root: true });
        
        const updatedUser = await AuthService.updateProfile(userData);
        commit('SET_USER', updatedUser);
        
        dispatch('app/showNotification', {
          message: 'Profile updated successfully',
          type: 'success'
        }, { root: true });
        
        return updatedUser;
      } catch (error) {
        dispatch('app/setError', error, { root: true });
        throw error;
      } finally {
        dispatch('app/setLoading', false, { root: true });
      }
    },
    
    // Update user preferences
    async updatePreferences({ commit, dispatch, state }, preferences) {
      try {
        // Update local state first for immediate feedback
        commit('SET_PREFERENCES', preferences);
        
        // Only send API request if user is logged in
        if (state.user && state.token) {
          await AuthService.updatePreferences(preferences);
        }
        
        return state.preferences;
      } catch (error) {
        dispatch('app/setError', error, { root: true });
        throw error;
      }
    },
    
    // Set UI language
    setLanguage({ commit, dispatch }, language) {
      commit('SET_LANGUAGE', language);
      dispatch('updatePreferences', { language });
    },
    
    // Toggle dark mode
    toggleDarkMode({ commit, dispatch, state }) {
      commit('TOGGLE_DARK_MODE');
      dispatch('updatePreferences', { darkMode: state.preferences.darkMode });
    }
  },
  getters: {
    isAuthenticated: state => !!state.token && !!state.user,
    currentUser: state => state.user,
    token: state => state.token,
    language: state => state.preferences.language,
    darkMode: state => state.preferences.darkMode,
    userId: state => state.user ? state.user.id : null
  }
}; 