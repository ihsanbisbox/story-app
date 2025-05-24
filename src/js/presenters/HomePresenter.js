import StoryService from '../services/story-service';
import StoryModel from '../models/StoryModel';

class HomePresenter {
  constructor(view) {
    this.view = view;
    this.currentPage = 1;
    this.pageSize = 10;
    this.isLoading = false;
    this.hasMoreStories = true;
    this.currentView = 'all'; // 'all' or 'favorites'
  }

  async init() {
    try {
      // Load initial stories
      await this.loadStories();
      // Update favorite count
      await this.updateFavoriteCount();
    } catch (error) {
      this.view.showError('Failed to load stories. Please try again later.');
      console.error('Error initializing home page:', error);
    }
  }

  /**
   * Load stories from the API
   */
  async loadStories() {
    if (this.isLoading) return;

    try {
      this.isLoading = true;
      this.view.setLoadingState(true);
      
      let stories = [];
      
      if (this.currentView === 'favorites') {
        // Load favorite stories from IndexedDB
        const favoriteStories = await StoryModel.getFavoriteStories();
        stories = favoriteStories;
        this.hasMoreStories = false; // Favorites don't have pagination
      } else {
        // Load stories from API
        const response = await StoryService.getAllStories(this.currentPage, this.pageSize, 1);
        stories = response.listStory || [];
        
        // Check if there are more stories
        this.hasMoreStories = stories.length === this.pageSize;
      }

      // Add favorite status to each story
      for (let story of stories) {
        story.isFavorite = await StoryModel.isStoryFavorite(story.id);
      }
      
      // Determine if this is initial load or loading more
      if (this.currentPage === 1 || this.currentView === 'favorites') {
        this.view.displayStories(stories);
      } else {
        this.view.appendStories(stories);
      }

      // Add markers to map for stories with location
      stories.forEach(story => {
        if (story.lat && story.lon) {
          this.view.addMarkerToMap(
            story.lat,
            story.lon,
            `<b>${story.name}</b><br>${story.description.substring(0, 50)}...`
          );
        }
      });

      this.view.showLoadMoreButton(this.hasMoreStories);
      
    } catch (error) {
      this.view.showError('Failed to load stories. Please try again.');
      console.error('Error loading stories:', error);
    } finally {
      this.isLoading = false;
      this.view.setLoadingState(false);
    }
  }

  /**
   * Load the next page of stories
   */
  async loadMoreStories() {
    if (!this.hasMoreStories || this.isLoading || this.currentView === 'favorites') return;

    this.currentPage++;
    await this.loadStories();
  }

  /**
   * Switch between all stories and favorites view
   */
  async switchView(viewType) {
    if (this.currentView === viewType) return;

    this.currentView = viewType;
    this.currentPage = 1;
    this.hasMoreStories = true;

    // Clear map markers when switching views
    this.view.clearMapMarkers();
    
    // Update view state
    this.view.setActiveView(viewType);
    
    // Reload stories for the new view
    await this.loadStories();
  }

  /**
   * Toggle favorite status of a story
   */
  async toggleFavorite(storyId, storyElement) {
    try {
      // Find the story data
      const stories = this.view.getCurrentStories();
      const story = stories.find(s => s.id === storyId);
      
      if (!story) {
        console.error('Story not found:', storyId);
        return;
      }

      // Toggle favorite status
      const result = await StoryModel.toggleFavorite(story);
      
      // Update the button state
      const favoriteBtn = storyElement.querySelector('.favorite-btn');
      if (favoriteBtn) {
        this.updateFavoriteButton(favoriteBtn, result.isFavorite);
      }

      // Update the story object
      story.isFavorite = result.isFavorite;

      // Show feedback message
      const message = result.action === 'added' 
        ? 'Story added to favorites!' 
        : 'Story removed from favorites!';
      this.view.showNotification(message, result.action === 'added' ? 'success' : 'info');

      // Update favorite count
      await this.updateFavoriteCount();

      // If we're in favorites view and story was removed, refresh the view
      if (this.currentView === 'favorites' && result.action === 'removed') {
        setTimeout(() => {
          this.loadStories();
        }, 500); // Small delay to show the feedback message
      }

    } catch (error) {
      console.error('Error toggling favorite:', error);
      this.view.showNotification('Failed to update favorite status', 'error');
    }
  }

  /**
   * Update favorite button appearance
   */
  updateFavoriteButton(button, isFavorite) {
    const icon = button.querySelector('i');
    if (isFavorite) {
      icon.className = 'fas fa-heart';
      button.classList.add('favorited');
      button.setAttribute('aria-label', 'Remove from favorites');
      button.title = 'Remove from favorites';
    } else {
      icon.className = 'far fa-heart';
      button.classList.remove('favorited');
      button.setAttribute('aria-label', 'Add to favorites');
      button.title = 'Add to favorites';
    }
  }

  /**
   * Update favorite count display
   */
  async updateFavoriteCount() {
    try {
      const count = await StoryModel.getFavoriteCount();
      this.view.updateFavoriteCount(count);
    } catch (error) {
      console.error('Error updating favorite count:', error);
    }
  }

  /**
   * Clear all favorites
   */
  async clearAllFavorites() {
    try {
      const confirmed = confirm('Are you sure you want to remove all favorite stories?');
      if (!confirmed) return;

      await StoryModel.clearAllFavorites();
      
      // Update UI
      this.view.showNotification('All favorites cleared successfully!', 'success');
      await this.updateFavoriteCount();
      
      // If currently viewing favorites, refresh the view
      if (this.currentView === 'favorites') {
        await this.loadStories();
      } else {
        // Update favorite buttons in current view
        this.view.updateAllFavoriteButtons(false);
      }
      
    } catch (error) {
      console.error('Error clearing favorites:', error);
      this.view.showNotification('Failed to clear favorites', 'error');
    }
  }

  /**
   * Get current view type
   */
  getCurrentView() {
    return this.currentView;
  }
}

export default HomePresenter;