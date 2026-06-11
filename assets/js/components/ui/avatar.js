import { BaseComponent } from '../base/base-component.js';

/**
 * Avatar component.
 *
 * Responsible only for rendering a user image
 * or a fallback icon.
 *
 * No navigation.
 * No business logic.
 * No storage access.
 * No service access.
 */
export class Avatar extends BaseComponent {
  /**
   * Available sizes.
   *
   * @type {Object}
   */
  static SIZES = {
    sm: 'aq-avatar-sm',
    md: 'aq-avatar-md',
    lg: 'aq-avatar-lg'
  };

  /**
   * Creates a new Avatar.
   *
   * @param {Object} [options={}]
   * @param {string|null} [options.imageUrl=null]
   * @param {string} options.name
   * @param {'sm'|'md'|'lg'} [options.size='md']
   */
  constructor({
    imageUrl = null,
    name,
    size = 'md'
  } = {}) {
      super();

      this.imageUrl = imageUrl;
      this.name = name.trim();

      this.alt = this.name ? `Avatar do ${this.name}` : 'Avatar';
      this.size = Avatar.SIZES[size]
          ? size
          : 'md';

      this.refs = {};
  }

  /**
   * Renders component markup.
   *
   * @returns {string}
   */
  render() {
    return `
      <div
        class="aq-avatar border border-2 rounded-circle aq-text-primary aq-shadow-md ${this.#getSizeClass()}"
        data-role="avatar-container"
      ></div>
    `.trim();
  }

  /**
   * Lifecycle hook.
   */
  afterMount() {
    this.refs.container = this.element.matches('[data-role="avatar-container"]')
      ? this.element
      : this.element.querySelector('[data-role="avatar-container"]');

    this.#renderContent();
  }

  /**
   * Updates avatar image.
   *
   * @param {string|null} url
   */
  setImage(url) {
    this.imageUrl = url || null;

    if (!this.refs.container) {
      return;
    }

    this.#renderContent();
  }

  /**
   * Updates avatar size.
   *
   * @param {'sm'|'md'|'lg'} size
   */
  setSize(size) {
    if (!Avatar.SIZES[size]) {
      return;
    }

    const oldClass = this.#getSizeClass();

    this.size = size;

    if (!this.element) {
      return;
    }

    this.element.classList.remove(oldClass);
    this.element.classList.add(
      this.#getSizeClass()
    );
  }

  /**
   * Updates user name and updates initials or image alt dynamically.
   *
   * @param {string} name
   */
  setName(name) {
    this.name = (name || '').trim();
    this.alt = this.name ? `Avatar do ${this.name}` : 'Avatar';

    if (this.refs.image) {
      this.refs.image.alt = this.alt;
    } else if (this.refs.initials) {
      this.refs.initials.textContent = this.#getInitials();
    }
  }

  /**
   * Renders image or fallback.
   *
   * @private
   */
  #renderContent() {
    const container = this.refs.container;

    if (!container) {
      return;
    }

    while (container.firstChild) {
      container.removeChild(
        container.firstChild
      );
    }

    this.refs.image = null;
    this.refs.icon = null;

    if (this.imageUrl) {
      const image =
        document.createElement('img');

      image.src = this.imageUrl;
      image.alt = this.alt;

      image.classList.add(
        'img-fluid',
        'rounded-circle',
        'w-100',
        'h-100'
      );
      image.style.objectFit = 'cover';

      container.appendChild(image);

      this.refs.image = image;

      return;
    }

    const initialsSpan = document.createElement('span');
    initialsSpan.className = 'fw-bold text-uppercase';
    initialsSpan.textContent = this.#getInitials();

    container.appendChild(initialsSpan);
    this.refs.initials = initialsSpan;
  }

  /**
   * Returns size class.
   *
   * @returns {string}
   * @private
   */
  #getSizeClass() {
    return Avatar.SIZES[this.size];
  }

  /**
   * Generates initials from the user name (Max 2 characters).
   *
   * @returns {string}
   * @private
   */
  #getInitials() {
    if (!this.name) return '?';

    const parts = this.name.split(/\s+/).filter(Boolean);
    
    if (parts.length === 1) {
      return parts[0].charAt(0);
    }

    return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
  }

  /**
   * Releases resources.
   */
  destroy() {
    super.destroy();

    this.refs = {};
    this.name = null;
    this.imageUrl = null;
    this.alt = null;
  }
}