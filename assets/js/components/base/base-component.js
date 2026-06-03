import { on, off } from '../../core/events.js';

/**
 * Base class for all visual components.
 */
export class BaseComponent {
  /**
   * Creates a new component instance.
   */
  constructor() {
    /**
     * Container where the component is mounted.
     *
     * @type {HTMLElement|null}
     */
    this.container = null;

    /**
     * Root rendered element.
     *
     * @type {HTMLElement|null}
     */
    this.element = null;

    /**
     * Registered event listeners.
     *
     * @type {Array}
     */
    this.listeners = [];
  }

  /**
   * Lifecycle hook executed before mount.
   */
  beforeMount() {}

  /**
   * Lifecycle hook executed after mount.
   */
  afterMount() {}

  /**
   * Lifecycle hook executed before update.
   */
  beforeUpdate() {}

  /**
   * Lifecycle hook executed after update.
   */
  afterUpdate() {}

  /**
   * Lifecycle hook executed before unmount.
   */
  beforeUnmount() {}

  /**
   * Lifecycle hook executed after unmount.
   */
  afterUnmount() {}

  /**
   * Renders component markup.
   *
   * @returns {string}
   */
  render() {
    return '';
  }

  /**
   * Mounts component into container.
   *
   * @param {HTMLElement} container
   * @returns {BaseComponent}
   */
  mount(container) {
    this.beforeMount();

    this.container = container;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.render().trim();

    this.element = wrapper.firstElementChild;

    if (this.element) {
      this.container.appendChild(this.element);
    }

    this.afterMount();

    return this;
  }

  /**
   * Updates component lifecycle.
   */
  update() {
    this.beforeUpdate();
    this.afterUpdate();
  }

  /**
   * Unmounts component from DOM.
   */
  unmount() {
    this.beforeUnmount();

    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.element = null;

    this.afterUnmount();
  }

  /**
   * Registers an event listener.
   *
   * @param {HTMLElement|Document|Window} element
   * @param {string} eventName
   * @param {Function} handler
   */
  addListener(element, eventName, handler) {
    on(element, eventName, handler);

    this.listeners.push({
      element,
      eventName,
      handler
    });
  }

  /**
   * Removes a registered listener.
   *
   * @param {HTMLElement|Document|Window} element
   * @param {string} eventName
   * @param {Function} handler
   */
  removeListener(element, eventName, handler) {
    off(element, eventName, handler);

    this.listeners = this.listeners.filter(
      listener =>
        !(
          listener.element === element &&
          listener.eventName === eventName &&
          listener.handler === handler
        )
    );
  }

  /**
   * Destroys the component.
   */
  destroy() {
    this.listeners.forEach(listener => {
      off(
        listener.element,
        listener.eventName,
        listener.handler
      );
    });

    this.listeners = [];

    this.unmount();

    this.container = null;
    this.element = null;
  }
}