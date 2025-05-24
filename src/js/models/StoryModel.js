import { API_CONFIG } from '../config/api-config';
import ApiUtil from '../utils/api';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getFavorites, 
  isFavorite,
  getFavoriteById,
  clearAllFavorites,
  getFavoriteCount
} from '../utils/storage';

class StoryModel {
  static async getAllStories(page = 1, size = 10, location = 1) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        location: location.toString()
      });
      
      const response = await ApiUtil.get(`${API_CONFIG.ENDPOINTS.STORIES}?${params}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async getStoryDetail(id) {
    try {
      const response = await ApiUtil.get(API_CONFIG.ENDPOINTS.STORY_DETAIL(id));
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async addStory(storyData) {
    try {
      const formData = new FormData();
      formData.append('description', storyData.description);
      formData.append('photo', storyData.photo);
      
      if (storyData.lat) formData.append('lat', storyData.lat);
      if (storyData.lon) formData.append('lon', storyData.lon);

      const response = await ApiUtil.postFormData(API_CONFIG.ENDPOINTS.STORIES, formData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async addGuestStory(storyData) {
    try {
      const formData = new FormData();
      formData.append('description', storyData.description);
      formData.append('photo', storyData.photo);
      
      if (storyData.lat) formData.append('lat', storyData.lat);
      if (storyData.lon) formData.append('lon', storyData.lon);

      const response = await ApiUtil.postFormData(API_CONFIG.ENDPOINTS.STORIES_GUEST, formData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // NEW: Favorite stories methods
  static async addToFavorites(story) {
    try {
      return await addToFavorites(story);
    } catch (error) {
      console.error('Error in StoryModel.addToFavorites:', error);
      throw new Error('Failed to add story to favorites');
    }
  }

  static async removeFromFavorites(storyId) {
    try {
      return await removeFromFavorites(storyId);
    } catch (error) {
      console.error('Error in StoryModel.removeFromFavorites:', error);
      throw new Error('Failed to remove story from favorites');
    }
  }

  static async getFavoriteStories() {
    try {
      return await getFavorites();
    } catch (error) {
      console.error('Error in StoryModel.getFavoriteStories:', error);
      throw new Error('Failed to get favorite stories');
    }
  }

  static async isStoryFavorite(storyId) {
    try {
      return await isFavorite(storyId);
    } catch (error) {
      console.error('Error in StoryModel.isStoryFavorite:', error);
      return false;
    }
  }

  static async getFavoriteStoryById(storyId) {
    try {
      return await getFavoriteById(storyId);
    } catch (error) {
      console.error('Error in StoryModel.getFavoriteStoryById:', error);
      return null;
    }
  }

  static async clearAllFavorites() {
    try {
      return await clearAllFavorites();
    } catch (error) {
      console.error('Error in StoryModel.clearAllFavorites:', error);
      throw new Error('Failed to clear all favorites');
    }
  }

  static async getFavoriteCount() {
    try {
      return await getFavoriteCount();
    } catch (error) {
      console.error('Error in StoryModel.getFavoriteCount:', error);
      return 0;
    }
  }

  // Utility method to toggle favorite status
  static async toggleFavorite(story) {
    try {
      const isCurrentlyFavorite = await this.isStoryFavorite(story.id);
      
      if (isCurrentlyFavorite) {
        await this.removeFromFavorites(story.id);
        return { action: 'removed', isFavorite: false };
      } else {
        await this.addToFavorites(story);
        return { action: 'added', isFavorite: true };
      }
    } catch (error) {
      console.error('Error in StoryModel.toggleFavorite:', error);
      throw new Error('Failed to toggle favorite status');
    }
  }
}

export default StoryModel;