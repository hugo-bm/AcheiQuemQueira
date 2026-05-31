import { Validator } from './validator.js';

/**
 * Provides validation methods for Brazilian phone numbers.
 */
export class PhoneValidator {
    /**
     * Removes all non-numeric characters from a phone number.
     *
     * @param {*} phone - Phone number to sanitize.
     * @returns {string}
     */
    static sanitize(phone) {
        return String(phone).replace(/\D/g, '');
    }

    /**
     * Validates a Brazilian phone number.
     *
     * Accepted formats:
     * - 10 digits (DDD + landline)
     * - 11 digits (DDD + mobile)
     *
     * @param {*} phone - Phone number to validate.
     * @returns {{valid: boolean, error: string|null}}
     */
    static validate(phone) {
        if (!Validator.required(phone)) {
            return {
                valid: false,
                error: 'REQUIRED'
            };
        }

        const sanitizedPhone = this.sanitize(phone);

        const isValidLength =
            sanitizedPhone.length === 10 ||
            sanitizedPhone.length === 11;

        if (!isValidLength) {
            return {
                valid: false,
                error: 'INVALID_PHONE'
            };
        }

        return {
            valid: true,
            error: null
        };
    }
}