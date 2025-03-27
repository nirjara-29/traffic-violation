const fileUpload = document.getElementById('file-upload');
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
      const currentFile = reader.result; // const as it's never reassigned
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
    reader.readAsDataURL(file);
  }
});

function extractGPSData(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const arrayBuffer = event.target.result;
      if (!(arrayBuffer instanceof ArrayBuffer)) {
        console.error("FileReader did not return an ArrayBuffer:", arrayBuffer);
        throw new Error("Invalid data format: Not an ArrayBuffer");
      }

      console.log("File Loaded:", file.name);
      const exifData = EXIF.readFromBinaryFile(arrayBuffer);
      console.log("RAW EXIF Data:", exifData);

      if (exifData && exifData.GPSLatitude && exifData.GPSLongitude) {
        const latitude = convertDMSToDD(exifData.GPSLatitude, exifData.GPSLatitudeRef);
        const longitude = convertDMSToDD(exifData.GPSLongitude, exifData.GPSLongitudeRef);
        extractedCoordinates = `${latitude}, ${longitude}`;
        photoLocationBox.value = `Lat: ${latitude}, Lng: ${longitude}`;
        console.log("Extracted GPS Data:", extractedCoordinates);
      } else {
        console.warn("No GPS data found in image.");
        alert("No GPS metadata found in the uploaded image.");
      }
    } catch (error) {
      console.error("Error processing EXIF data:", error);
      alert("Error reading EXIF data.");
    }
  };
  reader.readAsArrayBuffer(file); // Ensure we're reading as ArrayBuffer
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

async function validateNumberPlate(file) {
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

function haversineDistance(coords1, coords2) {
  
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











