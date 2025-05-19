import HomePresenter from '../../presenters/HomePresenter';
import StoryCard from '../components/StoryCard';
import MapComponent from '../components/MapComponent';

class HomePage {
  constructor() {
    this.presenter = new HomePresenter(this);
    this.mapComponent = null;
  }

  async render(container) {
    container.innerHTML = `
      <section class="home-page">
        <header class="page-header">
          <h1>Dicoding Stories</h1>
          <p>Share your moments with the community</p>
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
  }

  /**
   * Handle load more button click
   */
  handleLoadMore() {
    this.presenter.loadMoreStories();
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
    
    if (stories.length === 0) {
      storiesList.innerHTML = `
        <div class="no-stories">
          <i class="fas fa-inbox fa-3x" aria-hidden="true"></i>
          <p>No stories yet. Be the first to share!</p>
          <a href="#/add" class="btn btn-primary">Add Story</a>
        </div>
      `;
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