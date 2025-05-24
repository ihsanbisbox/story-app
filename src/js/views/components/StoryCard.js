import DOMPurify from 'dompurify';

class StoryCard {
  constructor(story, onFavoriteClick = null) {
    this.story = story;
    this.onFavoriteClick = onFavoriteClick;
  }

  render() {
    const { id, name, description, photoUrl, createdAt, isFavorite = false, dateAdded } = this.story;
    const formattedDate = new Date(createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format date added for favorites
    const formattedDateAdded = dateAdded ? new Date(dateAdded).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : null;

    const favoriteIconClass = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    const favoriteButtonClass = isFavorite ? 'favorite-btn favorited' : 'favorite-btn';
    const favoriteAriaLabel = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    const favoriteTitle = isFavorite ? 'Remove from favorites' : 'Add to favorites';

    return `
      <article class="story-card" data-story-id="${id}">
        <div class="story-image">
          <img src="${photoUrl}" alt="Story by ${name}" loading="lazy">
          <button class="${favoriteButtonClass}" 
                  data-story-id="${id}"
                  aria-label="${favoriteAriaLabel}"
                  title="${favoriteTitle}">
            <i class="${favoriteIconClass}" aria-hidden="true"></i>
          </button>
        </div>
        <div class="story-content">
          <h3 class="story-author">${DOMPurify.sanitize(name)}</h3>
          <p class="story-description">${DOMPurify.sanitize(description)}</p>
          <div class="story-meta">
            <div class="story-dates">
              <time datetime="${createdAt}" class="story-date">
                <i class="far fa-calendar" aria-hidden="true"></i>
                Created: ${formattedDate}
              </time>
              ${dateAdded ? `
                <time datetime="${dateAdded}" class="story-date-added">
                  <i class="fas fa-heart" aria-hidden="true"></i>
                  Favorited: ${formattedDateAdded}
                </time>
              ` : ''}
            </div>
            <div class="story-actions">
              <a href="#/story/${id}" class="story-link" aria-label="Read full story by ${name}">
                Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  static renderSkeleton() {
    return `
      <article class="story-card skeleton">
        <div class="story-image skeleton-box">
          <div class="skeleton-favorite-btn skeleton-box"></div>
        </div>
        <div class="story-content">
          <div class="skeleton-text skeleton-box"></div>
          <div class="skeleton-text skeleton-box"></div>
          <div class="skeleton-text skeleton-box"></div>
          <div class="story-meta">
            <div class="skeleton-text skeleton-box short"></div>
            <div class="skeleton-text skeleton-box short"></div>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Render a compact version for favorites list
   */
  renderCompact() {
    const { id, name, description, photoUrl, dateAdded } = this.story;
    const formattedDateAdded = new Date(dateAdded).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <article class="story-card story-card-compact" data-story-id="${id}">
        <div class="story-image-compact">
          <img src="${photoUrl}" alt="Story by ${name}" loading="lazy">
        </div>
        <div class="story-content-compact">
          <h4 class="story-author">${DOMPurify.sanitize(name)}</h4>
          <p class="story-description">${DOMPurify.sanitize(description.substring(0, 100))}...</p>
          <div class="story-meta-compact">
            <time datetime="${dateAdded}" class="story-date-added">
              <i class="fas fa-heart" aria-hidden="true"></i>
              Added: ${formattedDateAdded}
            </time>
            <div class="story-actions-compact">
              <button class="favorite-btn favorited" 
                      data-story-id="${id}"
                      aria-label="Remove from favorites"
                      title="Remove from favorites">
                <i class="fas fa-heart" aria-hidden="true"></i>
              </button>
              <a href="#/story/${id}" class="story-link-compact" aria-label="Read full story by ${name}">
                <i class="fas fa-external-link-alt" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Setup event listeners for the story card
   */
  setupEventListeners(cardElement) {
    const favoriteBtn = cardElement.querySelector('.favorite-btn');
    if (favoriteBtn && this.onFavoriteClick) {
      favoriteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onFavoriteClick(this.story.id, cardElement);
      });
    }
  }

  /**
   * Update favorite button state
   */
  static updateFavoriteButton(button, isFavorite) {
    const icon = button.querySelector('i');
    if (isFavorite) {
      icon.className = 'fas fa-heart';
      button.classList.add('favorited');
      button.setAttribute('aria-label', 'Remove from favorites');
      button.title = 'Remove from favorites';
    } else {
      icon.className = 'far fa-heart';
      button.classList.remove('favorited');
      button.setAttribute('aria-label', 'Add to favorites');
      button.title = 'Add to favorites';
    }
  }

  /**
   * Create a story card with event listeners attached
   */
  static createWithListeners(story, onFavoriteClick) {
    const card = new StoryCard(story, onFavoriteClick);
    const cardHTML = card.render();
    
    // Create temporary container to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = cardHTML;
    const cardElement = temp.firstElementChild;
    
    // Setup event listeners
    card.setupEventListeners(cardElement);
    
    return cardElement;
  }
}

export default StoryCard;