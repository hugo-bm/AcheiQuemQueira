export const Helpers = {

  /**
   * Creates a debounced version of the provided callback function.
   *
   * @param {Function} callback - The execution logic to delay.
   * @param {number} [delay=300] - The wait time window in milliseconds.
   * @returns {Function} A new debounced function closure.
   */
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