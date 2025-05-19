import StoryModel from '../models/StoryModel';
import AuthService from './auth-service';

const StoryService = {
  async getAllStories(page = 1, size = 10, location = 1) {
    try {
      return await StoryModel.getAllStories(page, size, location);
    } catch (error) {
      throw error;
    }
  },

  async getStoryDetail(id) {
    try {
      return await StoryModel.getStoryDetail(id);
    } catch (error) {
      throw error;
    }
  },

  async addStory(storyData) {
    try {
      if (AuthService.isAuthenticated()) {
        return await StoryModel.addStory(storyData);
      } else {
        return await StoryModel.addGuestStory(storyData);
      }
    } catch (error) {
      throw error;
    }
  }
};

export default StoryService;
