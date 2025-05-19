import AuthService from '../../services/auth-service';
import Router from '../../router';

class Navigation {
  constructor() {
    this.navElement = document.getElementById('app-header');
  }

  render() {
    const isAuthenticated = AuthService.isAuthenticated();
    const userData = AuthService.getUserData();

    this.navElement.innerHTML = `
      <nav class="main-navigation" role="navigation" aria-label="Main navigation">
        <div class="nav-brand">
          <a href="#/" aria-label="Dicoding Story Home">
            <i class="fas fa-book-open" aria-hidden="true"></i>
            <span>Dicoding Story</span>
          </a>
        </div>
        
        <ul class="nav-links">
          <li><a href="#/" ${this.isActive('/')}>Home</a></li>
          ${isAuthenticated ? `
            <li><a href="#/add" ${this.isActive('/add')}>Add Story</a></li>
          ` : ''}
        </ul>
        
        <div class="nav-auth">
          ${isAuthenticated ? `
            <div class="user-menu">
              <span class="user-name">${userData?.name || 'User'}</span>
              <button class="btn-logout" aria-label="Logout">
                <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                Logout
              </button>
            </div>
          ` : `
            <a href="#/login" class="btn btn-primary">Login</a>
            <a href="#/register" class="btn btn-secondary">Register</a>
          `}
        </div>
        
        <button class="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
          <i class="fas fa-bars" aria-hidden="true"></i>
        </button>
      </nav>
    `;

    this.attachEventListeners();
  }

  isActive(path) {
    const currentPath = window.location.hash.slice(1) || '/';
    return currentPath === path ? 'class="active" aria-current="page"' : '';
  }

  attachEventListeners() {
    // Logout button
    const logoutBtn = this.navElement.querySelector('.btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthService.logout();
        Router.navigateTo('/login');
      });
    }

    // Mobile menu toggle
    const mobileToggle = this.navElement.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const nav = this.navElement.querySelector('.main-navigation');
        nav.classList.toggle('open');
        const isOpen = nav.classList.contains('open');
        mobileToggle.setAttribute('aria-expanded', isOpen.toString());
      });
    }
  }
}

export default Navigation;