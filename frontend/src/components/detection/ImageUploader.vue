<template>
  <div class="image-uploader">
    <!-- Image Upload Section -->
    <div v-if="!currentImage" class="mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-3">{{ $t('uploader.title') }}</h3>
      
      <!-- Dropzone -->
      <div 
        class="dropzone p-8 mb-4 text-center border-2 border-dashed rounded-lg transition-colors"
        :class="[isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50']"
        @dragenter.prevent="isDragging = true"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div class="text-5xl text-blue-500 mb-3">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <p class="text-gray-700 mb-2">{{ $t('uploader.dragDrop') }}</p>
        <p class="text-sm text-gray-500 mb-4">{{ $t('uploader.or') }}</p>
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          @click="triggerFileInput"
        >
          <i class="fas fa-file-upload mr-2"></i> {{ $t('uploader.browseFiles') }}
        </button>
        <input 
          ref="fileInput"
          type="file" 
          class="hidden" 
          accept="image/*"
          @change="handleFileInput"
        >
        <p class="mt-4 text-xs text-gray-500">
          {{ $t('uploader.supportedFormats') }}: JPG, PNG, BMP, GIF
        </p>
      </div>

      <!-- URL Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('uploader.urlLabel') }}:
        </label>
        <div class="flex">
          <input 
            v-model="imageUrl" 
            type="text" 
            placeholder="https://example.com/image.jpg" 
            class="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            @keyup.enter="loadImageFromUrl"
          >
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            @click="loadImageFromUrl"
          >
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Image Preview with Controls -->
    <div v-else class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-gray-800">{{ $t('uploader.preview') }}</h3>
        <button 
          class="text-sm text-gray-600 hover:text-blue-600 focus:outline-none"
          @click="resetImage"
        >
          <i class="fas fa-times mr-1"></i> {{ $t('uploader.changeImage') }}
        </button>
      </div>
      
      <div class="relative bg-gray-100 rounded-lg overflow-hidden">
        <img 
          :src="previewUrl" 
          alt="Preview image" 
          class="w-full object-contain max-h-96"
        >
        
        <div 
          v-if="isLoading" 
          class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div class="bg-white p-4 rounded-lg shadow text-center">
            <div class="loading-spinner mx-auto mb-2"></div>
            <p class="text-sm text-gray-700">{{ $t('uploader.loading') }}</p>
          </div>
        </div>
      </div>
      
      <div class="mt-3 text-sm text-gray-600">
        <p v-if="imageFile">
          <span class="font-medium">{{ $t('uploader.fileName') }}:</span> {{ imageFile.name }} 
          ({{ formatFileSize(imageFile.size) }})
        </p>
        <p v-else-if="imageUrl">
          <span class="font-medium">{{ $t('uploader.source') }}:</span> {{ imageUrl }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'ImageUploader',
  
  emits: ['image-loaded', 'image-error'],
  
  setup(props, { emit }) {
    const store = useStore();
    const fileInput = ref(null);
    const isDragging = ref(false);
    const imageFile = ref(null);
    const imageUrl = ref('');
    const previewUrl = ref('');
    const isLoading = ref(false);
    
    // Get the current image from Vuex store
    const currentImage = computed(() => store.state.detection.currentImage);
    
    // Watch for changes to store image and update local preview
    watch(
      () => store.state.detection.currentImage,
      (newImage) => {
        if (newImage) {
          if (typeof newImage === 'string') {
            previewUrl.value = newImage;
            imageUrl.value = newImage;
          } else if (newImage instanceof File) {
            previewUrl.value = URL.createObjectURL(newImage);
            imageFile.value = newImage;
          }
        } else {
          resetImage();
        }
      }
    );
    
    // Trigger the file input click
    const triggerFileInput = () => {
      fileInput.value.click();
    };
    
    // Handle file selection via file input
    const handleFileInput = (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    };
    
    // Handle file drop
    const handleDrop = (event) => {
      isDragging.value = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    };
    
    // Process the selected file
    const processFile = (file) => {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        store.dispatch('app/showNotification', {
          message: 'Please select an image file',
          type: 'error'
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        store.dispatch('app/showNotification', {
          message: 'Image size must be less than 10MB',
          type: 'error'
        });
        return;
      }
      
      imageFile.value = file;
      previewUrl.value = URL.createObjectURL(file);
      imageUrl.value = '';
      
      // Update store
      store.dispatch('detection/setCurrentImage', file);
      
      // Emit event
      emit('image-loaded', file);
    };
    
    // Load image from URL
    const loadImageFromUrl = () => {
      if (!imageUrl.value) {
        store.dispatch('app/showNotification', {
          message: 'Please enter an image URL',
          type: 'warning'
        });
        return;
      }
      
      isLoading.value = true;
      
      // Check if URL is valid
      try {
        new URL(imageUrl.value);
      } catch (e) {
        store.dispatch('app/showNotification', {
          message: 'Please enter a valid URL',
          type: 'error'
        });
        isLoading.value = false;
        return;
      }
      
      // Load image to validate it
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        // Valid image
        previewUrl.value = imageUrl.value;
        imageFile.value = null;
        isLoading.value = false;
        
        // Update store
        store.dispatch('detection/setCurrentImage', imageUrl.value);
        
        // Emit event
        emit('image-loaded', imageUrl.value);
      };
      
      img.onerror = () => {
        store.dispatch('app/showNotification', {
          message: 'Could not load image from URL',
          type: 'error'
        });
        isLoading.value = false;
        emit('image-error', 'Could not load image from URL');
      };
      
      img.src = imageUrl.value;
    };
    
    // Reset the image
    const resetImage = () => {
      imageFile.value = null;
      imageUrl.value = '';
      previewUrl.value = '';
      
      // Reset file input
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      
      // Clear store
      store.dispatch('detection/clearCurrentImage');
    };
    
    // Format file size
    const formatFileSize = (bytes) => {
      if (bytes < 1024) {
        return bytes + ' B';
      } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
      } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      }
    };
    
    return {
      fileInput,
      isDragging,
      imageFile,
      imageUrl,
      previewUrl,
      isLoading,
      currentImage,
      triggerFileInput,
      handleFileInput,
      handleDrop,
      loadImageFromUrl,
      resetImage,
      formatFileSize
    };
  }
};
</script>

<style scoped>
.dropzone {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Fix for Safari to ensure the dragover effect works */
.dropzone * {
  pointer-events: none;
}

.loading-spinner {
  width: 24px;
  height: 24px;
}
</style> 