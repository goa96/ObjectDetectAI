import api from './api';

export default {
  /**
   * Perform object detection on an image
   * @param {Object} detectionParams Object containing detection parameters
   * @returns {Promise} Promise with detection results
   */
  detectObjects(detectionParams) {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add image file or base64 string
    if (detectionParams.image instanceof File) {
      formData.append('image', detectionParams.image);
    } else if (typeof detectionParams.image === 'string' && detectionParams.image.startsWith('data:')) {
      // Handle base64 image
      const blob = this.dataURItoBlob(detectionParams.image);
      formData.append('image', blob, 'image.jpg');
    } else if (typeof detectionParams.image === 'string') {
      // Assume it's a URL
      formData.append('imageUrl', detectionParams.image);
    }
    
    // Add other parameters
    formData.append('model', detectionParams.model);
    formData.append('confidenceThreshold', detectionParams.confidenceThreshold);
    formData.append('preprocessing', detectionParams.preprocessing);
    
    // Add user ID if available
    if (detectionParams.userId) {
      formData.append('userId', detectionParams.userId);
    }
    
    return api.post('/detection', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  /**
   * Get detection history for authenticated user
   * @returns {Promise} Promise with detection history
   */
  getDetectionHistory() {
    return api.get('/detection/history');
  },
  
  /**
   * Get detection details by ID
   * @param {string|number} id Detection record ID
   * @returns {Promise} Promise with detection details
   */
  getDetectionById(id) {
    return api.get(`/detection/${id}`);
  },
  
  /**
   * Delete a detection record
   * @param {string|number} id Detection record ID
   * @returns {Promise} Promise indicating success
   */
  deleteDetection(id) {
    return api.delete(`/detection/${id}`);
  },
  
  /**
   * Convert data URI to Blob
   * @param {string} dataURI Base64 data URI
   * @returns {Blob} Blob object
   */
  dataURItoBlob(dataURI) {
    // Convert base64/URLEncoded data component to raw binary data
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = decodeURIComponent(dataURI.split(',')[1]);
    }
    
    // Separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
    // Write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ia], { type: mimeString });
  },
  
  /**
   * Download detection results as JSON
   * @param {string|number} id Detection record ID
   * @returns {Promise} Promise with downloadable blob
   */
  downloadResults(id) {
    return api.get(`/detection/${id}/download`, {
      responseType: 'blob'
    });
  },
  
  /**
   * Download detection image with bounding boxes
   * @param {string|number} id Detection record ID
   * @returns {Promise} Promise with downloadable blob
   */
  downloadResultImage(id) {
    return api.get(`/detection/${id}/image`, {
      responseType: 'blob'
    });
  },
  
  /**
   * Share detection results (generates shareable link)
   * @param {string|number} id Detection record ID
   * @returns {Promise} Promise with shareable link
   */
  shareResults(id) {
    return api.post(`/detection/${id}/share`);
  }
}; 