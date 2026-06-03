/**
 * Provides reusable generic validation methods.
 */
export class Validator {
  /**
   * Checks whether a value is present.
   *
   * Returns false for:
   * - null
   * - undefined
   * - empty strings
   *
   * @param {*} value - Value to validate.
   * @returns {boolean}
   */
  static required(value) {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string' && value === '') {
      return false;
    }

    return true;
  }

  /**
   * Checks whether a value is a string.
   *
   * @param {*} value - Value to validate.
   * @returns {boolean}
   */
  static isString(value) {
    return typeof value === 'string';
  }

  /**
   * Checks whether a value is a valid number.
   *
   * @param {*} value - Value to validate.
   * @returns {boolean}
   */
  static isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  /**
   * Checks whether a value is an array.
   *
   * @param {*} value - Value to validate.
   * @returns {boolean}
   */
  static isArray(value) {
    return Array.isArray(value);
  }

  /**
   * Checks whether a value is a valid object.
   *
   * Arrays are not considered valid objects.
   *
   * @param {*} value - Value to validate.
   * @returns {boolean}
   */
  static isObject(value) {
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    );
  }

  /**
   * Checks whether a value length is greater than or equal to the minimum.
   *
   * @param {{ length: number }} value - Value to validate.
   * @param {number} min - Minimum length.
   * @returns {boolean}
   */
  static minLength(value, min) {
    return value.length >= min;
  }

  /**
   * Checks whether a value length is less than or equal to the maximum.
   *
   * @param {{ length: number }} value - Value to validate.
   * @param {number} max - Maximum length.
   * @returns {boolean}
   */
  static maxLength(value, max) {
    return value.length <= max;
  }

  /**
   * Checks whether a value matches a regular expression.
   *
   * @param {string} value - Value to validate.
   * @param {RegExp} regex - Regular expression.
   * @returns {boolean}
   */
  static matches(value, regex) {
    return regex.test(value);
  }
}