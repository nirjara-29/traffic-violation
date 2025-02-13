
// Handle file upload and preview
const fileUpload = document.getElementById('file-upload');
const previewContainer = document.getElementById('preview-container');
let currentFile = null;

fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      currentFile = reader.result;
      previewContainer.innerHTML = `
        <img src="${currentFile}" alt="Preview" style="max-height: 200px; border-radius: 0.5rem;">
        <button type="button" class="remove-image" style="position: absolute; top: 0.5rem; right: 0.5rem;">
          <i data-lucide="x-circle"></i>
        </button>
      `;
      lucide.createIcons();
      
      // Add remove button functionality
      const removeButton = previewContainer.querySelector('.remove-image');
      removeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetFileUpload();
      });
    };
    reader.readAsDataURL(file);
  }
});

function resetFileUpload() {
  currentFile = null;
  fileUpload.value = '';
  previewContainer.innerHTML = `
    <i data-lucide="camera" class="upload-icon"></i>
    <p>Click to upload or drag and drop</p>
    <p class="file-hint">PNG, JPG up to 10MB</p>
  `;
  lucide.createIcons();
}

// Handle form submission
const form = document.getElementById('violation-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  
  try {
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="button-text">Submitting...</span>';
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success message
    window.toast.show('Report submitted successfully!', 'success');
    
    // Reset form
    form.reset();
    resetFileUpload();
    
  } catch (error) {
    window.toast.show('Failed to submit report. Please try again.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
});

// Add drag and drop support
const dropZone = document.querySelector('.file-upload');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropZone.classList.add('highlight');
}

function unhighlight(e) {
  dropZone.classList.remove('highlight');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const file = dt.files[0];
  
  if (file && file.type.startsWith('image/')) {
    fileUpload.files = dt.files;
    const event = new Event('change');
    fileUpload.dispatchEvent(event);
  }
}
