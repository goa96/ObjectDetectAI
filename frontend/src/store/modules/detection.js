import DetectionService from '@/services/detection';
import router from '@/router';

export default {
  namespaced: true,
  state: {
    availableModels: [
      { id: 'yolov8n', name: 'YOLOv8 Nano', description: 'Fast detection, lower accuracy' },
      { id: 'yolov8s', name: 'YOLOv8 Small', description: 'Balanced speed and accuracy' },
      { id: 'yolov8m', name: 'YOLOv8 Medium', description: 'Higher accuracy, slower processing' }
    ],
    preprocessingOptions: [
      { id: 'none', name: 'None', description: 'No preprocessing' },
      { id: 'enhance', name: 'Light Enhancement', description: 'Improve visibility in dark images' },
      { id: 'denoise', name: 'Noise Reduction', description: 'Reduce noise in low-quality images' },
      { id: 'sharpen', name: 'Sharpen', description: 'Enhance edges and details' }
    ],
    selectedModel: 'yolov8s',
    confidenceThreshold: 0.5,
    selectedPreprocessing: 'none',
    currentImage: null,
    detectionResults: null,
    processingTime: null,
    recentDetections: [],
    detectionHistory: []
  },
  mutations: {
    SET_SELECTED_MODEL(state, modelId) {
      state.selectedModel = modelId;
    },
    SET_CONFIDENCE_THRESHOLD(state, threshold) {
      state.confidenceThreshold = threshold;
    },
    SET_PREPROCESSING(state, preprocessingId) {
      state.selectedPreprocessing = preprocessingId;
    },
    SET_CURRENT_IMAGE(state, imageData) {
      state.currentImage = imageData;
    },
    CLEAR_CURRENT_IMAGE(state) {
      state.currentImage = null;
    },
    SET_DETECTION_RESULTS(state, results) {
      state.detectionResults = results;
    },
    SET_PROCESSING_TIME(state, time) {
      state.processingTime = time;
    },
    ADD_RECENT_DETECTION(state, detection) {
      // Add to recent detections (max 5)
      state.recentDetections.unshift(detection);
      if (state.recentDetections.length > 5) {
        state.recentDetections.pop();
      }
    },
    SET_DETECTION_HISTORY(state, history) {
      state.detectionHistory = history;
    },
    CLEAR_DETECTION_RESULTS(state) {
      state.detectionResults = null;
      state.processingTime = null;
    }
  },
  actions: {
    // Set detection parameters
    setModel({ commit }, modelId) {
      commit('SET_SELECTED_MODEL', modelId);
    },
    
    setConfidenceThreshold({ commit }, threshold) {
      commit('SET_CONFIDENCE_THRESHOLD', threshold);
    },
    
    setPreprocessing({ commit }, preprocessingId) {
      commit('SET_PREPROCESSING', preprocessingId);
    },
    
    // Set current image for detection
    setCurrentImage({ commit }, imageData) {
      commit('SET_CURRENT_IMAGE', imageData);
    },
    
    clearCurrentImage({ commit }) {
      commit('CLEAR_CURRENT_IMAGE');
    },
    
    // Perform object detection on current image
    async detectObjects({ commit, state, dispatch, rootGetters }) {
      if (!state.currentImage) {
        dispatch('app/showNotification', {
          message: 'Please select an image for detection',
          type: 'warning'
        }, { root: true });
        return;
      }
      
      try {
        dispatch('app/setLoadingWithMessage', {
          loading: true,
          message: 'Analyzing image...'
        }, { root: true });
        
        const detectionParams = {
          model: state.selectedModel,
          confidenceThreshold: state.confidenceThreshold,
          preprocessing: state.selectedPreprocessing,
          image: state.currentImage
        };
        
        // Add user ID if authenticated
        if (rootGetters['user/isAuthenticated']) {
          detectionParams.userId = rootGetters['user/userId'];
        }
        
        const response = await DetectionService.detectObjects(detectionParams);
        
        commit('SET_DETECTION_RESULTS', response.results);
        commit('SET_PROCESSING_TIME', response.processingTime);
        
        // Add to recent detections
        if (response.id) {
          const detectionRecord = {
            id: response.id,
            timestamp: new Date(),
            modelUsed: state.selectedModel,
            objectCount: response.results.length,
            imageUrl: response.imageUrl,
            resultImageUrl: response.resultImageUrl
          };
          
          commit('ADD_RECENT_DETECTION', detectionRecord);
        }
        
        dispatch('app/showNotification', {
          message: `Detection completed! Found ${response.results.length} objects.`,
          type: 'success'
        }, { root: true });
        
        // Navigate to results page
        if (response.id) {
          router.push(`/results/${response.id}`);
        }
        
        return response;
      } catch (error) {
        dispatch('app/setError', error, { root: true });
        throw error;
      } finally {
        dispatch('app/setLoading', false, { root: true });
      }
    },
    
    // Load detection history
    async loadDetectionHistory({ commit, dispatch, rootGetters }) {
      // Only fetch history if user is logged in
      if (!rootGetters['user/isAuthenticated']) {
        return;
      }
      
      try {
        dispatch('app/setLoading', true, { root: true });
        
        const history = await DetectionService.getDetectionHistory();
        commit('SET_DETECTION_HISTORY', history);
        
        return history;
      } catch (error) {
        dispatch('app/setError', error, { root: true });
        throw error;
      } finally {
        dispatch('app/setLoading', false, { root: true });
      }
    },
    
    // Get detection details by ID
    async getDetectionById({ dispatch }, detectionId) {
      try {
        dispatch('app/setLoadingWithMessage', {
          loading: true,
          message: 'Loading detection results...'
        }, { root: true });
        
        const detection = await DetectionService.getDetectionById(detectionId);
        return detection;
      } catch (error) {
        dispatch('app/setError', error, { root: true });
        throw error;
      } finally {
        dispatch('app/setLoading', false, { root: true });
      }
    },
    
    // Delete a detection record
    async deleteDetection({ dispatch, state }, detectionId) {
      try {
        dispatch('app/setLoading', true, { root: true });
        
        await DetectionService.deleteDetection(detectionId);
        
        // Update history after deletion
        dispatch('loadDetectionHistory');
        
        dispatch('app/showNotification', {
          message: 'Detection record deleted successfully',
          type: 'success'
        }, { root: true });
      } catch (error) {
        dispatch('app/setError', error, { root: true });
        throw error;
      } finally {
        dispatch('app/setLoading', false, { root: true });
      }
    },
    
    // Clear current detection results
    clearResults({ commit }) {
      commit('CLEAR_DETECTION_RESULTS');
    }
  },
  getters: {
    availableModels: state => state.availableModels,
    preprocessingOptions: state => state.preprocessingOptions,
    currentModel: state => {
      return state.availableModels.find(model => model.id === state.selectedModel) || state.availableModels[0];
    },
    currentPreprocessing: state => {
      return state.preprocessingOptions.find(option => option.id === state.selectedPreprocessing) || state.preprocessingOptions[0];
    },
    hasCurrentImage: state => !!state.currentImage,
    hasResults: state => !!state.detectionResults,
    detectionCount: state => state.detectionResults ? state.detectionResults.length : 0,
    recentDetections: state => state.recentDetections,
    detectionHistory: state => state.detectionHistory
  }
}; 