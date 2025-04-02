<template>
  <div class="model-selector mb-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ $t('modelSelector.title') }}</h3>
    
    <!-- Model Selection -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('modelSelector.modelLabel') }}
        </label>
        <div class="grid grid-cols-1 gap-3">
          <div 
            v-for="model in availableModels" 
            :key="model.id"
            class="relative border rounded-lg p-4 cursor-pointer transition-all"
            :class="model.id === selectedModel ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'"
            @click="selectModel(model.id)"
          >
            <div class="flex items-center">
              <div class="mr-3 flex-shrink-0">
                <div 
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  :class="model.id === selectedModel ? 'border-blue-500' : 'border-gray-400'"
                >
                  <div 
                    v-if="model.id === selectedModel" 
                    class="w-3 h-3 rounded-full bg-blue-500"
                  ></div>
                </div>
              </div>
              <div class="flex-grow">
                <div class="font-medium">{{ model.name }}</div>
                <div class="text-sm text-gray-500">{{ model.description }}</div>
              </div>
              <div
                v-if="model.id === selectedModel" 
                class="text-blue-500 flex-shrink-0"
              >
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confidence Threshold Slider -->
      <div>
        <div class="flex justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('modelSelector.confidenceLabel') }}
          </label>
          <span class="text-sm text-blue-600 font-medium">{{ confidenceThreshold * 100 }}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05"
          v-model.number="confidenceThreshold"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        >
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          {{ $t('modelSelector.confidenceHint') }}
        </p>
      </div>

      <!-- Preprocessing Options -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('modelSelector.preprocessingLabel') }}
        </label>
        <select
          v-model="selectedPreprocessing"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option 
            v-for="option in preprocessingOptions" 
            :key="option.id" 
            :value="option.id"
          >
            {{ option.name }}
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-2">
          {{ currentPreprocessingDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ModelSelector',
  
  emits: ['model-changed', 'confidence-changed', 'preprocessing-changed'],
  
  setup(props, { emit }) {
    const store = useStore();
    
    // Get models from store
    const availableModels = computed(() => store.getters['detection/availableModels']);
    const preprocessingOptions = computed(() => store.getters['detection/preprocessingOptions']);
    
    // Local reactive state
    const selectedModel = ref(store.state.detection.selectedModel);
    const confidenceThreshold = ref(store.state.detection.confidenceThreshold);
    const selectedPreprocessing = ref(store.state.detection.selectedPreprocessing);
    
    // Watch for changes from store
    watch(
      () => store.state.detection.selectedModel,
      (newModel) => {
        selectedModel.value = newModel;
      }
    );
    
    watch(
      () => store.state.detection.confidenceThreshold,
      (newThreshold) => {
        confidenceThreshold.value = newThreshold;
      }
    );
    
    watch(
      () => store.state.detection.selectedPreprocessing,
      (newPreprocessing) => {
        selectedPreprocessing.value = newPreprocessing;
      }
    );
    
    // Watch for local changes and update store
    watch(selectedModel, (newModel) => {
      store.dispatch('detection/setModel', newModel);
      emit('model-changed', newModel);
    });
    
    watch(confidenceThreshold, (newThreshold) => {
      store.dispatch('detection/setConfidenceThreshold', newThreshold);
      emit('confidence-changed', newThreshold);
    });
    
    watch(selectedPreprocessing, (newPreprocessing) => {
      store.dispatch('detection/setPreprocessing', newPreprocessing);
      emit('preprocessing-changed', newPreprocessing);
    });
    
    // Methods
    const selectModel = (modelId) => {
      selectedModel.value = modelId;
    };
    
    // Computed
    const currentPreprocessingDescription = computed(() => {
      const currentOption = preprocessingOptions.value.find(
        option => option.id === selectedPreprocessing.value
      );
      return currentOption ? currentOption.description : '';
    });
    
    return {
      availableModels,
      preprocessingOptions,
      selectedModel,
      confidenceThreshold,
      selectedPreprocessing,
      selectModel,
      currentPreprocessingDescription
    };
  }
};
</script>

<style scoped>
/* Custom slider styling */
input[type="range"] {
  -webkit-appearance: none;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: background 0.15s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #2563eb;
}

input[type="range"]::-moz-range-thumb:hover {
  background: #2563eb;
}
</style> 