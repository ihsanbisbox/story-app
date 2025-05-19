class SkipToContent {
  static init() {
    // Use MutationObserver to ensure the skip link is attached 
    // even if the DOM changes after initial load
    const observer = new MutationObserver(() => {
      this.attachSkipListener();
    });
    
    // Start observing changes to the document body
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Also try to attach immediately in case the link is already in the DOM
    this.attachSkipListener();
  }
  
  static attachSkipListener() {
    // Try selecting different possible class names
    const skipLink = document.querySelector('.skip-to-content') || 
                    document.querySelector('.skip-link') ||
                    document.querySelector('[data-testid="skip-link"]');
                    
    if (skipLink && !skipLink.hasAttribute('data-skip-attached')) {
      skipLink.setAttribute('data-skip-attached', 'true');
      
      skipLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent page refresh
        skipLink.blur(); // Remove focus from the skip link itself
        
        // Try to find the main content with different possible IDs
        const mainContent = document.getElementById('main-content') || 
                           document.getElementById('mainContent') ||
                           document.querySelector('main');
                           
        if (mainContent) {
          console.log('Main content found, focusing:', mainContent);
          
          // Set tabindex to make the element focusable
          if (!mainContent.hasAttribute('tabindex')) {
            mainContent.setAttribute('tabindex', '-1');
          }
          
          // Focus on main content and scroll to it
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.error('Main content element not found. Please ensure it exists with id="main-content"');
        }
      });
    }
  }
}

export default SkipToContent;