const fileUpload = document.getElementById('file-upload');
const previewContainer = document.getElementById('preview-container');
const button = document.getElementById('get-location-button');
const plateNumberInput = document.getElementById('plate-number-input');
let userCoordinates = null;
let cachedPlateNumber = null; // For caching detected plate numbers

// Handle file upload and preview
fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const currentFile = reader.result;
            previewContainer.innerHTML = `
                <img src="${currentFile}" alt="Preview" style="max-height: 200px; border-radius: 0.5rem;">
                <button type="button" class="remove-image" style="position: absolute; top: 0.5rem; right: 0.5rem;">
                    <i data-lucide="x-circle"></i>
                </button>
            `;
            lucide.createIcons();

            const removeButton = previewContainer.querySelector('.remove-image');
            removeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                resetFileUpload();
            });
        };

        // Call detectPlate after the image is uploaded
        const detectedPlate = await detectPlate(file);
        const plateNumberInput = document.getElementById('plate-number-input');

        if (plateNumberInput) {
            plateNumberInput.value = detectedPlate;
        } else {
            console.error("Element with ID 'plate-number-input' not found.");
        }

        reader.readAsDataURL(file);
    }
});

async function detectPlate(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("http://localhost:5000/api/detect-plate", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (data.success) {
            cachedPlateNumber = data.plateNumber;
            return data.plateNumber;
        } else {
            console.error("Error:", data.error);
            alert("Failed to detect plate.");
            return null;
        }
    } catch (error) {
        console.error("Error detecting plate:", error);
        alert("Error detecting plate.");
        return null;
    }
}

function resetFileUpload() {
    userCoordinates = null;
    cachedPlateNumber = null;
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

        if (!fileUpload.files.length) {
            alert("Error: Please upload a photo.");
            return;
        }

        if (!userCoordinates) {
            alert("Error: User location is required.");
            return;
        }

        const evidencePhotoURL = await uploadPhoto(fileUpload.files[0]);
        if (!evidencePhotoURL) {
            alert("Error: Failed to upload photo. Try again.");
            return;
        }

        const reportData = {
            plateNumber: cachedPlateNumber || plateNumberInput.value,
            violationType: document.getElementById('violation-type').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location-box').value,
            evidencePhoto: evidencePhotoURL,
        };

        const response = await fetch("http://localhost:5000/api/report-violation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reportData),
        });

        const data = await response.json();
        if (data.success) {
            alert("Report submitted successfully!");
            form.reset();
            resetFileUpload();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error submitting report:", error);
        alert("Error submitting report.");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});
async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);

  try {
      const response = await fetch("http://localhost:5000/api/upload-photo", {
          method: "POST",
          body: formData,
      });
      const data = await response.json();
      console.log("Response from upload-photo API:", data); // Debug the full response
      if (data.success) {
          console.log("Successfully fetched photo URL:", data.photoURL); // Log photo URL
          return data.photoURL;
      } else {
          console.error("Error in API response:", data.error); // Log errors in API response
          return null;
      }
  } catch (error) {
      console.error("Error uploading photo:", error); // Log network or code errors
      return null;
  }
}



button.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                gotLocation(position);
            },
            (error) => {
                failedToGet(error);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

function gotLocation(position) {
    userCoordinates = `${position.coords.latitude}, ${position.coords.longitude}`;
    document.getElementById('location-box').value = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
}

function failedToGet(error) {
    const errorMessages = {
        1: "Permission denied. Enable location access in browser settings.",
        2: "Location unavailable. Try again later.",
        3: "Request timed out. Try again.",
    };
    alert(errorMessages[error.code] || "An unknown error occurred.");
}

// Handle drag and drop
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