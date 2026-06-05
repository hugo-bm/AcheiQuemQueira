export const DOM = {

  select(selector) {
    return document.querySelector(selector);
  },

  selectAll(selector) {
    return document.querySelectorAll(selector);
  },

  show(element) {
    element.hidden = false;
  },

  hide(element) {
    element.hidden = true;
  },

  toggle(element) {
    element.hidden = !element.hidden;
  }

};