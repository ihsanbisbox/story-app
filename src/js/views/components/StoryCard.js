import DOMPurify from 'dompurify';

class StoryCard {
  constructor(story) {
    this.story = story;
  }

  render() {
    const { id, name, description, photoUrl, createdAt } = this.story;
    const formattedDate = new Date(createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <article class="story-card" data-story-id="${id}">
        <div class="story-image">
          <img src="${photoUrl}" alt="Story by ${name}" loading="lazy">
        </div>
        <div class="story-content">
          <h3 class="story-author">${DOMPurify.sanitize(name)}</h3>
          <p class="story-description">${DOMPurify.sanitize(description)}</p>
          <div class="story-meta">
            <time datetime="${createdAt}" class="story-date">
              <i class="far fa-calendar" aria-hidden="true"></i>
              ${formattedDate}
            </time>
            <a href="#/story/${id}" class="story-link" aria-label="Read full story by ${name}">
              Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  static renderSkeleton() {
    return `
      <article class="story-card skeleton">
        <div class="story-image skeleton-box"></div>
        <div class="story-content">
          <div class="skeleton-text skeleton-box"></div>
          <div class="skeleton-text skeleton-box"></div>
          <div class="skeleton-text skeleton-box"></div>
        </div>
      </article>
    `;
  }
}

export default StoryCard;