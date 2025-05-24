import HomePresenter from '../../presenters/HomePresenter';
import StoryCard from '../components/StoryCard';
import MapComponent from '../components/MapComponent';

class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
    this.mapComponent = null;
    this.currentStories = [];
  }

  async render(container) {
    container.innerHTML = `
      <section class="home-page">
        <header class="page-header">
          <h1>Dicoding Stories</h1>
          <p>Share your moments with the community</p>
          
          <div class="view-controls">
            <div class="view-toggle">
              <button id="all-stories-btn" class="view-btn active" data-view="all">
                <i class="fas fa-list" aria-hidden="true"></i>
                All Stories
              </button>
              <button id="favorites-btn" class="view-btn" data-view="favorites">
                <i class="fas fa-heart" aria-hidden="true"></i>
                Favorites <span class="favorite-count" id="favorite-count">0</span>
              </button>
            </div>
            
            <div class="favorites-actions" id="favorites-actions" style="display: none;">
              <button id="clear-favorites-btn" class="btn btn-outline-danger btn-sm">
                <i class="fas fa-trash" aria-hidden="true"></i>
                Clear All Favorites
              </button>
            </div>
          </div>
        </header>

        <div class="stories-map-container">
          <div id="stories-map" class="stories-map" role="application" aria-label="Stories location map"></div>
        </div>

        <div class="stories-list" id="stories-list" role="feed" aria-busy="true">
          ${this.renderLoadingSkeletons()}
        </div>

        <div class="load-more-container">
          <button id="load-more" class="btn btn-secondary" aria-label="Load more stories">
            Load More Stories
          </button>
        </div>

        <!-- Notification container -->
        <div id="notification-container" class="notification-container"></div>
      </section>
    `;

    // Initialize map first, then pass to the presenter for story loading
    this.initMap();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize the presenter
    await this.presenter.init();
  }

  /**
   * Initialize the map component
   */
  initMap() {
    this.mapComponent = new MapComponent('stories-map', {
      center: [-6.200000, 106.816666],
      zoom: 5
    });
    this.mapComponent.init();
  }

  /**
   * Set up event listeners for the page
   */
  setupEventListeners() {
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.handleLoadMore());
    }

    // View toggle buttons
    const allStoriesBtn = document.getElementById('all-stories-btn');
    const favoritesBtn = document.getElementById('favorites-btn');
    
    if (allStoriesBtn) {
      allStoriesBtn.addEventListener('click', () => this.handleViewChange('all'));
    }
    
    if (favoritesBtn) {
      favoritesBtn.addEventListener('click', () => this.handleViewChange('favorites'));
    }

    // Clear favorites button
    const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
    if (clearFavoritesBtn) {
      clearFavoritesBtn.addEventListener('click', () => this.handleClearFavorites());
    }

    // Set up story card event delegation
    const storiesList = document.getElementById('stories-list');
    if (storiesList) {
      storiesList.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
          const favoriteBtn = e.target.closest('.favorite-btn');
          const storyId = favoriteBtn.getAttribute('data-story-id');
          const storyCard = favoriteBtn.closest('.story-card');
          this.handleFavoriteClick(storyId, storyCard);
        }
      });
    }
  }

  /**
   * Handle view change between all stories and favorites
   */
  async handleViewChange(viewType) {
    await this.presenter.switchView(viewType);
  }

  /**
   * Handle load more button click
   */
  handleLoadMore() {
    this.presenter.loadMoreStories();
  }

  /**
   * Handle favorite button click
   */
  async handleFavoriteClick(storyId, storyElement) {
    await this.presenter.toggleFavorite(storyId, storyElement);
  }

  /**
   * Handle clear all favorites
   */
  async handleClearFavorites() {
    await this.presenter.clearAllFavorites();
  }

  /**
   * Add a marker to the map
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} popupContent - Content for the marker popup
   */
  addMarkerToMap(lat, lon, popupContent) {
    if (this.mapComponent) {
      this.mapComponent.addMarker(lat, lon, popupContent);
    }
  }

  /**
   * Clear all markers from the map
   */
  clearMapMarkers() {
    if (this.mapComponent) {
      this.mapComponent.clearMarkers();
    }
  }

  /**
   * Set active view button
   */
  setActiveView(viewType) {
    const allBtn = document.getElementById('all-stories-btn');
    const favBtn = document.getElementById('favorites-btn');
    const favActions = document.getElementById('favorites-actions');

    if (allBtn && favBtn) {
      allBtn.classList.toggle('active', viewType === 'all');
      favBtn.classList.toggle('active', viewType === 'favorites');
    }

    // Show/hide favorites actions
    if (favActions) {
      favActions.style.display = viewType === 'favorites' ? 'block' : 'none';
    }
  }

  /**
   * Update favorite count display
   */
  updateFavoriteCount(count) {
    const favoriteCountElement = document.getElementById('favorite-count');
    if (favoriteCountElement) {
      favoriteCountElement.textContent = count;
      favoriteCountElement.style.display = count > 0 ? 'inline' : 'none';
    }
  }

  /**
   * Render loading skeleton placeholders
   * @returns {string} HTML for skeleton placeholders
   */
  renderLoadingSkeletons() {
    return Array(6).fill('').map(() => StoryCard.renderSkeleton()).join('');
  }

  /**
   * Display stories in the list
   * @param {Array} stories - Array of story objects
   */
  displayStories(stories) {
    const storiesList = document.getElementById('stories-list');
    storiesList.setAttribute('aria-busy', 'false');
    this.currentStories = stories;
    
    if (stories.length === 0) {
      const currentView = this.presenter.getCurrentView();
      const emptyMessage = currentView === 'favorites' 
        ? `<div class="no-stories">
             <i class="fas fa-heart fa-3x" aria-hidden="true"></i>
             <p>No favorite stories yet.</p>
             <p>Click the heart icon on any story to add it to your favorites!</p>
             <button id="switch-to-all" class="btn btn-primary">Browse All Stories</button>
           </div>`
        : `<div class="no-stories">
             <i class="fas fa-inbox fa-3x" aria-hidden="true"></i>
             <p>No stories yet. Be the first to share!</p>
             <a href="#/add" class="btn btn-primary">Add Story</a>
           </div>`;
      
      storiesList.innerHTML = emptyMessage;
      
      // Add event listener for switch to all button
      const switchBtn = document.getElementById('switch-to-all');
      if (switchBtn) {
        switchBtn.addEventListener('click', () => this.handleViewChange('all'));
      }
      return;
    }

    storiesList.innerHTML = stories.map(story => {
      const storyCard = new StoryCard(story);
      return storyCard.render();
    }).join('');
  }

  /**
   * Append more stories to the existing list
   * @param {Array} stories - Array of story objects
   */
  appendStories(stories) {
    const storiesList = document.getElementById('stories-list');
    const newStories = stories.map(story => {
      const storyCard = new StoryCard(story);
      return storyCard.render();
    }).join('');
    
    storiesList.insertAdjacentHTML('beforeend', newStories);
    this.currentStories = [...this.currentStories, ...stories];
  }

  /**
   * Get current stories
   */
  getCurrentStories() {
    return this.currentStories;
  }

  /**
   * Update all favorite buttons state
   */
  updateAllFavoriteButtons(isFavorite) {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
      StoryCard.updateFavoriteButton(button, isFavorite);
    });
  }

  /**
   * Show an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    const storiesList = document.getElementById('stories-list');
    storiesList.setAttribute('aria-busy', 'false');
    storiesList.innerHTML = `
      <div class="error-message" role="alert">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <p>${message}</p>
        <button onclick="location.reload()" class="btn btn-secondary">Try Again</button>
      </div>
    `;
  }

  /**
   * Show notification message
   * @param {string} message - Message to display
   * @param {string} type - Type of notification (success, error, info)
   */
  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${this.getNotificationIcon(type)}" aria-hidden="true"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close" aria-label="Close notification">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    `;

    // Add click handler for close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    container.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type) {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  }

  /**
   * Show or hide the load more button
   * @param {boolean} show - Whether to show the button
   */
  showLoadMoreButton(show) {
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Set loading state for the load more button
   * @param {boolean} isLoading - Whether loading is in progress
   */
  setLoadingState(isLoading) {
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      loadMoreBtn.disabled = isLoading;
      loadMoreBtn.innerHTML = isLoading ? 
        '<i class="fas fa-spinner fa-spin"></i> Loading...' : 
        'Load More Stories';
    }
  }
}

export default HomePage;