<template>
  <v-footer :color="isDarkMode ? 'grey darken-4' : 'white'" class="footer">
    <v-container>
      <v-row>
        <!-- Resources Section -->
        <v-col cols="12" md="4" class="py-4">
          <h3 class="text-h6 mb-3">{{ $t('footer.resources') }}</h3>
          <div class="d-flex flex-column">
            <v-btn text class="text-left pa-0 mb-2">
              <v-icon left size="18">mdi-file-document-outline</v-icon>
              {{ $t('footer.documentation') }}
            </v-btn>
            <v-btn text class="text-left pa-0 mb-2">
              <v-icon left size="18">mdi-api</v-icon>
              {{ $t('footer.api') }}
            </v-btn>
            <v-btn text class="text-left pa-0 mb-2">
              <v-icon left size="18">mdi-school-outline</v-icon>
              {{ $t('footer.tutorials') }}
            </v-btn>
            <v-btn text class="text-left pa-0">
              <v-icon left size="18">mdi-post-outline</v-icon>
              {{ $t('footer.blog') }}
            </v-btn>
          </div>
        </v-col>

        <!-- Company Section -->
        <v-col cols="12" md="4" class="py-4">
          <h3 class="text-h6 mb-3">{{ $t('footer.company') }}</h3>
          <div class="d-flex flex-column">
            <v-btn text class="text-left pa-0 mb-2">
              <v-icon left size="18">mdi-information-outline</v-icon>
              {{ $t('footer.about') }}
            </v-btn>
            <v-btn text class="text-left pa-0 mb-2">
              <v-icon left size="18">mdi-briefcase-outline</v-icon>
              {{ $t('footer.careers') }}
            </v-btn>
            <v-btn text class="text-left pa-0 mb-2">
              <v-icon left size="18">mdi-email-outline</v-icon>
              {{ $t('footer.contact') }}
            </v-btn>
            <div class="d-flex mt-2">
              <v-btn icon>
                <v-icon>mdi-twitter</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-linkedin</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-github</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- Newsletter Section -->
        <v-col cols="12" md="4" class="py-4">
          <h3 class="text-h6 mb-3">{{ $t('footer.newsletter') }}</h3>
          <v-form @submit.prevent="subscribeNewsletter">
            <v-text-field
              v-model="email"
              :label="$t('auth.email')"
              outlined
              dense
              hide-details
              class="mb-2"
            ></v-text-field>
            <v-btn
              color="primary"
              depressed
              type="submit"
              :loading="subscribing"
              :disabled="!isValidEmail"
            >
              {{ $t('footer.subscribe') }}
            </v-btn>
          </v-form>
          <div class="mt-4 d-flex">
            <v-btn text small class="pa-0 mr-4">
              {{ $t('footer.privacy') }}
            </v-btn>
            <v-btn text small class="pa-0">
              {{ $t('footer.terms') }}
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Copyright -->
      <v-divider></v-divider>
      <div class="d-flex justify-center py-4 text-body-2">
        {{ $t('footer.copyright') }}
      </div>
    </v-container>
  </v-footer>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AppFooter',
  
  setup() {
    const store = useStore();
    const email = ref('');
    const subscribing = ref(false);
    
    const isDarkMode = computed(() => store.state.settings.darkMode);
    
    const isValidEmail = computed(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.value);
    });
    
    const subscribeNewsletter = async () => {
      if (!isValidEmail.value) return;
      
      subscribing.value = true;
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Success notification
        store.dispatch('app/showNotification', {
          message: 'Thank you for subscribing to our newsletter!',
          type: 'success'
        });
        
        // Reset form
        email.value = '';
      } catch (error) {
        store.dispatch('app/setError', error);
      } finally {
        subscribing.value = false;
      }
    };
    
    return {
      email,
      subscribing,
      isDarkMode,
      isValidEmail,
      subscribeNewsletter
    };
  }
};
</script>

<style scoped>
.footer {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.v-footer {
  flex-shrink: 0;
}
</style> 