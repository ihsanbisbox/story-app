import AddStoryPresenter from '../../presenters/AddStoryPresenter';
import CameraHandler from '../components/CameraHandler';
import MapComponent from '../components/MapComponent';

class AddStoryPage {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.cameraHandler = null;
    this.mapComponent = null;
  }

  async render(container) {
    container.innerHTML = `
      <section class="add-story-page">
        <header class="page-header">
          <h1>Share Your Story</h1>
          <p>Capture and share your moment with the community</p>
        </header>

        <form id="add-story-form" class="story-form" novalidate>
          <div class="form-group">
            <label for="story-description">Story Description</label>
            <textarea 
              id="story-description" 
              name="description" 
              class="form-control"
              rows="4"
              placeholder="What's your story?"
              required
              aria-required="true"
              aria-describedby="description-error"
            ></textarea>
            <div id="description-error" class="error-message" role="alert" aria-live="polite"></div>
          </div>

          <div class="form-group">
            <label for="story-photo">Photo</label>
            <div class="photo-capture-container">
              <div class="camera-preview">
                <video id="camera-video" autoplay playsinline></video>
                <canvas id="camera-canvas" style="display: none;"></canvas>
                <img id="photo-preview" alt="Photo preview" style="display: none;">
              </div>
              
              <div class="camera-controls">
                <button type="button" id="start-camera" class="btn btn-secondary">
                  <i class="fas fa-camera" aria-hidden="true"></i> Start Camera
                </button>
                <button type="button" id="capture-photo" class="btn btn-primary" style="display: none;">
                  <i class="fas fa-camera" aria-hidden="true"></i> Capture
                </button>
                <button type="button" id="switch-camera" class="btn btn-secondary" style="display: none;">
                  <i class="fas fa-sync-alt" aria-hidden="true"></i> Switch
                </button>
                <button type="button" id="retake-photo" class="btn btn-secondary" style="display: none;">
                  <i class="fas fa-redo" aria-hidden="true"></i> Retake
                </button>
              </div>
              
              <div class="file-upload">
                <input 
                  type="file" 
                  id="photo-file" 
                  accept="image/*" 
                  class="form-control"
                  aria-describedby="photo-error"
                >
                <label for="photo-file" class="btn btn-secondary">
                  <i class="fas fa-upload" aria-hidden="true"></i> Upload from device
                </label>
              </div>
              <div id="photo-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>
          </div>

          <div class="form-group">
            <label>Location (Optional)</label>
            <div class="location-container">
              <div id="location-map" class="location-map" role="application" aria-label="Select story location"></div>
              <div class="location-controls">
                <button type="button" id="use-current-location" class="btn btn-secondary">
                  <i class="fas fa-location-arrow" aria-hidden="true"></i> Use Current Location
                </button>
                <p class="location-hint">Click on the map to select location</p>
              </div>
              <div class="selected-location" id="selected-location" style="display: none;">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span id="location-text"></span>
                <button type="button" id="clear-location" class="btn-icon" aria-label="Clear location">
                  <i class="fas fa-times" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="submit-story">
              <i class="fas fa-paper-plane" aria-hidden="true"></i> Share Story
            </button>
            <a href="#/" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </section>
    `;

    this.initCamera();
    this.initMap();
    await this.presenter.init();
  }

  setupEventListeners(presenter) {
    const form = document.getElementById('add-story-form');
    const startCameraBtn = document.getElementById('start-camera');
    const capturePhotoBtn = document.getElementById('capture-photo');
    const switchCameraBtn = document.getElementById('switch-camera');
    const retakePhotoBtn = document.getElementById('retake-photo');
    const fileInput = document.getElementById('photo-file');
    const useCurrentLocationBtn = document.getElementById('use-current-location');
    const clearLocationBtn = document.getElementById('clear-location');

    form.addEventListener('submit', (e) => this.handleSubmit(e, presenter));
    startCameraBtn.addEventListener('click', () => this.startCamera());
    capturePhotoBtn.addEventListener('click', () => this.capturePhoto(presenter));
    switchCameraBtn.addEventListener('click', () => this.switchCamera());
    retakePhotoBtn.addEventListener('click', () => this.retakePhoto(presenter));
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e, presenter));
    useCurrentLocationBtn.addEventListener('click', () => this.useCurrentLocation());
    
    if (clearLocationBtn) {
      clearLocationBtn.addEventListener('click', () => this.clearLocation(presenter));
    }

    // Map click event
    this.mapComponent.enableClickToGetLocation((lat, lng) => {
      this.setLocation(lat, lng, presenter);
    });
  }

  handleSubmit(event, presenter) {
    event.preventDefault();
    
    // Clear previous errors
    this.clearError('description-error');
    this.clearError('photo-error');
    
    // Get form values
    const description = document.getElementById('story-description').value.trim();
    
    // Validate form using presenter
    if (presenter.validateForm(description, presenter.getPhotoBlob())) {
      presenter.submitStory(description, presenter.getPhotoBlob(), presenter.getSelectedLocation());
    }
  }

  initCamera() {
    const videoElement = document.getElementById('camera-video');
    const canvasElement = document.getElementById('camera-canvas');
    this.cameraHandler = new CameraHandler(videoElement, canvasElement);
  }

  initMap() {
    this.mapComponent = new MapComponent('location-map', {
      center: [-6.200000, 106.816666],
      zoom: 13
    });
    return this.mapComponent.init();
  }

  async startCamera() {
    try {
      await this.cameraHandler.startCamera();
      document.getElementById('camera-video').style.display = 'block';
      document.getElementById('photo-preview').style.display = 'none';
      document.getElementById('start-camera').style.display = 'none';
      document.getElementById('capture-photo').style.display = 'inline-block';
      document.getElementById('switch-camera').style.display = 'inline-block';
    } catch (error) {
      this.showError('photo-error', 'Failed to access camera. Please check permissions.');
    }
  }

  async capturePhoto(presenter) {
    try {
      const photoBlob = await this.cameraHandler.capturePhoto();
      presenter.setPhotoBlob(photoBlob);
      
      const photoPreview = document.getElementById('photo-preview');
      photoPreview.src = URL.createObjectURL(photoBlob);
      photoPreview.style.display = 'block';
      
      document.getElementById('camera-video').style.display = 'none';
      document.getElementById('capture-photo').style.display = 'none';
      document.getElementById('switch-camera').style.display = 'none';
      document.getElementById('retake-photo').style.display = 'inline-block';
      
      this.cameraHandler.stopCamera();
    } catch (error) {
      this.showError('photo-error', 'Failed to capture photo. Please try again.');
    }
  }

  async switchCamera() {
    try {
      await this.cameraHandler.switchCamera();
    } catch (error) {
      this.showError('photo-error', 'Failed to switch camera.');
    }
  }

  retakePhoto(presenter) {
    presenter.setPhotoBlob(null);
    this.startCamera();
  }

  handleFileSelect(event, presenter) {
    const file = event.target.files[0];
    if (file) {
      presenter.setPhotoBlob(file);
      const photoPreview = document.getElementById('photo-preview');
      photoPreview.src = URL.createObjectURL(file);
      photoPreview.style.display = 'block';
      document.getElementById('camera-video').style.display = 'none';
    }
  }

  async useCurrentLocation() {
    try {
      const location = await this.mapComponent.getCurrentLocation();
      this.setLocation(location.lat, location.lon, this.presenter);
      this.mapComponent.setView(location.lat, location.lon, 15);
    } catch (error) {
      this.showError('location-error', 'Failed to get current location.');
    }
  }

  setLocation(lat, lon, presenter) {
    presenter.setSelectedLocation(lat, lon);
    this.mapComponent.clearMarkers();
    this.mapComponent.addMarker(lat, lon, 'Selected location');
    
    const locationContainer = document.getElementById('selected-location');
    const locationText = document.getElementById('location-text');
    
    locationContainer.style.display = 'flex';
    locationText.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }

  clearLocation(presenter) {
    presenter.clearSelectedLocation();
    this.mapComponent.clearMarkers();
    document.getElementById('selected-location').style.display = 'none';
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  setLoadingState(isLoading) {
    const submitButton = document.getElementById('submit-story');
    const form = document.getElementById('add-story-form');
    
    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.innerHTML = isLoading ? 
        '<i class="fas fa-spinner fa-spin"></i> Sharing...' : 
        '<i class="fas fa-paper-plane"></i> Share Story';
    }
    
    if (form) {
      form.setAttribute('aria-busy', isLoading.toString());
    }
  }

  showSuccess(message) {
    // Could implement a toast notification here
    alert(message);
  }
}

export default AddStoryPage;