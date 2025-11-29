// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const uploadZone = document.getElementById('uploadZone');
const imageContainer = document.getElementById('imageContainer');
const uploadedImage = document.getElementById('uploadedImage');
const markerOverlay = document.getElementById('markerOverlay');
const outputList = document.getElementById('outputList');
const clearMarkersBtn = document.getElementById('clearMarkers');
const toast = document.getElementById('toast');

// State
let isImageLoaded = false;

// --- Event Listeners ---

// File Upload (Input)
imageUpload.addEventListener('change', handleFileSelect);

// Drag & Drop
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    loadImage(file);
  }
});

// Image Click
imageContainer.addEventListener('click', handleImageClick);

// Clear Markers
clearMarkersBtn.addEventListener('click', clearAll);

// --- Functions ---

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) loadImage(file);
}

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedImage.src = e.target.result;
    uploadedImage.onload = function() {
      isImageLoaded = true;
      uploadZone.style.display = 'none'; // Hide upload zone
      imageContainer.style.display = 'inline-block'; // Show image
      
      // Reset overlay size
      markerOverlay.style.width = uploadedImage.clientWidth + 'px';
      markerOverlay.style.height = uploadedImage.clientHeight + 'px';
      
      clearAll(); // Reset state for new image
    };
  };
  reader.readAsDataURL(file);
}

function calculateCoordinates(xNatural, yNatural) {
  // Yaw: -180 to 180
  const yaw = (xNatural / uploadedImage.naturalWidth) * 360 - 180;
  // Pitch: 90 to -90
  const pitch = 90 - (yNatural / uploadedImage.naturalHeight) * 180;
  return { yaw, pitch };
}

function handleImageClick(event) {
  if (!isImageLoaded) return;

  const rect = imageContainer.getBoundingClientRect();
  const xDisplay = event.clientX - rect.left;
  const yDisplay = event.clientY - rect.top;

  // Scale factors
  const scaleX = uploadedImage.naturalWidth / uploadedImage.clientWidth;
  const scaleY = uploadedImage.naturalHeight / uploadedImage.clientHeight;

  const xNatural = xDisplay * scaleX;
  const yNatural = yDisplay * scaleY;

  const { yaw, pitch } = calculateCoordinates(xNatural, yNatural);

  addMarker(xDisplay, yDisplay);
  addCoordinateToList(yaw, pitch);
}

function addMarker(x, y) {
  const marker = document.createElement('div');
  marker.classList.add('marker');
  marker.style.left = x + 'px';
  marker.style.top = y + 'px';
  markerOverlay.appendChild(marker);
}

function addCoordinateToList(yaw, pitch) {
  // Remove empty state message if it exists
  if (outputList.children.length === 1 && outputList.firstElementChild.innerText.includes('Click on the image')) {
    outputList.innerHTML = '';
  }

  const yawFixed = yaw.toFixed(2);
  const pitchFixed = pitch.toFixed(2);
  const textToCopy = `yaw: ${yawFixed}, pitch: ${pitchFixed}`;

  const li = document.createElement('li');
  li.className = 'coordinate-item';
  li.innerHTML = `
    <div class="coord-values">
      <div><span class="coord-label">YAW</span><span class="coord-val">${yawFixed}°</span></div>
      <div><span class="coord-label">PITCH</span><span class="coord-val">${pitchFixed}°</span></div>
    </div>
    <button class="copy-btn" title="Copy to clipboard" onclick="copyToClipboard('${textToCopy}')">
      Copy
    </button>
  `;
  
  // Prepend to show newest first
  outputList.insertBefore(li, outputList.firstChild);
}

function clearAll() {
  markerOverlay.innerHTML = '';
  outputList.innerHTML = `
    <li style="padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.875rem; font-style: italic;">
      Click on the image to add points
    </li>
  `;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast();
  });
}

function showToast() {
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// Handle window resize to adjust overlay if needed (simple approach)
window.addEventListener('resize', () => {
  if(isImageLoaded) {
     markerOverlay.style.width = uploadedImage.clientWidth + 'px';
     markerOverlay.style.height = uploadedImage.clientHeight + 'px';
  }
});
