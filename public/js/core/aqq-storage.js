/**
 * AQQ - Storage
 *
 * Centralized LocalStorage access layer.
 *
 * This class is the only layer allowed
 * to communicate directly with LocalStorage.
 */
export class AQQStorage {
  /**
   * Prefix used by all collections in the application.
   *
   * @type {string}
   */
  static PREFIX = 'aqq_';

  /**
   * Builds the complete key used in LocalStorage.
   *
   * @param {string} collection - Collection Name.
   * @returns {string} Complete key with prefix..
   */
  static buildKey(collection) {
    return `${this.PREFIX}${collection}`;
  }

  /**
   * Checks if a collection exists in LocalStorage.
   *
   * @param {string} collection - Collection Name.
   * @returns {boolean} "True" when the collection exists..
   */
  static exists(collection) {
    return localStorage.getItem(this.buildKey(collection)) !== null;
  }

  /**
   * Retrieves data from a collection.
   *
   * @param {string} collection - Collection Name.
   * @returns {*} Deserialized data or null when nonexistent.
   */
  static get(collection) {
    const data = localStorage.getItem(this.buildKey(collection));

    if (data === null) {
      return null;
    }

    return JSON.parse(data);
  }

  /**
   * Persist data in a collection..
   *
   * @param {string} collection - Collection Name.
   * @param {*} value - Value to be preserved.
   * @returns {void}
   */
  static set(collection, value) {
    localStorage.setItem(
      this.buildKey(collection),
      JSON.stringify(value)
    );
  }

  /**
   * Remove a collection from LocalStorage.
   *
   * @param {string} collection - Collection Name.
   * @returns {void}
   */
  static remove(collection) {
    localStorage.removeItem(this.buildKey(collection));
  }

  /**
   * Remove only the collections belonging to AQQ..
   *
   * @returns {void}
   */
  static clear() {
    const keys = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key && key.startsWith(this.PREFIX)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Retrieves all stored AQQ collections.
   *
   * @returns {Object<string, *>} Object containing all collections.
   */
  static getAll() {
    const collections = {};

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key || !key.startsWith(this.PREFIX)) {
        continue;
      }

      const collection = key.replace(this.PREFIX, '');
      const value = localStorage.getItem(key);

      collections[collection] = value === null
        ? null
        : JSON.parse(value);
    }

    return collections;
  }
}