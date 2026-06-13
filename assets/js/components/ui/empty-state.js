/**
 * Reusable component used to display empty content states
 * throughout the application.
 */
export class EmptyState {
  /**
   * Creates a new EmptyState instance.
   *
   * @param {Object} [options={}]
   * Optional component configuration.
   *
   * @param {string} [options.icon='bi-inbox']
   * Bootstrap Icons class name.
   *
   * @param {string} [options.title='No content available']
   * Main title displayed to the user.
   *
   * @param {string} [options.description='']
   * Optional descriptive message.
   *
   * @param {string|null} [options.actionText=null]
   * Optional action button label.
   *
   * @param {Function|null} [options.actionCallback=null]
   * Optional action button callback.
   */
  constructor(options = {}) {
    this.icon = options.icon || "bi-inbox";
    this.title = options.title || "No content available";
    this.description = options.description || "";

    this.actionText = options.actionText || null;
    this.actionCallback = options.actionCallback || null;

    this.element = null;
    this.actionButton = null;

    this.handleActionClick = this.handleActionClick.bind(this);
  }

  /**
   * Updates the component title.
   *
   * @param {string} title
   * New title.
   *
   * @returns {void}
   */
  setTitle(title) {
    this.title = title || "";

    if (!this.element) {
      return;
    }

    const titleElement = this.element.querySelector("[data-empty-state-title]");

    if (titleElement) {
      titleElement.textContent = this.title;
    }
  }

  /**
   * Updates the component description.
   *
   * @param {string} description
   * New description.
   *
   * @returns {void}
   */
  setDescription(description) {
    this.description = description || "";

    if (!this.element) {
      return;
    }

    const descriptionElement = this.element.querySelector(
      "[data-empty-state-description]",
    );

    if (descriptionElement) {
      descriptionElement.textContent = this.description;
    }
  }

  /**
   * Updates the displayed icon.
   *
   * @param {string} icon
   * Bootstrap Icons class name.
   *
   * @returns {void}
   */
  setIcon(icon) {
    this.icon = icon || "bi-inbox";

    if (!this.element) {
      return;
    }

    const iconElement = this.element.querySelector("[data-empty-state-icon]");

    if (iconElement) {
      iconElement.className = `${this.icon} display-4 text-secondary`;
    }
  }

  /**
   * Configures the action button.
   *
   * @param {string} text
   * Button label.
   *
   * @param {Function} callback
   * Function executed when the button is clicked.
   *
   * @returns {void}
   */
  setAction(text, callback) {
    this.actionText = text;
    this.actionCallback = callback;

    if (!this.element) {
      return;
    }

    this.#renderAction();
  }

  /**
   * Removes the configured action button.
   *
   * @returns {void}
   */
  clearAction() {
    this.actionText = null;
    this.actionCallback = null;

    if (!this.element) {
      return;
    }

    // Explicitly remove the click listener before clearing the button reference.
    if (this.actionButton) {
      this.actionButton.removeEventListener("click", this.handleActionClick);
      this.actionButton.remove();
      this.actionButton = null;
    }

    const actionContainer = this.element.querySelector(
      "[data-empty-state-action]",
    );

    if (actionContainer) {
      actionContainer.innerHTML = "";
    }

    this.actionButton = null;
  }

  /**
   * Renders the empty state component.
   *
   * @returns {HTMLElement}
   * Rendered component element.
   */
  render() {
    const wrapper = document.createElement("div");

    wrapper.className = `
      text-center
      py-5
      px-3
    `;

    wrapper.innerHTML = `
      <div class="d-flex flex-column align-items-center">
        <i
          class="${this.icon} display-4 text-secondary" 
          data-empty-state-icon
          aria-hidden="true"
          focusable="false"
        ></i>

        <h5
          class="mt-3 mb-2"
          data-empty-state-title
        >
          ${this.title}
        </h5>

        ${
          this.description
            ? `
              <p
                class="text-muted mb-3"
                data-empty-state-description
              >
                ${this.description}
              </p>
            `.trim()
            : `
              <p
                class="text-muted mb-0"
                data-empty-state-description
              ></p>
            `.trim()
        }

        <div data-empty-state-action></div>
      </div>
    `.trim();

    this.element = wrapper;

    this.#renderAction();

    return this.element;
  }

  /**
   * Handles action button click events.
   *
   * @private
   *
   * @returns {void}
   */
  handleActionClick() {
    if (typeof this.actionCallback === "function") {
      this.actionCallback();
    }
  }

  /**
   * Renders the action button when configured.
   *
   * @private
   *
   * @returns {void}
   */
  #renderAction() {
    // Unlink the listener from the old button before resetting the inner container
    if (this.actionButton) {
      this.actionButton.removeEventListener("click", this.handleActionClick);
      this.actionButton = null;
    }

    if (!this.element) {
      return;
    }

    const container = this.element.querySelector("[data-empty-state-action]");

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!this.actionText) {
      return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.className = "btn aq-btn-secondary text-light";
    button.textContent = this.actionText;

    button.addEventListener("click", this.handleActionClick);

    container.appendChild(button);

    this.actionButton = button;
  }
}
