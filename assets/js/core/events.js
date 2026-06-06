export const Events = {
  /**
   * Registers an event listener.
   *
   * @param {HTMLElement|Document} element Element to attach the listener to.
   * @param {string} event Name of the custom event.
   * @param {Function} handler Callback function.
   */
  on(element, event, callback) {
    element.addEventListener(event, callback);
  },
  /**
   * Removes an event listener.
   *
   * @param {HTMLElement|Document} element Element to detach the listener from.
   * @param {string} event Name of the custom event.
   * @param {Function} callback Callback function.
   */
  off(element, event, callback) {
    element.removeEventListener(event, callback);
  },
  /**
   * Dispatches a custom event with scoping options.
   *
   * @param {HTMLElement} element The dispatching element source.
   * @param {string} event Name of the custom event.
   * @param {Object} [detail={}] Payload data.
   * @param {boolean} [isGoUp=false] If true, enables bubbling.
   */
  emit(element, event, detail, isGoUp) {
    const goUp = isGoUp || false;
    const payload = detail || {};
    const customEvent = new CustomEvent(event, {
      bubbles: goUp, // Enable event upload via DOM.
      composed: goUp, // It crosses structural scope boundaries.
      detail: payload, // Encapsulate the data (payload)
    });
    console.log(element);
    element.dispatchEvent(customEvent);
  },
};
