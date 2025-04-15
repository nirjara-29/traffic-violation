/*const fileUpload = document.getElementById('file-upload');
const previewContainer = document.getElementById('preview-container');
const button = document.getElementById('get-location-button');
const photoLocationBox = document.getElementById('photo-location-box');
let extractedCoordinates = null;
let userCoordinates = null;

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
          extractGPSData(file);

          const removeButton = previewContainer.querySelector('.remove-image');
          removeButton.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              resetFileUpload();
          });
      };

      // Call detectPlate after the image is uploaded
      const detectedPlate = await detectPlate(file);
      if (detectedPlate) {
          document.getElementById('plate-number-input').value = detectedPlate; // Auto-fill plate number
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
          console.log("Detected Plate:", data.plateNumber);
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


function extractGPSData(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const arrayBuffer = event.target.result;

      console.log("File Loaded:", file.name); // Logs filename
      const exifData = EXIF.readFromBinaryFile(arrayBuffer); // Read EXIF

      console.log("RAW EXIF Data:", exifData); // Logs all metadata

      // Check if GPS data exists
      if (exifData && Array.isArray(exifData.GPSLatitude) && Array.isArray(exifData.GPSLongitude)) {
        const latitude = convertDMSToDD(exifData.GPSLatitude, exifData.GPSLatitudeRef);
        const longitude = convertDMSToDD(exifData.GPSLongitude, exifData.GPSLongitudeRef);
        extractedCoordinates = `${latitude}, ${longitude}`;
        photoLocationBox.value = `Lat: ${latitude}, Lng: ${longitude}`;
        console.log("Extracted GPS Data:", extractedCoordinates);
      } else {
        console.warn("No valid GPS data found in EXIF."); // Logs if no GPS data
        alert("No GPS metadata found in the uploaded image.");
      }
    } catch (error) {
      console.error("Error processing EXIF data:", error); // Logs any EXIF read errors
      alert("Error reading EXIF data.");
    }
  };
  reader.readAsArrayBuffer(file);
}


function convertDMSToDD(dmsArray, direction) {
  const degrees = dmsArray[0];
  const minutes = dmsArray[1] / 60;
  const seconds = dmsArray[2] / 3600;
  let decimal = degrees + minutes + seconds;
  if (direction === 'S' || direction === 'W') {
    decimal *= -1;
  }
  return decimal.toFixed(6);
}

function resetFileUpload() {
  extractedCoordinates = null;
  userCoordinates = null;
  fileUpload.value = '';
  previewContainer.innerHTML = `
    <i data-lucide="camera" class="upload-icon"></i>
    <p>Click to upload or drag and drop</p>
    <p class="file-hint">PNG, JPG up to 10MB</p>
  `;
  lucide.createIcons();
}

// Handle form submission starts from here
const form = document.getElementById('violation-form');
const plateNumberInput = document.getElementById('plate-number-input');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    try {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="button-text">Submitting...</span>';

        const plateNumber = plateNumberInput.value; // Get detected plate number
        const violationType = document.getElementById('violation-type').value;
        const description = document.getElementById('description').value;
        const location = photoLocationBox.value;
        const evidencePhoto = "photo-url"; // Replace with actual uploaded photo URL logic

        const reportData = {
            plateNumber,
            violationType,
            description,
            location,
            evidencePhoto,
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
/*
const form = document.getElementById('violation-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;

  try {
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="button-text">Submitting...</span>';

    // Ensure a file is selected
    if (!fileUpload.files.length) {
      alert('Error: Please upload a photo.');
      throw new Error('No file selected.');
    }

    if (!extractedCoordinates) {
      alert('Error: No GPS metadata found in the uploaded image.');
      throw new Error('No GPS metadata found.');
    }

    if (!userCoordinates) {
      alert('Error: User location is required.');
      throw new Error('User location not available.');
    }

    const distance = haversineDistance(userCoordinates, extractedCoordinates);
    console.log(`Calculated Distance: ${distance} meters`);
    if (distance > 7000) {
      alert('Error: Your location does not match the geotagged photo location (must be within 1500 meters).');
      throw new Error('Location mismatch.');
    }

    const containsNumberPlate = await validateNumberPlate(fileUpload.files[0]);
    if (!containsNumberPlate) {
      alert('Error: The uploaded image does not contain a visible number plate.');
      throw new Error('No number plate detected.');
    }

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating network delay
    alert('Report submitted successfully!');
    form.reset();
    resetFileUpload();
  } catch (error) {
    console.error(error);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
});

/*async function validateNumberPlate(file) {
  try {
    const response = await fetch("http://localhost:5500/number-plate-detection", {
      method: 'POST',
      body: file
    });
    const data = await response.json();
    return data.containsNumberPlate;
  } catch (error) {
    console.error('Error validating number plate:', error);
    return false;
  }
}

async function validateNumberPlate(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch("http://localhost:5500/detect-plate", {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      console.error("HTTP Error:", response.status, response.statusText);
      throw new Error("Failed to validate number plate.");
    }

    const data = await response.json();
    return data.containsNumberPlate;
  } catch (error) {
    console.error('Error validating number plate:', error);
    return false;
  }
}


/*function haversineDistance(coords1, coords2) {
  
  const [lat1, lon1] = coords1.split(',').map(Number);
  const [lat2, lon2] = coords2.split(',').map(Number);
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;

    console.log(`Coordinates 1: ${lat1}, ${lon1}`);
    console.log(`Coordinates 2: ${lat2}, ${lon2}`);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));


}

function haversineDistance(coords1, coords2) {
  // Check for valid coordinates
  if (!coords1 || !coords2 || coords1.includes('NaN') || coords2.includes('NaN')) {
    console.error("Invalid coordinates:", coords1, coords2);
    return NaN; // Stops calculation if coordinates are invalid
  }

  const [lat1, lon1] = coords1.split(',').map(Number);
  const [lat2, lon2] = coords2.split(',').map(Number);
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;

  console.log(`Coordinates 1: ${lat1}, ${lon1}`);
  console.log(`Coordinates 2: ${lat2}, ${lon2}`);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


button.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userCoordinates = `${position.coords.latitude}, ${position.coords.longitude}`;
        document.getElementById('location-box').value = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
        console.log("User Coordinates:", userCoordinates);
      },
      (error) => {
        console.error("Geolocation error:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Permission denied. Enable location access in browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location unavailable. Try again later.");
            break;
          case error.TIMEOUT:
            alert("Request timed out. Try again.");
            break;
          default:
            alert("An unknown error occurred.");
        }
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

function failedToGet() {
  alert('There was an issue fetching your location. Please try again.');
}

// Handle drag and drop events
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


*/




























const fileUpload = document.getElementById('file-upload');
const previewContainer = document.getElementById('preview-container');
const button = document.getElementById('get-location-button');
const photoLocationBox = document.getElementById('photo-location-box');
const plateNumberInput = document.getElementById('plate-number-input');
let extractedCoordinates = null;
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
            extractGPSData(file);

            const removeButton = previewContainer.querySelector('.remove-image');
            removeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                resetFileUpload();
            });
        };

        // Call detectPlate after the image is uploaded
const detectedPlate = await detectPlate(file); // Detect plate and store the result
const plateNumberInput = document.getElementById('plate-number-input'); // Reference DOM element

// Debugging to check values
console.log("Detected Plate:", detectedPlate);
console.log("Plate Number Input Element:", plateNumberInput);

if (plateNumberInput) {
    plateNumberInput.value = detectedPlate; // Auto-fill plate number
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
            console.log("Detected Plate:", data.plateNumber);
            cachedPlateNumber = data.plateNumber; // Cache detected plate number
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
function convertDMSToDD(dmsArray, direction) {
  // Handle rational numbers (common in EXIF data)
  const parseRational = (value) => {
      if (Array.isArray(value) && value.length === 2) {
          return value[0] / value[1];
      }
      return Number(value) || 0;
  };

  try {
      const degrees = parseRational(dmsArray[0]);
      const minutes = parseRational(dmsArray[1]);
      const seconds = parseRational(dmsArray[2]);
      
      let decimal = degrees + (minutes / 60) + (seconds / 3600);
      
      // Handle direction properly
      if (direction === 'S' || direction === 'W') {
          decimal = -decimal;
      }
      
      return decimal.toFixed(6);
  } catch (error) {
      console.error('Error converting DMS:', error);
      return NaN;
  }
}

function extractGPSData(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
      try {
          const arrayBuffer = event.target.result;
          const exifData = EXIF.readFromBinaryFile(arrayBuffer);

          console.log("Processed EXIF Data:", {
              GPSLatitude: exifData?.GPSLatitude,
              GPSLongitude: exifData?.GPSLongitude,
              GPSLatitudeRef: exifData?.GPSLatitudeRef,
              GPSLongitudeRef: exifData?.GPSLongitudeRef
          });

          if (exifData?.GPSLatitude && exifData?.GPSLongitude) {
              const lat = convertDMSToDD(exifData.GPSLatitude, exifData.GPSLatitudeRef);
              const lng = convertDMSToDD(exifData.GPSLongitude, exifData.GPSLongitudeRef);

              if (isNaN(lat)) throw new Error('Invalid latitude conversion');
              if (isNaN(lng)) throw new Error('Invalid longitude conversion');

              extractedCoordinates = `${lat}, ${lng}`;
              photoLocationBox.value = `Lat: ${lat}, Lng: ${lng}`;
              console.log("Extracted GPS Data:", extractedCoordinates);
          } else {
              console.warn("No valid GPS data found in EXIF");
              photoLocationBox.value = "No GPS data in photo";
              extractedCoordinates = null;
          }
      } catch (error) {
          console.error("EXIF processing error:", error);
          photoLocationBox.value = "Error reading GPS data";
          extractedCoordinates = null;
      }
  };
  reader.readAsArrayBuffer(file);
}
/*
function extractGPSData(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const arrayBuffer = event.target.result;

            console.log("File Loaded:", file.name);
            const exifData = EXIF.readFromBinaryFile(arrayBuffer);

            console.log("RAW EXIF Data:", exifData);

            if (exifData && Array.isArray(exifData.GPSLatitude) && Array.isArray(exifData.GPSLongitude)) {
                const latitude = convertDMSToDD(exifData.GPSLatitude, exifData.GPSLatitudeRef);
                const longitude = convertDMSToDD(exifData.GPSLongitude, exifData.GPSLongitudeRef);
                extractedCoordinates = `${latitude}, ${longitude}`;
                photoLocationBox.value = `Lat: ${latitude}, Lng: ${longitude}`;
                console.log("Extracted GPS Data:", extractedCoordinates);
            } else {
                console.warn("No valid GPS data found in EXIF.");
                alert("No GPS metadata found in the uploaded image.");
            }
        } catch (error) {
            console.error("Error processing EXIF data:", error);
            alert("Error reading EXIF data.");
        }
    };
    reader.readAsArrayBuffer(file);
}

function convertDMSToDD(dmsArray, direction) {
    const degrees = dmsArray[0];
    const minutes = dmsArray[1] / 60;
    const seconds = dmsArray[2] / 3600;
    let decimal = degrees + minutes + seconds;
    if (direction === 'S' || direction === 'W') {
        decimal *= -1;
    }
    return decimal.toFixed(6);
}*/

function resetFileUpload() {
    extractedCoordinates = null;
    userCoordinates = null;
    cachedPlateNumber = null; // Reset cached plate number
    fileUpload.value = '';
    previewContainer.innerHTML = `
        <i data-lucide="camera" class="upload-icon"></i>
        <p>Click to upload or drag and drop</p>
        <p class="file-hint">PNG, JPG up to 10MB</p>
    `;
    lucide.createIcons();
}

// Handle form submission starts from here
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

        if (!extractedCoordinates) {
            alert("Error: No GPS metadata found.");
            return;
        }

        if (!userCoordinates) {
            alert("Error: User location is required.");
            return;
        }

        const distance = haversineDistance(userCoordinates, extractedCoordinates);
        if (distance > 7000) {
            alert("Error: Location mismatch. The distance between user location and photo location is too large.");
            return;
        }

        const evidencePhotoURL = await uploadPhoto(fileUpload.files[0]);
        if (!evidencePhotoURL) {
            alert("Error: Failed to upload photo. Try again.");
            return;
        }

        const reportData = {
            plateNumber: cachedPlateNumber || plateNumberInput.value, // Use cached or manual plate number
            violationType: document.getElementById('violation-type').value,
            description: document.getElementById('description').value,
            location: photoLocationBox.value,
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
        if (data.success) {
            console.log("Photo Uploaded:", data.photoURL);
            return data.photoURL;
        } else {
            console.error("Error:", data.error);
            alert("Failed to upload photo.");
            return null;
        }
    } catch (error) {
        console.error("Error uploading photo:", error);
        return null;
    }
}
function haversineDistance(coords1, coords2) {
  try {
      const [lat1, lon1] = coords1.split(',').map(Number);
      const [lat2, lon2] = coords2.split(',').map(Number);
      
      if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
          throw new Error('Invalid coordinate values');
      }

      const R = 6371e3; // Earth radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  } catch (error) {
      console.error('Haversine error:', error);
      return Infinity; // Fail safe for distance check
  }
}
/*function haversineDistance(coords1, coords2) {
    if (!coords1 || !coords2 || coords1.includes('NaN') || coords2.includes('NaN')) {
        console.error("Invalid coordinates:", coords1, coords2);
        return NaN;
    }

    const [lat1, lon1] = coords1.split(',').map(Number);
    const [lat2, lon2] = coords2.split(',').map(Number);
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}*/

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

// Handle drag and drop event
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
