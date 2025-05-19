import AuthModel from '../models/AuthModel';

class AuthService {
  static async register(name, email, password) {
    try {
      const userData = { name, email, password };
      const response = await AuthModel.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async login(email, password) {
    try {
      const credentials = { email, password };
      const response = await AuthModel.login(credentials);
      window.dispatchEvent(new CustomEvent('auth-changed'));
      return response;
    } catch (error) {
      throw error;
    }
  }

  static logout() {
    AuthModel.logout();
  }

  static isAuthenticated() {
    return AuthModel.isAuthenticated();
  }

  static getToken() {
    return AuthModel.getToken();
  }

  static getUserData() {
    return AuthModel.getUserData();
  }
}

export default AuthService;