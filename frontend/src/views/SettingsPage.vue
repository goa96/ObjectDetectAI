<template>
  <div class="settings-page">
    <v-container>
      <v-row>
        <v-col cols="12" md="8" lg="6" class="mx-auto">
          <v-card class="my-5">
            <v-card-title class="headline pb-0">{{ $t('settings.title') }}</v-card-title>
            
            <v-card-text>
              <!-- Language Settings -->
              <v-subheader>{{ $t('settings.language') }}</v-subheader>
              <v-radio-group v-model="currentLocale" @change="updateLocale" class="ml-4">
                <v-radio
                  v-for="language in availableLanguages"
                  :key="language.code"
                  :label="language.name"
                  :value="language.code"
                ></v-radio>
              </v-radio-group>

              <v-divider class="my-5"></v-divider>
              
              <!-- Theme Settings -->
              <v-subheader>{{ $t('settings.theme') }}</v-subheader>
              <v-radio-group v-model="themeSettings" @change="updateTheme" class="ml-4">
                <v-radio :label="$t('settings.light')" value="light"></v-radio>
                <v-radio :label="$t('settings.dark')" value="dark"></v-radio>
                <v-radio :label="$t('settings.system')" value="system"></v-radio>
              </v-radio-group>

              <v-divider class="my-5"></v-divider>
              
              <!-- Detection Settings (if authenticated) -->
              <template v-if="isAuthenticated">
                <v-subheader>{{ $t('settings.defaultModel') }}</v-subheader>
                <v-select
                  v-model="defaultModel"
                  :items="modelOptions"
                  item-text="name"
                  item-value="id"
                  outlined
                  dense
                  class="mb-4"
                ></v-select>
                
                <v-switch
                  v-model="saveHistory"
                  :label="$t('settings.saveHistory')"
                  color="primary"
                  class="ml-2 mb-2"
                ></v-switch>

                <v-divider class="my-5"></v-divider>
                
                <!-- API Access Section -->
                <v-subheader>{{ $t('settings.apiAccess') }}</v-subheader>
                <div v-if="apiToken" class="mb-3">
                  <v-text-field
                    v-model="apiToken"
                    readonly
                    outlined
                    dense
                    append-icon="mdi-content-copy"
                    @click:append="copyToClipboard(apiToken)"
                  ></v-text-field>
                  <v-btn color="error" text @click="revokeApiToken">
                    <v-icon left>mdi-delete</v-icon>
                    {{ $t('common.delete') }}
                  </v-btn>
                </div>
                <div v-else>
                  <v-btn color="primary" @click="generateApiToken">
                    <v-icon left>mdi-key</v-icon>
                    {{ $t('settings.generateApiKey') }}
                  </v-btn>
                </div>
              </template>
            </v-card-text>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="resetToDefaults">
                {{ $t('modelSelector.reset') }}
              </v-btn>
              <v-btn color="primary" @click="saveSettings">
                {{ $t('common.save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

export default {
  name: 'SettingsPage',
  
  setup() {
    const store = useStore();
    const i18n = useI18n();
    
    // Language settings
    const availableLanguages = [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
      { code: 'es', name: 'Español' },
      { code: 'zh', name: '中文' }
    ];
    
    const currentLocale = ref(store.state.settings.locale);
    
    // Theme settings
    const isDarkMode = computed(() => store.state.settings.darkMode);
    const themeSettings = ref(isDarkMode.value ? 'dark' : 'light');
    
    // User authentication status
    const isAuthenticated = computed(() => store.getters['user/isAuthenticated']);
    
    // Detection settings
    const modelOptions = computed(() => store.getters['detection/availableModels']);
    const defaultModel = ref(store.state.user.preferences?.defaultModel || 'yolov8s');
    const saveHistory = ref(store.state.user.preferences?.saveHistory !== false);
    
    // API token
    const apiToken = ref('');
    
    // Fetch user settings on mount
    onMounted(async () => {
      if (isAuthenticated.value) {
        try {
          // Example: Load API token if available
          // const response = await AuthService.getApiToken();
          // apiToken.value = response.token;
          
          // Load user preferences
          const userPrefs = store.state.user.preferences;
          if (userPrefs) {
            defaultModel.value = userPrefs.defaultModel || defaultModel.value;
            saveHistory.value = userPrefs.saveHistory !== false;
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      }
    });
    
    // Methods
    const updateLocale = (locale) => {
      store.dispatch('settings/setLocale', locale);
    };
    
    const updateTheme = (theme) => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      store.dispatch('settings/setDarkMode', isDark);
    };
    
    const generateApiToken = async () => {
      try {
        // Example API call to generate token
        // const response = await AuthService.generateApiToken();
        // apiToken.value = response.token;
        apiToken.value = 'example-api-token-' + Math.random().toString(36).substring(2);
        
        store.dispatch('app/showNotification', {
          message: 'API key generated successfully',
          type: 'success'
        });
      } catch (error) {
        store.dispatch('app/setError', error);
      }
    };
    
    const revokeApiToken = async () => {
      try {
        // Example API call to revoke token
        // await AuthService.revokeApiToken();
        apiToken.value = '';
        
        store.dispatch('app/showNotification', {
          message: 'API key revoked successfully',
          type: 'success'
        });
      } catch (error) {
        store.dispatch('app/setError', error);
      }
    };
    
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        store.dispatch('app/showNotification', {
          message: 'Copied to clipboard',
          type: 'success'
        });
      });
    };
    
    const saveSettings = async () => {
      try {
        store.dispatch('app/setLoading', true);
        
        if (isAuthenticated.value) {
          // Save user preferences
          const preferences = {
            defaultModel: defaultModel.value,
            saveHistory: saveHistory.value
          };
          
          await store.dispatch('user/updatePreferences', preferences);
        }
        
        store.dispatch('app/showNotification', {
          message: 'Settings saved successfully',
          type: 'success'
        });
      } catch (error) {
        store.dispatch('app/setError', error);
      } finally {
        store.dispatch('app/setLoading', false);
      }
    };
    
    const resetToDefaults = () => {
      currentLocale.value = 'en';
      themeSettings.value = 'light';
      defaultModel.value = 'yolov8s';
      saveHistory.value = true;
      
      // Apply changes
      updateLocale('en');
      updateTheme('light');
      
      store.dispatch('app/showNotification', {
        message: 'Settings reset to defaults',
        type: 'info'
      });
    };
    
    return {
      availableLanguages,
      currentLocale,
      themeSettings,
      isAuthenticated,
      modelOptions,
      defaultModel,
      saveHistory,
      apiToken,
      updateLocale,
      updateTheme,
      generateApiToken,
      revokeApiToken,
      copyToClipboard,
      saveSettings,
      resetToDefaults
    };
  }
};
</script>

<style scoped>
.settings-page {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 