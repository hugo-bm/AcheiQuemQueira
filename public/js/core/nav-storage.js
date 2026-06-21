/**
 * Navigation context storage.
 *
 * Persists temporary page navigation data using SessionStorage.
 */
export class NavStorage {
  static PREFIX = 'aqq-nav-';

  /**
   * Stores navigation data.
   *
   * @param {string} page
   * @param {Object} data
   */
  static set(page, data) {
    try {
      sessionStorage.setItem(
        `${this.PREFIX}${page}`,
        JSON.stringify({
          page,
          data
        })
      );
    } catch {
      // Silent fail
    }
  }

  /**
   * Retrieves navigation data.
   *
   * @param {string} page
   * @returns {Object|null}
   */
  static get(page) {
    try {
      const raw = sessionStorage.getItem(
        `${this.PREFIX}${page}`
      );

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      return parsed?.data ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Checks if a navigation context exists.
   *
   * @param {string} page
   * @returns {boolean}
   */
  static has(page) {
    return sessionStorage.getItem(
      `${this.PREFIX}${page}`
    ) !== null;
  }

  /**
   * Removes a navigation context.
   *
   * @param {string} page
   */
  static remove(page) {
    sessionStorage.removeItem(
      `${this.PREFIX}${page}`
    );
  }

  /**
   * Clears all NavStorage entries.
   */
  static clear() {
    const keys = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);

      if (key?.startsWith(this.PREFIX)) {
        keys.push(key);
      }
    }

    keys.forEach(key =>
      sessionStorage.removeItem(key)
    );
  }
}