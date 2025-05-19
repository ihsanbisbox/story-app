import HomePage from './views/pages/HomePage';
import AddStoryPage from './views/pages/AddStoryPage';
import DetailStoryPage from './views/pages/DetailStoryPage';
import LoginPage from './views/pages/LoginPage';
import RegisterPage from './views/pages/RegisterPage';
import AuthService from './services/auth-service';

class Router {
  constructor() {
    this.routes = {
      '/': HomePage,
      '/add': AddStoryPage,
      '/story/:id': DetailStoryPage,
      '/login': LoginPage,
      '/register': RegisterPage,
    };
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const mainContent = document.getElementById('main-content');
    
    // Check authentication for protected routes
    const protectedRoutes = ['/add'];
    if (protectedRoutes.includes(hash) && !AuthService.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    // Handle dynamic routes
    let matchedRoute = null;
    let params = {};

    for (const [route, Page] of Object.entries(this.routes)) {
      const routeRegex = new RegExp('^' + route.replace(/:[^\s/]+/g, '([\\w-]+)') + '$');
      const match = hash.match(routeRegex);
      
      if (match) {
        matchedRoute = Page;
        // Extract parameters
        const paramNames = route.match(/:[^\s/]+/g) || [];
        paramNames.forEach((paramName, index) => {
          params[paramName.slice(1)] = match[index + 1];
        });
        break;
      }
    }

    if (matchedRoute) {
      // Apply View Transition API
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          this.renderPage(mainContent, matchedRoute, params);
        });
      } else {
        this.renderPage(mainContent, matchedRoute, params);
      }
    } else {
      // 404 page
      mainContent.innerHTML = '<h1>404 - Page Not Found</h1>';
    }
  }

  renderPage(container, Page, params) {
    // Make sure the container has the right ID and attributes
    if (container) {
      container.id = 'main-content'; // Ensure consistent ID
      container.setAttribute('tabindex', '-1'); // Make it focusable
      
      // Render the page
      const page = new Page(params);
      page.render(container);
      
      // After rendering, we can optionally focus if coming from a skip link
      if (window.location.hash.includes('#main-content')) {
        setTimeout(() => {
          container.focus();
          container.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }

  static navigateTo(path) {
    window.location.hash = `#${path}`;
  }
}

export default Router;