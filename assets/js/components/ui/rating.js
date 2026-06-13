import { Events } from '../../core/events.js';

/**
 * Reusable component used to display and select ratings
 * from one to five stars.
 */
export class Rating {
  /**
   * Creates a new Rating instance.
   *
   * @param {Object} [options={}]
   * Optional component configuration.
   *
   * @param {number} [options.value=0]
   * Initial rating value.
   *
   * @param {boolean} [options.readonly=true]
   * Indicates whether the component is read-only.
   */
  constructor(options = {}) {
    this.value = this.#normalizeValue(options.value ?? 0);
    this.readonly = options.readonly ?? true;

    this.element = null;
    this.stars = [];
    this.listeners = [];
  }

  /**
   * Updates the current rating value.
   *
   * The component updates only the affected star icons
   * without rebuilding the entire structure.
   *
   * @param {number} value
   * New rating value.
   *
   * @returns {void}
   */
  setValue(value) {
    this.value = this.#normalizeValue(value);

    if (this.element) {
      this.#updateStars();
    }
  }

  /**
   * Returns the current rating value.
   *
   * @returns {number}
   * Current rating value.
   */
  getValue() {
    return this.value;
  }

  /**
   * Enables or disables readonly mode.
   *
   * @param {boolean} readonly
   * Readonly state.
   *
   * @returns {void}
   */
  setReadonly(readonly) {
    this.readonly = Boolean(readonly);

    if (this.element) {
      this.#updateAccessibility();
    }
  }

  /**
   * Renders the rating component.
   *
   * @returns {HTMLElement}
   * Rendered rating element.
   */
  render() {
    const container = document.createElement('div');

    container.className = `
      d-inline-flex
      align-items-center
      gap-1
    `;

    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Rating');

    this.element = container;
    this.stars = [];

    for (let index = 1; index <= 5; index++) {
      const star = document.createElement('i');

      star.dataset.value = index;
      star.setAttribute('aria-hidden', 'false');

      this.stars.push(star);
      container.appendChild(star);

      if (!this.readonly) {
        this.#registerInteractiveEvents(star);
      }
    }

    this.#updateStars();
    this.#updateAccessibility();

    return container;
  }

  /**
   * Removes all registered listeners and references.
   *
   * @returns {void}
   */
  destroy() {
    this.listeners.forEach(listener => {
      Events.off(
        listener.element,
        listener.eventName,
        listener.handler
      );
    });

    this.listeners = [];
    this.stars = [];
    this.element = null;
  }

  /**
   * Registers interactive events for a star.
   *
   * @private
   *
   * @param {HTMLElement} star
   *
   * @returns {void}
   */
  #registerInteractiveEvents(star) {
    const clickHandler = () => {
      const value = Number(star.dataset.value);

      this.setValue(value);

      Events.emit('rating:change', {
        value,
        component: this
      }, true);
    };

    const keyHandler = event => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();

        const value = Number(star.dataset.value);

        this.setValue(value);

        Events.emit('rating:change', {
          value,
          component: this
        },true);
      }
    };

    Events.on(star, 'click', clickHandler);
    Events.on(star, 'keydown', keyHandler);

    this.listeners.push({
      element: star,
      eventName: 'click',
      handler: clickHandler
    });

    this.listeners.push({
      element: star,
      eventName: 'keydown',
      handler: keyHandler
    });
  }

  /**
   * Updates star icons according to the current value.
   *
   * @private
   *
   * @returns {void}
   */
  #updateStars() {
    this.stars.forEach((star, index) => {
      const filled = index + 1 <= this.value;

      star.classList.remove(
        'bi-star',
        'bi-star-fill'
      );

      star.classList.add(
        'bi',
        filled ? 'bi-star-fill' : 'bi-star'
      );

      star.classList.add(
        'text-warning'
      );
    });
  }

  /**
   * Updates accessibility and interaction attributes.
   *
   * @private
   *
   * @returns {void}
   */
  #updateAccessibility() {
    this.stars.forEach(star => {
      if (this.readonly) {
        star.removeAttribute('tabindex');
        star.removeAttribute('role');
        star.setAttribute('aria-disabled', 'true');
        star.style.cursor = 'default';
      } else {
        star.setAttribute('tabindex', '0');
        star.setAttribute('role', 'button');
        star.setAttribute('aria-disabled', 'false');
        star.style.cursor = 'pointer';
      }
    });
  }

  /**
   * Normalizes rating values.
   *
   * @private
   *
   * @param {number} value
   *
   * @returns {number}
   * Normalized value between 0 and 5.
   */
  #normalizeValue(value) {
    const normalized = Number(value);

    if (Number.isNaN(normalized)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(5, normalized)
    );
  }
}