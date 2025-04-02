import api from './api';

export default {
  /**
   * Register a new user
   * @param {Object} userData User registration data
   * @returns {Promise} Promise with user data and token
   */
  register(userData) {
    return api.post('/auth/register', userData);
  },
  
  /**
   * Login a user
   * @param {Object} credentials User login credentials
   * @returns {Promise} Promise with user data and token
   */
  login(credentials) {
    return api.post('/auth/login', credentials);
  },
  
  /**
   * Logout the current user
   * @returns {Promise} Promise indicating success
   */
  logout() {
    return api.post('/auth/logout');
  },
  
  /**
   * Get the authenticated user's profile
   * @returns {Promise} Promise with user data
   */
  getProfile() {
    return api.get('/auth/profile');
  },
  
  /**
   * Update user profile
   * @param {Object} userData Updated user data
   * @returns {Promise} Promise with updated user data
   */
  updateProfile(userData) {
    return api.put('/auth/profile', userData);
  },
  
  /**
   * Update user preferences
   * @param {Object} preferences User preferences data
   * @returns {Promise} Promise with updated preferences
   */
  updatePreferences(preferences) {
    return api.put('/auth/preferences', preferences);
  },
  
  /**
   * Change user password
   * @param {Object} passwordData Object containing old and new passwords
   * @returns {Promise} Promise indicating success
   */
  changePassword(passwordData) {
    return api.put('/auth/password', passwordData);
  },
  
  /**
   * Request password reset
   * @param {Object} emailData Object containing user email
   * @returns {Promise} Promise indicating success
   */
  requestPasswordReset(emailData) {
    return api.post('/auth/password/reset', emailData);
  },
  
  /**
   * Reset password with token
   * @param {Object} resetData Object containing token and new password
   * @returns {Promise} Promise indicating success
   */
  resetPassword(resetData) {
    return api.post('/auth/password/reset/confirm', resetData);
  },
  
  /**
   * Verify email address
   * @param {string} token Email verification token
   * @returns {Promise} Promise indicating success
   */
  verifyEmail(token) {
    return api.get(`/auth/email/verify/${token}`);
  }
}; 