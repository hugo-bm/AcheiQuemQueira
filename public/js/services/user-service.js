import { AQQStorage } from "../core/aqq-storage.js";
import { Validator } from "../validation/validator.js";
import "../models/entities.js"

/**
 * Centralizes user entity management.
 */
export class UserService {
  /**
   * Generates a unique identifier.
   *
   * @returns {string}
   */
  static generateId() {
    if (globalThis.crypto?.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`; // fallback
  }

  /**
   * Generates a six digit verification code.
   *
   * @returns {string}
   */
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Creates a user.
   *
   * @typedef {Object} UserCreate
   *
   * @property {string} document - Brazilian CPF or CNPJ
   * @property {string} name
   * @property {string} email
   * @property {string} password
   * @property {string} phone
   *
   * @property {string} state
   * @property {string} city
   * @property {string} neighborhood
   * @property {string} address
   *
   * @param {UserCreate} userData - User data.
   * @returns {{success:boolean,user?: User,error?:string}}
   */
  static createUser(userData) {
    const {
      document,
      name,
      email,
      password,
      phone,
      state,
      city,
      neighborhood,
      address = "",
    } = userData;

    if (!Validator.required(document)) {
      return { success: false, error: "INVALID_CPF_OR_CNPJ" };
    }
  
    if (!Validator.required(name)) {
      return { success: false, error: "INVALID_NAME" };
    }

    if (!Validator.required(email)) {
      return { success: false, error: "INVALID_EMAIL" };
    }

    if (!Validator.required(password)) {
      return { success: false, error: "INVALID_PASSWORD" };
    }

    if (!Validator.required(phone)) {
      return { success: false, error: "INVALID_PHONE" };
    }

    if (!Validator.required(state)) {
      return { success: false, error: "INVALID_STATE" };
    }

    if (!Validator.required(city)) {
      return { success: false, error: "INVALID_CITY" };
    }

    if (!Validator.required(neighborhood)) {
      return { success: false, error: "INVALID_NEIGHBORHOOD" };
    }

    if (!this.isEmailAvailable(email)) {
      return { success: false, error: "EMAIL_ALREADY_EXISTS" };
    }

    if (!this.isPhoneAvailable(phone)) {
      return { success: false, error: "PHONE_ALREADY_EXISTS" };
    }

    try {
      const users = AQQStorage.get("users") ?? [];
      const now = new Date().toISOString();

      const user = {
        id: this.generateId(),

        document,
        name,
        email,
        password,
        phone,

        verifiedPhone: false,
        verifiedIdentity: false,

        active: true,

        avatar: null,

        state,
        city,
        neighborhood,
        address,

        socialLinks: {
          instagram: "",
          facebook: "",
        },

        reputation: {
          averageRating: 0,
          reviewsCount: 0,
          completedDeals: 0,
          publishedItems: 0,
        },

        createdAt: now,
        updatedAt: now,
      };

      users.push(user);

      AQQStorage.set("users", users);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * User social links.
   *
   * @typedef {Object} UserSocialLinks
   *
   * @property {string} instagram
   * @property {string} facebook
   */
  /**
   *  Updates an existing user.
   *
   * @param {string} userId - User identifier.
   *
   * @typedef {Object} UserUpdate
   *
   * @property {string} name
   * @property {string} phone
   * @property {string} avatar
   * @property {string} state
   * @property {string} city
   * @property {string} neighborhood
   * @property {string} address
   * @property {UserSocialLinks} socialLinks
   *
   * @param {UserUpdate} updates - Allowed updates.
   * @returns {{success:boolean,user?: User,error?:string}}
   */
  static updateUser(userId, updates) {
    try {
      const users = AQQStorage.get("users") ?? [];

      const user = users.find((currentUser) => currentUser.id === userId);

      if (!user) {
        return {
          success: false,
          error: "USER_NOT_FOUND",
        };
      }

      const allowedFields = [
        "name",
        "phone",
        "avatar",
        "state",
        "city",
        "neighborhood",
        "address",
        "socialLinks",
      ];

      allowedFields.forEach((field) => {
        if (Object.hasOwn(updates, field)) {
          user[field] = updates[field];
        }
      });

      user.updatedAt = new Date().toISOString();

      AQQStorage.set("users", users);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Deactivates a user.
   *
   * @param {string} userId - User identifier.
   * @returns {{success:boolean,user?:User,error?:string}}
   */
  static deactivateUser(userId) {
    try {
      const users = AQQStorage.get("users") ?? [];

      const user = users.find((currentUser) => currentUser.id === userId);

      if (!user) {
        return {
          success: false,
          error: "USER_NOT_FOUND",
        };
      }

      user.active = false;
      user.updatedAt = new Date().toISOString();

      AQQStorage.set("users", users);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Returns a user by identifier.
   *
   * @param {string} userId - User identifier.
   * @returns {User|null}
   */
  static getById(userId) {
    const users = AQQStorage.get("users") ?? [];
    return users.find((user) => user.id === userId) ?? null;
  }

  /**
   * Returns a user by email.
   *
   * @param {string} email - User email.
   * @returns {User|null}
   */
  static getByEmail(email) {
    const users = AQQStorage.get("users") ?? [];

    const normalizedEmail = email.toLowerCase();

    return (
      users.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null
    );
  }

  /**
   * Returns a user by phone.
   *
   * @param {string} phone - User phone.
   * @returns {User|null}
   */
  static getByPhone(phone) {
    const users = AQQStorage.get("users") ?? [];

    return users.find((user) => user.phone === phone) ?? null;
  }

  /**
   * Returns a user by phone.
   *
   * @param {string} phone - User phone.
   * @returns {User|null}
   */
  static getByDocument(document) {
    const users = AQQStorage.get("users") ?? [];

    return users.find((user) => user.document === document) ?? null;
  }

  /**
   * Returns all users ordered by creation date.
   *
   * @returns {Object[]}
   */
  static getAll() {
    const users = AQQStorage.get("users") ?? [];

    return [...users].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    ); // DESC Order
  }

  /**
   * Checks whether an email is available.
   *
   * @param {string} email - Email to validate.
   * @returns {boolean}
   */
  static isEmailAvailable(email) {
    return this.getByEmail(email) === null;
  }

  /**
   * Checks whether a phone is available.
   *
   * @param {string} phone - Phone to validate.
   * @returns {boolean}
   */
  static isPhoneAvailable(phone) {
    return this.getByPhone(phone) === null;
  }

  /**
   * Requests email verification.
   *
   * @param {string} userId - User identifier.
   * @returns {{success:boolean,code?:string,error?:string}}
   */
  static requestEmailVerification(userId) {
    try {
      const user = this.getById(userId);

      if (!user) {
        return {
          success: false,
          error: "USER_NOT_FOUND",
        };
      }

      const verificationCodes = AQQStorage.get("verification_codes") ?? [];

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

      const code = this.generateVerificationCode();

      verificationCodes.push({
        id: this.generateId(),
        userId,
        type: "email",
        code,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
      });

      AQQStorage.set("verification_codes", verificationCodes);

      return {
        success: true,
        code,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Confirms email verification.
   *
   * @param {string} userId - User identifier.
   * @param {string} code - Verification code.
   * @returns {{success:boolean,error?:string}}
   */
  static confirmEmailVerification(userId, code) {
    try {
      const user = this.getById(userId);

      if (!user) {
        return {
          success: false,
          error: "USER_NOT_FOUND",
        };
      }

      const verificationCodes = AQQStorage.get("verification_codes") ?? [];

      const index = verificationCodes.findIndex(
        (verificationCode) =>
          verificationCode.userId === userId &&
          verificationCode.type === "email" &&
          verificationCode.code === code,
      );

      if (index === -1) {
        return {
          success: false,
          error: "INVALID_CODE",
        };
      }

      const verificationCode = verificationCodes[index];

      if (new Date(verificationCode.expiresAt) < new Date()) {
        return {
          success: false,
          error: "CODE_EXPIRED",
        };
      }

      verificationCodes.splice(index, 1);

      AQQStorage.set("verification_codes", verificationCodes);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Requests phone verification.
   *
   * @param {string} userId - User identifier.
   * @returns {{success:boolean,code?:string,error?:string}}
   */
  static requestPhoneVerification(userId) {
    try {
      const user = this.getById(userId);

      if (!user) {
        return {
          success: false,
          error: "USER_NOT_FOUND",
        };
      }

      const verificationCodes = AQQStorage.get("verification_codes") ?? [];

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

      const code = this.generateVerificationCode();

      verificationCodes.push({
        id: this.generateId(),
        userId,
        type: "phone",
        code,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
      });

      AQQStorage.set("verification_codes", verificationCodes);

      return {
        success: true,
        code,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Confirms phone verification.
   *
   * @param {string} userId - User identifier.
   * @param {string} code - Verification code.
   * @returns {{success:boolean,error?:string}}
   */
  static confirmPhoneVerification(userId, code) {
    try {

      const rawUsers = AQQStorage.get("users") ?? [];
      

      const users = Array.isArray(rawUsers) ? rawUsers.filter(u => u !== null) : [];
      

      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
        return {
          success: false,
          error: "USER_NOT_FOUND",
        };
      }


      const verificationCodes = AQQStorage.get("verification_codes") ?? [];

      const index = verificationCodes.findIndex(
        (verificationCode) =>
          verificationCode.userId === userId &&
          verificationCode.type === "phone" &&
          verificationCode.code === code,
      );

      if (index === -1) {
        return {
          success: false,
          error: "INVALID_CODE",
        };
      }

      const verificationCode = verificationCodes[index];

      if (new Date(verificationCode.expiresAt) < new Date()) {
        return {
          success: false,
          error: "CODE_EXPIRED",
        };
      }

        const updatedUser = { 
        ...users[userIndex],
        verifiedPhone: true,
        updatedAt: new Date().toISOString()
      };

      users[userIndex] = updatedUser;

      AQQStorage.set("users", users);
      AQQStorage.set("verification_codes", verificationCodes);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Marks user identity as verified.
   *
   * @param {string} userId - User identifier.
   * @returns {{success:boolean,user?:Object,error?:string}}
   */
  static verifyIdentity(userId) {
   try {
      const users = AQQStorage.get("users") ?? [];

      const index = users.findIndex((user) => user.id === userId);

      if (index === -1) {
        return {
          success: false,
          error: "USER_NOT_FOUND",
        };
      }

      users[index].verifiedIdentity = true;
      users[index].updatedAt = new Date().toISOString();

      AQQStorage.set("users", users);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
