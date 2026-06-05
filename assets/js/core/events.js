export const Events = {

  on(element, event, callback) {
    element.addEventListener(event, callback);
  },

  off(element, event, callback) {
    element.removeEventListener(event, callback);
  },

  emit(name, detail = {}) {
    document.dispatchEvent(
      new CustomEvent(name, { detail })
    );
  }
};