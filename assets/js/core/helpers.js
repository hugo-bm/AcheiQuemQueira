export const Helpers = {

  uuid() {
    return crypto.randomUUID();
  },

  debounce(callback, delay = 300) {
    let timer;

    return (...args) => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }

};