import StoryService from '../services/story-service';

class HomePresenter {
  constructor(view) {
    this.view = view;
    this.currentPage = 1;
    this.pageSize = 10;
    this.isLoading = false;
    this.hasMoreStories = true;
  }

  async init() {
    try {
      // Load initial stories
      await this.loadStories();
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
      
      const response = await StoryService.getAllStories(this.currentPage, this.pageSize, 1);
      
      if (response.listStory) {
        // Determine if this is initial load or loading more
        if (this.currentPage === 1) {
          this.view.displayStories(response.listStory);
        } else {
          this.view.appendStories(response.listStory);
        }

        // Add markers to map for stories with location
        response.listStory.forEach(story => {
          if (story.lat && story.lon) {
            this.view.addMarkerToMap(
              story.lat,
              story.lon,
              `<b>${story.name}</b><br>${story.description.substring(0, 50)}...`
            );
          }
        });

        // Check if there are more stories
        this.hasMoreStories = response.listStory.length === this.pageSize;
        this.view.showLoadMoreButton(this.hasMoreStories);
      }
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
    if (!this.hasMoreStories || this.isLoading) return;

    this.currentPage++;
    await this.loadStories();
  }
}

export default HomePresenter;