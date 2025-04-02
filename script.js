/**
 * ObjectDetectAI - Interactive functionality
 * High-fidelity prototype
 */

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const dropzone = document.querySelector('.dropzone');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = 'image/*,video/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  const browseButton = document.querySelector('.dropzone button');
  const urlInput = document.querySelector('input[type="text"]');
  const urlButton = document.querySelector('input[type="text"] + button');
  const confidenceSlider = document.querySelector('input[type="range"]');
  const confidenceValue = document.querySelector('.confidence-threshold span');
  const startDetectionButton = document.querySelector('button.w-full');
  const resetButton = document.querySelector('button .fa-redo-alt').parentElement;
  const tabButtons = document.querySelectorAll('.flex.border-b button');
  const detectedObjects = document.querySelectorAll('.detected-object');
  const tableRows = document.querySelectorAll('tbody tr');
  const modelSelect = document.querySelector('select');
  const loadingIndicator = document.querySelector('.absolute.inset-0.bg-black');
  const languageSelector = document.querySelector('.language-selector');
  const classTagsContainer = document.querySelector('.flex.flex-wrap.gap-2');
  const downloadButton = document.querySelector('.fa-download').parentElement;
  const shareButton = document.querySelector('.fa-share-alt').parentElement;
  const apiButton = document.querySelector('.fa-code').parentElement;

  // File Upload via Dropzone
  if (dropzone) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Highlight dropzone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
      dropzone.classList.add('bg-blue-50');
    }

    function unhighlight() {
      dropzone.classList.remove('bg-blue-50');
    }

    // Handle dropped files
    dropzone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    }

    function handleFiles(files) {
      if (files.length > 0) {
        simulateUpload();
      }
    }

    // Click to browse files
    if (browseButton) {
      browseButton.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          simulateUpload();
        }
      });
    }
  }

  // URL input handling
  if (urlButton) {
    urlButton.addEventListener('click', () => {
      if (urlInput.value.trim() !== '') {
        simulateUpload();
      }
    });

    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && urlInput.value.trim() !== '') {
        simulateUpload();
      }
    });
  }

  // Confidence threshold slider
  if (confidenceSlider && confidenceValue) {
    confidenceSlider.addEventListener('input', () => {
      confidenceValue.textContent = confidenceSlider.value + '%';
    });
  }

  // Tab switching functionality
  if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all tabs
        tabButtons.forEach(btn => {
          btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
          btn.classList.add('text-gray-500');
        });
        
        // Add active class to clicked tab
        button.classList.remove('text-gray-500');
        button.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
      });
    });
  }

  // Interactive detection objects
  if (detectedObjects.length > 0 && tableRows.length > 0) {
    detectedObjects.forEach(obj => {
      obj.addEventListener('click', function() {
        // Reset all rows
        tableRows.forEach(row => row.classList.remove('bg-blue-50'));
        
        // Highlight corresponding row
        if (this.querySelector('.detected-object-label').textContent.includes('Cat')) {
          tableRows[0].classList.add('bg-blue-50');
        } else {
          tableRows[1].classList.add('bg-blue-50');
        }
      });
    });

    tableRows.forEach((row, index) => {
      row.addEventListener('click', () => {
        // Highlight the corresponding detection box
        detectedObjects.forEach(obj => {
          obj.classList.remove('border-2', 'border-yellow-500');
          obj.classList.add('border-2', 'border-blue-600');
        });

        if (index === 0) {
          detectedObjects[0].classList.remove('border-blue-600');
          detectedObjects[0].classList.add('border-yellow-500');
        } else {
          detectedObjects[1].classList.remove('border-blue-600');
          detectedObjects[1].classList.add('border-yellow-500');
        }
      });
    });
  }

  // Start detection button
  if (startDetectionButton) {
    startDetectionButton.addEventListener('click', () => {
      simulateDetection();
    });
  }

  // Reset button
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      // Reset form fields
      if (urlInput) urlInput.value = '';
      if (confidenceSlider) {
        confidenceSlider.value = 75;
        if (confidenceValue) confidenceValue.textContent = '75%';
      }
      if (modelSelect) modelSelect.selectedIndex = 0;
      
      // Reset detection boxes to default
      detectedObjects.forEach(obj => {
        obj.classList.remove('border-yellow-500');
        obj.classList.add('border-blue-600');
      });
      
      // Reset table highlights
      tableRows.forEach(row => row.classList.remove('bg-blue-50'));
    });
  }

  // Language selector
  if (languageSelector) {
    const languageItems = languageSelector.querySelectorAll('.language-dropdown a');
    const languageDisplay = languageSelector.querySelector('button span');
    
    languageItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const language = item.textContent.trim();
        const languageCode = getLanguageCode(language);
        
        languageDisplay.textContent = languageCode;
        // Here you would actually change the language
        simulateLanguageChange(language);
      });
    });
  }

  // Class tags
  if (classTagsContainer) {
    const removeBtns = classTagsContainer.querySelectorAll('.fa-times');
    const addClassBtn = classTagsContainer.querySelector('.bg-gray-100');
    
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('span').remove();
      });
    });
    
    if (addClassBtn) {
      addClassBtn.addEventListener('click', () => {
        // Simulate adding a new class
        const classInput = prompt('Enter object class name:');
        if (classInput && classInput.trim() !== '') {
          const newTag = document.createElement('span');
          newTag.className = 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm';
          newTag.innerHTML = `${classInput} <i class="fas fa-times ml-1 cursor-pointer"></i>`;
          
          classTagsContainer.insertBefore(newTag, addClassBtn);
          
          // Add event listener to the new remove button
          const newRemoveBtn = newTag.querySelector('.fa-times');
          newRemoveBtn.addEventListener('click', () => {
            newTag.remove();
          });
        }
      });
    }
  }

  // Action buttons
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      simulateDownload();
    });
  }

  if (shareButton) {
    shareButton.addEventListener('click', () => {
      simulateShare();
    });
  }

  if (apiButton) {
    apiButton.addEventListener('click', () => {
      simulateApiAccess();
    });
  }

  // Helper functions
  function simulateUpload() {
    // Show loading indicator
    const preview = document.querySelector('.aspect-w-16');
    if (preview) {
      preview.classList.add('opacity-50');
      setTimeout(() => {
        preview.classList.remove('opacity-50');
        // Here you would actually update the preview with the new image
      }, 1500);
    }
  }

  function simulateDetection() {
    if (loadingIndicator) {
      loadingIndicator.classList.remove('hidden');
      loadingIndicator.style.display = 'flex';
      
      // Simulate processing time
      setTimeout(() => {
        loadingIndicator.classList.add('hidden');
        // Show detection results
        // This would be where the API would return results
      }, 2500);
    }
  }

  function getLanguageCode(language) {
    const languageCodes = {
      'English': 'EN',
      '中文': 'CN',
      'Español': 'ES',
      'Français': 'FR',
      'Deutsch': 'DE',
      '日本語': 'JP'
    };
    
    return languageCodes[language] || 'EN';
  }

  function simulateLanguageChange(language) {
    // In a real app, this would change the UI language
    console.log(`Language changed to: ${language}`);
    // Show a notification
    showNotification(`Interface language changed to ${language}`);
  }

  function simulateDownload() {
    // In a real app, this would download results
    showNotification('Downloading detection results...');
    
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = 'object_detection_results.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  }

  function simulateShare() {
    // In a real app, this would open sharing options
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Object Detection Results',
        text: 'Check out these detection results from ObjectDetectAI!',
        url: shareUrl,
      })
      .catch(() => {
        showNotification('Sharing link copied to clipboard!');
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      showNotification('Sharing link copied to clipboard!');
    }
  }

  function simulateApiAccess() {
    // In a real app, this would show API documentation or code snippets
    const apiCodeSnippet = `
    // Example API Request
    fetch('https://api.objectdetectai.com/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        image_url: 'https://example.com/image.jpg',
        confidence_threshold: 0.75,
        model: 'standard'
      })
    })
    .then(response => response.json())
    .then(data => console.log(data));
    `;
    
    // Display in a modal or alert for this prototype
    alert('API Code Example:\n\n' + apiCodeSnippet);
  }

  function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }

  // Add missing CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-out {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(10px); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
    .animate-fade-out {
      animation: fade-out 0.3s ease-in forwards;
    }
  `;
  document.head.appendChild(style);
}); 