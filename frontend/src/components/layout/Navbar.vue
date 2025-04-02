<template>
  <v-app-bar
    app
    elevation="1"
    :color="isDarkMode ? 'grey darken-4' : 'white'"
  >
    <router-link to="/" class="text-decoration-none">
      <v-toolbar-title class="d-flex align-center">
        <v-img
          src="/logo.png"
          max-height="40"
          max-width="40"
          contain
          class="mr-2"
        ></v-img>
        <span class="app-title">{{ $t('common.appName') }}</span>
      </v-toolbar-title>
    </router-link>

    <v-spacer></v-spacer>

    <!-- Desktop Navigation Links -->
    <div class="d-none d-md-flex">
      <v-btn
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        text
        class="mx-1"
      >
        <v-icon left>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
    </div>

    <v-spacer></v-spacer>

    <!-- Language & Theme Switchers -->
    <theme-switcher />
    <language-switcher />

    <!-- User Menu or Login/Register -->
    <div v-if="isAuthenticated">
      <v-menu
        :close-on-content-click="false"
        :nudge-width="200"
        offset-y
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-avatar size="32" color="primary">
              <span class="white--text">{{ userInitials }}</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ user.username }}</v-list-item-title>
                <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list>
            <v-list-item
              v-for="(item, i) in profileMenu"
              :key="i"
              :to="item.to"
              link
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              text
              @click="logout"
            >
              {{ $t('nav.logout') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </div>
    <div v-else class="d-flex">
      <v-btn
        text
        to="/login"
        class="login-btn"
      >
        {{ $t('nav.login') }}
      </v-btn>
      <v-btn
        outlined
        to="/register"
        color="primary"
        class="register-btn ml-2"
      >
        {{ $t('nav.register') }}
      </v-btn>
    </div>

    <!-- Mobile Menu Button -->
    <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
  </v-app-bar>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ThemeSwitcher from '../common/ThemeSwitcher.vue';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';

export default {
  name: 'Navbar',
  
  components: {
    ThemeSwitcher,
    LanguageSwitcher
  },
  
  props: {
    drawer: {
      type: Boolean,
      required: true
    }
  },
  
  emits: ['update:drawer'],
  
  setup(props, { emit }) {
    const store = useStore();
    const router = useRouter();
    const { t } = useI18n();
    
    const isDarkMode = computed(() => store.state.settings.darkMode);
    const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
    const user = computed(() => store.state.user.user || {});

    const userInitials = computed(() => {
      if (!user.value || !user.value.username) return '';
      return user.value.username.substring(0, 2).toUpperCase();
    });

    const drawer = computed({
      get: () => props.drawer,
      set: (value) => emit('update:drawer', value)
    });

    const navItems = computed(() => [
      { title: t('nav.home'), to: '/', icon: 'mdi-home' },
      { title: t('nav.detect'), to: '/detect', icon: 'mdi-magnify' },
      { title: t('nav.history'), to: '/history', icon: 'mdi-history' }
    ]);

    const profileMenu = computed(() => [
      { title: t('nav.profile'), to: '/profile', icon: 'mdi-account' },
      { title: t('nav.settings'), to: '/settings', icon: 'mdi-cog' },
      { title: t('nav.help'), to: '/help', icon: 'mdi-help-circle' }
    ]);

    const logout = async () => {
      await store.dispatch('user/logout');
      router.push('/login');
    };

    return {
      isDarkMode,
      isAuthenticated,
      user,
      userInitials,
      drawer,
      navItems,
      profileMenu,
      logout
    };
  }
};
</script>

<style scoped>
.app-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.login-btn, .register-btn {
  text-transform: none;
  letter-spacing: 0.25px;
}
</style> 