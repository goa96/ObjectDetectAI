<template>
  <v-navigation-drawer
    v-model="drawerValue"
    app
    temporary
    :width="280"
  >
    <v-list-item class="pa-4">
      <v-list-item-content>
        <v-list-item-title class="text-h6">
          {{ $t('common.appName') }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ $t('home.subtitle') }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <!-- Navigation Links -->
    <v-list nav dense>
      <v-list-item
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        link
        @click="closeDrawer"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <!-- Auth / User Profile Links -->
    <v-list nav dense>
      <template v-if="isAuthenticated">
        <v-list-item to="/profile" link @click="closeDrawer">
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('nav.profile') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/settings" link @click="closeDrawer">
          <v-list-item-icon>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('nav.settings') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="logout">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('nav.logout') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <template v-else>
        <v-list-item to="/login" link @click="closeDrawer">
          <v-list-item-icon>
            <v-icon>mdi-login</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('nav.login') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item to="/register" link @click="closeDrawer">
          <v-list-item-icon>
            <v-icon>mdi-account-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('nav.register') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>

    <template v-slot:append>
      <div class="pa-4">
        <div class="d-flex align-center mb-4">
          <language-switcher />
          <theme-switcher />
        </div>
        <v-btn
          block
          color="primary"
          to="/detect"
          @click="closeDrawer"
        >
          <v-icon left>mdi-magnify</v-icon>
          {{ $t('modelSelector.startDetection') }}
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';
import ThemeSwitcher from '../common/ThemeSwitcher.vue';

export default {
  name: 'MobileDrawer',
  
  components: {
    LanguageSwitcher,
    ThemeSwitcher
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
    
    const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
    
    // Two-way binding for drawer
    const drawerValue = computed({
      get: () => props.drawer,
      set: (value) => emit('update:drawer', value)
    });
    
    const navItems = computed(() => [
      { title: t('nav.home'), to: '/', icon: 'mdi-home' },
      { title: t('nav.detect'), to: '/detect', icon: 'mdi-magnify' },
      { title: t('nav.history'), to: '/history', icon: 'mdi-history' }
    ]);
    
    const closeDrawer = () => {
      drawerValue.value = false;
    };
    
    const logout = async () => {
      closeDrawer();
      await store.dispatch('user/logout');
      router.push('/login');
    };
    
    return {
      isAuthenticated,
      drawerValue,
      navItems,
      closeDrawer,
      logout
    };
  }
};
</script>

<style scoped>
/* Add any custom styles for the drawer here */
</style> 