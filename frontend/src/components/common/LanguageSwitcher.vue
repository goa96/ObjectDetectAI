<template>
  <div class="language-switcher">
    <v-menu
      :close-on-content-click="true"
      :nudge-width="200"
      offset-y
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          text
          v-bind="attrs"
          v-on="on"
          class="language-btn"
        >
          <v-icon left>mdi-translate</v-icon>
          {{ currentLanguageName }}
          <v-icon right>mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="(language, i) in availableLanguages"
          :key="i"
          @click="changeLanguage(language.code)"
          :class="{ 'v-list-item--active': currentLocale === language.code }"
        >
          <v-list-item-title>{{ language.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

export default {
  name: 'LanguageSwitcher',
  
  setup() {
    const store = useStore();
    const i18n = useI18n();
    
    const availableLanguages = [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
      { code: 'es', name: 'Español' },
      { code: 'zh', name: '中文' }
    ];

    const currentLocale = computed(() => store.state.settings.locale);
    
    const currentLanguageName = computed(() => {
      const lang = availableLanguages.find(l => l.code === currentLocale.value);
      return lang ? lang.name : 'English';
    });

    const changeLanguage = (locale) => {
      i18n.locale.value = locale;
      store.dispatch('settings/setLocale', locale);
      
      // Also update user preferences if logged in
      if (store.getters['user/isAuthenticated']) {
        store.dispatch('user/updatePreferences', { language: locale });
      }
    };

    return {
      availableLanguages,
      currentLocale,
      currentLanguageName,
      changeLanguage
    };
  }
};
</script>

<style scoped>
.language-switcher {
  margin: 0 8px;
}

.language-btn {
  text-transform: none;
}
</style> 