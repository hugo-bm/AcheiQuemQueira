import { BaseComponent } from './base-component.js';

/**
 * Base Bootstrap modal component.
 */
export class BaseModalComponent extends BaseComponent {
  /**
   * Creates a modal component.
   */
  constructor() {
    super();

    /**
     * Bootstrap modal instance.
     *
     * @type {bootstrap.Modal|null}
     */
    this.modal = null;
  }

  /**
   * Mounts modal component.
   *
   * @param {HTMLElement} container
   * @returns {BaseModalComponent}
   */
  mount(container) {
    super.mount(container);

    if (this.element) {
      this.modal = new bootstrap.Modal(this.element);

      // Captures the closing action triggered from outside the
      // modal (X button, external click, or ESC)
      this.addListener(this.element, 'hidden.bs.modal', () => {
        this.onModalHidden();
      });
    }

    return this;
  }

  /**
   * Lifecycle hook executed after the modal has completed its closing animation.
   * Override this method in child components to handle post-closure cleanup 
   * (e.g., resetting form data, unmounting views, or freeing memory).
   * 
   * @protected
   * @returns {void}
   */
  onModalHidden() {}

  /**
   * Opens modal.
   */
  open() {
    this.modal?.show();
  }

  /**
   * Closes modal.
   */
  close() {
    this.modal?.hide();
  }

  /**
   * Toggles modal state.
   */
  toggle() {
    if (!this.modal) {
      return;
    }

    if (this.element?.classList.contains('show')) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Destroys modal.
   */
  destroy() {
    if (!this.modal) {
      super.destroy();
      return;
    }

    // If the modal is still visible on the screen, 
    // we hide it first and wait for the animation to finish
    // before deleting the element from the DOM.
    if (this.element?.classList.contains('show')) {
      this.addListener(this.element, 'hidden.bs.modal', () => {
        this.modal?.dispose();
        this.modal = null;
        super.destroy();
      });
      this.close();
    } else {
      // If it was already sealed, disposal is immediate and safe.
      this.modal.dispose();
      this.modal = null;
      super.destroy();
    }
  }
}