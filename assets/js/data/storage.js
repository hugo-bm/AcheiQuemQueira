/**
 * ==================================================
 * AQQ - Storage
 * ==================================================
 *
 * Centralized LocalStorage access layer.
 *
 * This class is the only layer allowed
 * to communicate directly with LocalStorage.
 */
class Storage {

  /**
   * Application key prefix.
   *
   * @type {string}
   */
  static PREFIX = 'aqq';

  /**
   * Builds a collection key.
   *
   * Example:
   * users -> aqq_users
   *
   * @param {string} collection
   * @returns {string}
   */
  static buildKey(collection) {
    return `${this.PREFIX}_${collection}`;
  }

  /**
   * Checks whether a collection exists.
   *
   * @param {string} collection
   * @returns {boolean}
   */
  static exists(collection) {
    return localStorage.getItem(
      this.buildKey(collection)
    ) !== null;
  }

  /**
   * Retrieves a collection.
   *
   * Returns null if not found.
   *
   * @param {string} collection
   * @returns {*}
   */
  static get(collection) {
    const value = localStorage.getItem(
      this.buildKey(collection)
    );

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(
        `Failed to parse collection "${collection}".`,
        error
      );

      return null;
    }
  }

  /**
   * Stores a collection.
   *
   * @param {string} collection
   * @param {*} value
   */
  static set(collection, value) {
    localStorage.setItem(
      this.buildKey(collection),
      JSON.stringify(value)
    );
  }

  /**
   * Removes a collection.
   *
   * @param {string} collection
   */
  static remove(collection) {
    localStorage.removeItem(
      this.buildKey(collection)
    );
  }

  /**
   * Removes every AQQ collection.
   */
  static clear() {

    Object.keys(localStorage)
      .filter(key =>
        key.startsWith(`${this.PREFIX}_`)
      )
      .forEach(key =>
        localStorage.removeItem(key)
      );

  }

  /**
   * Returns all AQQ collections.
   *
   * Useful for debugging and diagnostics.
   *
   * @returns {Object}
   */
  static getAll() {

    const collections = {};

    Object.keys(localStorage)
      .filter(key =>
        key.startsWith(`${this.PREFIX}_`)
      )
      .forEach(key => {

        const collection = key.replace(
          `${this.PREFIX}_`,
          ''
        );

        collections[collection] =
          this.get(collection);

      });

    return collections;

  }

}