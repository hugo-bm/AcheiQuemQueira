import { Validator } from './validator.js';

/**
 * Provides validation methods for Brazilian CNPJ numbers.
 */
export class CNPJValidator {
  /**
   * Removes all non-numeric characters from a CNPJ value.
   *
   * @param {*} cnpj - CNPJ value to sanitize.
   * @returns {string}
   */
  static sanitize(cnpj) {
    return String(cnpj).replace(/\D/g, '');
  }

  /**
   * Validates whether all CNPJ digits are identical.
   *
   * @param {string} cnpj - Sanitized CNPJ.
   * @returns {boolean}
   */
  static isRepeatedDigits(cnpj) {
    return cnpj.split('').every((digit) => digit === cnpj[0]);
  }

  /**
   * Calculates a CNPJ verification digit using the official algorithm.
   *
   * @param {string} cnpj - Partial CNPJ used in the calculation.
   * @param {number[]} weights - Weight sequence.
   * @returns {number}
   */
  static calculateDigit(cnpj, weights) {
    let total = 0;

    for (let index = 0; index < weights.length; index += 1) {
      total += Number(cnpj[index]) * weights[index];
    }

    const remainder = total % 11;

    return remainder < 2
      ? 0
      : 11 - remainder;
  }

  /**
   * Validates a Brazilian CNPJ.
   *
   * Validation flow:
   * - Required
   * - Sanitization
   * - Length validation
   * - Repeated digits validation
   * - First verification digit validation
   * - Second verification digit validation
   *
   * @param {*} cnpj - CNPJ value to validate.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validate(cnpj) {
    if (!Validator.required(cnpj)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    const sanitizedCNPJ = this.sanitize(cnpj);

    if (sanitizedCNPJ.length !== 14) {
      return {
        valid: false,
        error: 'INVALID_CNPJ'
      };
    }

    if (this.isRepeatedDigits(sanitizedCNPJ)) {
      return {
        valid: false,
        error: 'INVALID_CNPJ'
      };
    }

    const firstDigit = this.calculateDigit(
      sanitizedCNPJ.slice(0, 12),
      [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    if (firstDigit !== Number(sanitizedCNPJ[12])) {
      return {
        valid: false,
        error: 'INVALID_CNPJ'
      };
    }

    const secondDigit = this.calculateDigit(
      sanitizedCNPJ.slice(0, 13),
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    if (secondDigit !== Number(sanitizedCNPJ[13])) {
      return {
        valid: false,
        error: 'INVALID_CNPJ'
      };
    }

    return {
      valid: true,
      error: null
    };
  }
}