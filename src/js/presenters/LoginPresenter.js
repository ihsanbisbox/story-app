import AuthService from '../services/auth-service';
import Router from '../router';

class LoginPresenter {
  constructor(view) {
    this.view = view;
  }

  init() {
    // Only initialize the presenter
    this.view.setupEventListeners(this);
  }

  /**
   * Handles the login process
   * @param {string} email - User email
   * @param {string} password - User password 
   */
  async login(email, password) {
    try {
      this.view.setLoadingState(true);
      await AuthService.login(email, password);
      Router.navigateTo('/');
    } catch (error) {
      this.view.showError('form-error', error.message || 'Login failed. Please check your credentials.');
    } finally {
      this.view.setLoadingState(false);
    }
  }

  /**
   * Validates the login form inputs
   * @param {string} email - User email
   * @param {string} password - User password 
   * @returns {boolean} - Whether the form is valid
   */
  validateForm(email, password) {
    let isValid = true;
    
    if (!email) {
      this.view.showError('email-error', 'Email is required');
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.view.showError('email-error', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!password) {
      this.view.showError('password-error', 'Password is required');
      isValid = false;
    } else if (password.length < 8) {
      this.view.showError('password-error', 'Password must be at least 8 characters');
      isValid = false;
    }
    
    return isValid;
  }
  
  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether the email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default LoginPresenter;