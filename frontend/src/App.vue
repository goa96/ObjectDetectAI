<template>
  <div class="app min-h-screen flex flex-col">
    <Navbar v-if="!isLoginPage" v-model:drawer="drawer" />
    <MobileDrawer v-if="!isLoginPage" v-model:drawer="drawer" />
    
    <main class="flex-grow">
      <router-view />
    </main>
    
    <Footer v-if="!isLoginPage" />
    
    <!-- Global Notification System -->
    <div v-if="notification.show" 
         :class="[
           'fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform',
           `bg-${notification.type}-500 text-white`,
           notification.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
         ]">
      <div class="flex items-center">
        <span v-if="notification.type === 'success'" class="mr-2">
          <i class="fas fa-check-circle"></i>
        </span>
        <span v-if="notification.type === 'error'" class="mr-2">
          <i class="fas fa-exclamation-circle"></i>
        </span>
        <span v-if="notification.type === 'info'" class="mr-2">
          <i class="fas fa-info-circle"></i>
        </span>
        <span v-if="notification.type === 'warning'" class="mr-2">
          <i class="fas fa-exclamation-triangle"></i>
        </span>
        <span>{{ notification.message }}</span>
        <button @click="closeNotification" class="ml-4 text-white hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-800 font-medium">{{ loadingMessage || 'Loading...' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, watch, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import Navbar from './components/layout/Navbar.vue';
import Footer from './components/common/Footer.vue';
import MobileDrawer from './components/layout/MobileDrawer.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    MobileDrawer
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const drawer = ref(false);
    
    // Check if user is authenticated on app load
    onMounted(() => {
      store.dispatch('user/checkAuth');
      
      // Initialize settings
      store.dispatch('settings/initSettings');
      
      // Add event listener for system dark mode changes if using system theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleThemeChange = (e) => {
        if (store.state.settings.uiSettings.themeMode === 'system') {
          store.dispatch('settings/setDarkMode', e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleThemeChange);
    });
    
    // Detect language changes
    watch(
      () => store.state.user.preferences?.language,
      (newLang) => {
        if (newLang) {
          document.documentElement.lang = newLang;
          // Update i18n locale through store
          store.dispatch('settings/setLocale', newLang);
        }
      }
    );
    
    // Computed properties
    const isLoginPage = computed(() => {
      return route.path === '/login' || route.path === '/register';
    });
    
    const notification = computed(() => store.state.app.notification);
    
    const isLoading = computed(() => store.state.app.loading);
    
    const loadingMessage = computed(() => store.state.app.loadingMessage);
    
    // Methods
    const closeNotification = () => {
      store.dispatch('app/hideNotification');
    };
    
    return {
      isLoginPage,
      notification,
      isLoading,
      loadingMessage,
      closeNotification,
      drawer
    };
  }
};
</script>

<style>
/* Global styles */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  @apply bg-gray-50 text-gray-900;
}

.loading-spinner {
  @apply w-10 h-10;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  border-top: 3px solid #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Make images responsive by default */
img {
  max-width: 100%;
  height: auto;
}

/* Dark mode styles */
body.dark-mode {
  @apply bg-gray-900 text-gray-200;
}
</style> 