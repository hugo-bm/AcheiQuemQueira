import { Validator } from './validator.js';
import { TextValidator } from './text.js';

/**
 * Provides validation methods for item data.
 */
export class ItemValidator {
  /**
   * Validates an item title.
   *
   * @param {*} title - Item title.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateTitle(title) {
    return TextValidator.validateTitle(title);
  }

  /**
   * Validates an item description.
   *
   * @param {*} description - Item description.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateDescription(description) {
    return TextValidator.validateDescription(description);
  }

  /**
   * Validates an item quality.
   *
   * @param {*} quality - Item quality.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateQuality(quality) {
    if (!Validator.required(quality)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    const qualities = [
      'grau-1',
      'grau-2',
      'grau-3',
      'grau-4'
    ];

    if (!qualities.includes(quality)) {
      return {
        valid: false,
        error: 'INVALID_QUALITY'
      };
    }

    return {
      valid: true,
      error: null
    };
  }

  /**
   * Validates a category identifier.
   *
   * @param {*} categoryId - Category identifier.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateCategory(categoryId) {
    if (!Validator.required(categoryId)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    return {
      valid: true,
      error: null
    };
  }

  /**
   * Validates a subcategory identifier.
   *
   * @param {*} subcategoryId - Subcategory identifier.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateSubcategory(subcategoryId) {
    if (!Validator.required(subcategoryId)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    return {
      valid: true,
      error: null
    };
  }

  /**
   * Validates expiration days.
   *
   * @param {*} days - Expiration period.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateExpirationDays(days) {
    if (!Validator.required(days)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    const allowedValues = [1, 7, 15, 30];

    if (!allowedValues.includes(days)) {
      return {
        valid: false,
        error: 'INVALID_EXPIRATION'
      };
    }

    return {
      valid: true,
      error: null
    };
  }
}