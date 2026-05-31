import { Validator } from './validator.js';

/**
 * Provides validation methods for Brazilian CPF numbers.
 */
export class CPFValidator {
  /**
   * Removes all non-numeric characters from a CPF value.
   *
   * @param {*} cpf - CPF value to sanitize.
   * @returns {string}
   */
  static sanitize(cpf) {
    return String(cpf).replace(/\D/g, '');
  }

  /**
   * Validates whether all CPF digits are identical.
   *
   * @param {string} cpf - Sanitized CPF.
   * @returns {boolean}
   */
  static isRepeatedDigits(cpf) {
    return cpf.split('').every((digit) => digit === cpf[0]);
  }

  /**
   * Calculates a CPF verification digit using the official algorithm.
   *
   * @param {string} cpf - Partial CPF used in the calculation.
   * @param {number} factor - Initial multiplication factor.
   * @returns {number}
   */
  static calculateDigit(cpf, factor) {
    let total = 0;

    for (const digit of cpf) {
      total += Number(digit) * factor;
      factor -= 1;
    }

    const remainder = total % 11;

    return remainder < 2
      ? 0
      : 11 - remainder;
  }

  /**
   * Validates a Brazilian CPF.
   *
   * Validation flow:
   * - Required
   * - Sanitization
   * - Length validation
   * - Repeated digits validation
   * - First verification digit validation
   * - Second verification digit validation
   *
   * @param {*} cpf - CPF value to validate.
   * @returns {{valid: boolean, error: string|null}}
   */
  static validate(cpf) {
    if (!Validator.required(cpf)) {
      return {
        valid: false,
        error: 'REQUIRED'
      };
    }

    const sanitizedCPF = this.sanitize(cpf);

    if (sanitizedCPF.length !== 11) {
      return {
        valid: false,
        error: 'INVALID_CPF'
      };
    }

    if (this.isRepeatedDigits(sanitizedCPF)) {
      return {
        valid: false,
        error: 'INVALID_CPF'
      };
    }

    const firstDigit = this.calculateDigit(
      sanitizedCPF.slice(0, 9),
      10
    );

    if (firstDigit !== Number(sanitizedCPF[9])) {
      return {
        valid: false,
        error: 'INVALID_CPF'
      };
    }

    const secondDigit = this.calculateDigit(
      sanitizedCPF.slice(0, 10),
      11
    );

    if (secondDigit !== Number(sanitizedCPF[10])) {
      return {
        valid: false,
        error: 'INVALID_CPF'
      };
    }

    return {
      valid: true,
      error: null
    };
  }
}