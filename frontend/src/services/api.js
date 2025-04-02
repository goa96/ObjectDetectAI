import axios from 'axios';
import store from '@/store';
import router from '@/router';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    // Get token from store
    const token = store.getters['user/token'];
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add current locale to headers
    const locale = store.getters['settings/locale'];
    if (locale) {
      config.headers['Accept-Language'] = locale;
    }
    
    return config;
  },
  error => {
    // Do something with request error
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    // Any status code within the range of 2xx causes this function to trigger
    return response.data;
  },
  error => {
    // Any status codes outside the range of 2xx cause this function to trigger
    const { response } = error;
    
    if (response) {
      // Handle specific error statuses
      switch (response.status) {
        case 401: // Unauthorized
          // Clear auth and redirect to login
          store.dispatch('user/logout');
          router.push('/login');
          break;
        
        case 403: // Forbidden
          store.dispatch('app/showNotification', {
            message: 'You do not have permission to perform this action',
            type: 'error'
          });
          break;
        
        case 404: // Not found
          router.push('/not-found');
          break;
        
        case 422: // Validation error
          const validationErrors = response.data.errors;
          if (validationErrors) {
            // Format and return validation errors
            return Promise.reject({
              message: response.data.message || 'Validation failed',
              errors: validationErrors
            });
          }
          break;
        
        case 500: // Server error
          store.dispatch('app/showNotification', {
            message: 'Server error occurred. Please try again later.',
            type: 'error'
          });
          break;
          
        default:
          // Handle other errors
          store.dispatch('app/showNotification', {
            message: response.data.message || 'An error occurred',
            type: 'error'
          });
      }
    } else if (error.request) {
      // The request was made but no response was received
      store.dispatch('app/showNotification', {
        message: 'No response from server. Please check your connection.',
        type: 'error'
      });
    } else {
      // Something happened in setting up the request
      store.dispatch('app/showNotification', {
        message: error.message || 'An error occurred while processing your request',
        type: 'error'
      });
    }
    
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default api; 