import StoryService from '../services/story-service';
import NotificationService from '../services/notification-service';
import Router from '../router';

class AddStoryPresenter {
  constructor(view) {
    this.view = view;
    this.photoBlob = null;
    this.selectedLocation = null;
  }

  async init() {
    // Only initialize the presenter, all view setup should be in the view
    this.view.setupEventListeners(this);
  }

  // Business logic methods
  async submitStory(description, photo, location) {
    try {
      this.view.setLoadingState(true);
      
      const storyData = {
        description,
        photo,
        lat: location?.lat,
        lon: location?.lon
      };

      await StoryService.addStory(storyData);
      
      // Show notification
      await NotificationService.showNotification('Story berhasil dibuat', {
        body: `Anda telah membuat story baru dengan deskripsi: ${description}`
      });
      
      this.view.showSuccess('Story added successfully!');
      
      // Redirect to home
      setTimeout(() => {
        Router.navigateTo('/');
      }, 1500);
      
    } catch (error) {
      this.view.showError('form-error', 'Failed to add story. Please try again.');
      console.error('Error adding story:', error);
    } finally {
      this.view.setLoadingState(false);
    }
  }

  setPhotoBlob(blob) {
    this.photoBlob = blob;
  }

  getPhotoBlob() {
    return this.photoBlob;
  }

  setSelectedLocation(lat, lon) {
    this.selectedLocation = { lat, lon };
  }

  getSelectedLocation() {
    return this.selectedLocation;
  }

  clearSelectedLocation() {
    this.selectedLocation = null;
  }

  // Validation logic
  validateForm(description, photoBlob) {
    let isValid = true;
    
    if (!description) {
      this.view.showError('description-error', 'Description is required');
      isValid = false;
    }
    
    if (!photoBlob) {
      this.view.showError('photo-error', 'Photo is required');
      isValid = false;
    }

    return isValid;
  }
}

export default AddStoryPresenter;