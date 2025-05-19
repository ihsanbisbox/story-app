import { API_CONFIG } from '../config/api-config';
import ApiUtil from '../utils/api';

class AuthModel {
  static async register(userData) {
    try {
      const response = await ApiUtil.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async login(credentials) {
    try {
      const response = await ApiUtil.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      if (response.loginResult) {
        this.saveToken(response.loginResult.token);
        this.saveUserData(response.loginResult);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  static saveToken(token) {
    localStorage.setItem('token', token);
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  static getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.dispatchEvent(new CustomEvent('auth-changed'));
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}

export default AuthModel;