<template>
  <div class="theme-switcher">
    <v-btn
      icon
      @click="toggleTheme"
      :aria-label="$t('settings.theme')"
      :title="isDarkMode ? $t('settings.light') : $t('settings.dark')"
    >
      <v-icon>{{ isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ThemeSwitcher',
  
  setup() {
    const store = useStore();
    
    const isDarkMode = computed(() => store.state.settings.darkMode);
    
    const toggleTheme = () => {
      const newMode = !isDarkMode.value;
      store.dispatch('settings/setDarkMode', newMode);
    };
    
    return {
      isDarkMode,
      toggleTheme
    };
  }
};
</script>

<style scoped>
.theme-switcher {
  margin: 0 8px;
}
</style> 