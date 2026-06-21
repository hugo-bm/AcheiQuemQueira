import { Validator } from './validator.js';

/**
 * Provides text-related validation methods.
 */
export class TextValidator {
  /**
   * Validates whether a value is required.
   *
   * @param {*} value - Value to validate.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateRequired(value) {
    if (!Validator.required(value)) {
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
   * Validates a name field.
   *
   * Rules:
   * - Required
   * - Must be a string
   * - Length between 2 and 80 characters
   *
   * @param {*} value - Value to validate.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateName(value) {
    if (!Validator.required(value)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    if (!Validator.isString(value)) {
      return {
        valid: false,
        error: 'INVALID_TYPE'
      };
    }

    if (!Validator.minLength(value, 2)) {
      return {
        valid: false,
        error: 'MIN_LENGTH'
      };
    }

    if (!Validator.maxLength(value, 80)) {
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
   * Validates a title field.
   *
   * Rules:
   * - Required
   * - Must be a string
   * - Length between 3 and 120 characters
   *
   * @param {*} value - Value to validate.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateTitle(value) {
    if (!Validator.required(value)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    if (!Validator.isString(value)) {
      return {
        valid: false,
        error: 'INVALID_TYPE'
      };
    }

    if (!Validator.minLength(value, 3)) {
      return {
        valid: false,
        error: 'MIN_LENGTH'
      };
    }

    if (!Validator.maxLength(value, 120)) {
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
   * Validates a description field.
   *
   * Rules:
   * - Optional
   * - Must be a string when provided
   * - Maximum length of 1000 characters
   *
   * @param {*} value - Value to validate.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateDescription(value) {
    if (!Validator.required(value)) {
      return {
        valid: true,
        error: null
      };
    }

    if (!Validator.isString(value)) {
      return {
        valid: false,
        error: 'INVALID_TYPE'
      };
    }

    if (!Validator.maxLength(value, 1000)) {
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
   * Validates an email field.
   *
   * Rules:
   * - Required
   * - Must be a string
   * - Maximum length of 254 characters (RFC 5321)
   * - Must match a valid email format
   *
   * @param {*} value - Value to validate.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validateEmail(value) {
    if (!Validator.required(value)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    if (!Validator.isString(value)) {
      return {
        valid: false,
        error: 'INVALID_TYPE'
      };
    }

    if (!Validator.maxLength(value, 254)) {
      return {
        valid: false,
        error: 'MAX_LENGTH'
      };
    }

    // Official W3C/HTML5 standard Regex for email validation.
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(value)) {
      return {
        valid: false,
        error: 'INVALID_FORMAT'
      };
    }

    return {
      valid: true,
      error: null
    };
  }
}