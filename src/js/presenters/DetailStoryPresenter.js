import StoryService from '../services/story-service';

class DetailStoryPresenter {
  constructor(view) {
    this.view = view;
  }

  async init(storyId) {
    try {
      const response = await StoryService.getStoryDetail(storyId);
      if (response.story) {
        this.view.displayStory(response.story);
      }
    } catch (error) {
      this.view.showError('Story not found or failed to load.');
      console.error('Error loading story detail:', error);
    }
  }
}

export default DetailStoryPresenter;