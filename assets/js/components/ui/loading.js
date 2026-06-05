/**
 * Displays the loading indicator inside the specified container.
 *
 * The component is rendered using Bootstrap spinner classes and
 * replaces any previous loading instance managed by this object.
 */
export class Loading {
/**
 * Creates a new Loading component instance.
 *
 * @param {Object} [options={}]
 * Optional component configuration.
 *
 * @param {'border'|'grow'} [options.type='border']
 * Bootstrap spinner type.
 *
 * @param {string} [options.message='Carregando...']
 * Initial loading message displayed below the spinner.
 */
  constructor(options = {}) {
    this.type = options.type || 'border';
    this.message = options.message || 'Carregando...';

    this.container = null;
    this.element = null;
    this.visible = false;
  }

/**
 * Displays the loading indicator inside the specified container.
 *
 * The loading element is created and appended to the target
 * container using the configured spinner type and message.
 *
 * @param {HTMLElement|string} container
 * Container element or CSS selector where the loading indicator
 * should be rendered.
 *
 * @returns {void}
 */
  show(container) {
    const target =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!target) {
      return;
    }

    this.hide();

    this.container = target;

    this.element = document.createElement('div');
    this.element.className =
      'd-flex flex-column align-items-center justify-content-center py-4';

    this.element.innerHTML = this.#render();

    this.container.appendChild(this.element);

    this.visible = true;
  }

/**
 * Removes the loading indicator from the DOM.
 *
 * If the component is currently visible, the loading element
 * is removed and its internal references are cleared.
 *
 * @returns {void}
 */
  hide() {
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.element = null;
    this.visible = false;
  }

/**
 * Updates the loading message.
 *
 * If the component is currently visible, the rendered message
 * is updated immediately without recreating the component.
 *
 * @param {string} message
 * New message to be displayed.
 *
 * @returns {void}
 */
  setMessage(message) {
    this.message = message || '';

    if (!this.visible || !this.element) {
      return;
    }

    const messageElement =
      this.element.querySelector('[data-loading-message]');

    if (messageElement) {
      messageElement.textContent = this.message;
    }
  }

/**
 * Updates the Bootstrap spinner type.
 *
 * Supported values are:
 * - border
 * - grow
 *
 * If the component is visible, the spinner markup is re-rendered.
 *
 * @param {'border'|'grow'} type
 * Spinner type.
 *
 * @returns {void}
 */
  setType(type) {
    if (type !== 'border' && type !== 'grow') {
      return;
    }

    const oldType = this.type;
    this.type = type;

    if (!this.visible || !this.element) {
      return;
    }

    // Point-by-point manipulation of classes in the DOM
    // instead of destroying and rebuilding with innerHTML.
    const spinner = this.element.querySelector('[data-loading-spinner]');
    if (spinner) {
      const oldClass = oldType === 'grow' ? 'spinner-grow' : 'spinner-border';
      const newClass = this.type === 'grow' ? 'spinner-grow' : 'spinner-border';
      spinner.classList.remove(oldClass);
      spinner.classList.add(newClass);
    }
  }

/**
 * Indicates whether the loading component is currently visible.
 *
 * @returns {boolean}
 * Returns true when the loading indicator is rendered.
 */
  isVisible() {
    return this.visible;
  }

/**
 * Generates the internal HTML structure for the loading component.
 *
 * @private
 *
 * @returns {string}
 * Rendered HTML markup.
 */
  #render() {
    const spinnerClass =
      this.type === 'grow'
        ? 'spinner-grow'
        : 'spinner-border';

    return `
      <div
        class="${spinnerClass}"
        role="status"
        data-loading-spinner
      >
        <span class="visually-hidden">
          Carregando
        </span>
      </div>

      ${
        this.message
          ? `
            <div
              class="mt-3 text-center small"
              data-loading-message
            >
              ${this.message}
            </div>
          `
          : ''
      }
    `;
  }
}