import { Validator } from './validator.js';

/**
 * Provides validation methods for location fields.
 */
export class LocationValidator {
  /**
   * Validates a state value.
   *
   * @param {*} state - State value.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateState(state) {
    if (!Validator.required(state)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    if (!Validator.isString(state)) {
      return {
        valid: false,
        error: 'INVALID_TYPE'
      };
    }

    if (!Validator.minLength(state, 2)) {
      return {
        valid: false,
        error: 'MIN_LENGTH'
      };
    }

    if (!Validator.maxLength(state, 120)) {
      return {
        valid: false,
        error: 'MAX_LENGTH'
      };
    }

    return {
      valid: true,
      error: null
    };
  }

  /**
   * Validates a city value.
   *
   * @param {*} city - City value.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateCity(city) {
    if (!Validator.required(city)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    if (!Validator.isString(city)) {
      return {
        valid: false,
        error: 'INVALID_TYPE'
      };
    }

    if (!Validator.minLength(city, 2)) {
      return {
        valid: false,
        error: 'MIN_LENGTH'
      };
    }

    if (!Validator.maxLength(city, 120)) {
      return {
        valid: false,
        error: 'MAX_LENGTH'
      };
    }

    return {
      valid: true,
      error: null
    };
  }

  /**
   * Validates a neighborhood value.
   *
   * @param {*} neighborhood - Neighborhood value.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateNeighborhood(neighborhood) {
    if (!Validator.required(neighborhood)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    if (!Validator.isString(neighborhood)) {
      return {
        valid: false,
        error: 'INVALID_TYPE'
      };
    }

    if (!Validator.minLength(neighborhood, 2)) {
      return {
        valid: false,
        error: 'MIN_LENGTH'
      };
    }

    if (!Validator.maxLength(neighborhood, 120)) {
      return {
        valid: false,
        error: 'MAX_LENGTH'
      };
    }

    return {
      valid: true,
      error: null
    };
  }
}