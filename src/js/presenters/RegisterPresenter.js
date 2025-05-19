import AuthService from '../services/auth-service';
import Router from '../router';

class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  init() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    // Clear previous errors
    this.view.clearError('name-error');
    this.view.clearError('email-error');
    this.view.clearError('password-error');
    this.view.clearError('confirm-password-error');
    this.view.clearError('form-error');
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate
    let hasError = false;
    
    if (!name) {
      this.view.showError('name-error', 'Name is required');
      hasError = true;
    }
    
    if (!email) {
      this.view.showError('email-error', 'Email is required');
      hasError = true;
    } else if (!this.isValidEmail(email)) {
      this.view.showError('email-error', 'Please enter a valid email address');
      hasError = true;
    }
    
    if (!password) {
      this.view.showError('password-error', 'Password is required');
      hasError = true;
    } else if (password.length < 8) {
      this.view.showError('password-error', 'Password must be at least 8 characters');
      hasError = true;
    }
    
    if (!confirmPassword) {
      this.view.showError('confirm-password-error', 'Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      this.view.showError('confirm-password-error', 'Passwords do not match');
      hasError = true;
    }
    
    if (hasError) return;
    
    try {
      this.view.setLoadingState(true);
      await AuthService.register(name, email, password);
      Router.navigateTo('/login');
    } catch (error) {
      this.view.showError('form-error', error.message || 'Registration failed. Please try again.');
    } finally {
      this.view.setLoadingState(false);
    }
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default RegisterPresenter;