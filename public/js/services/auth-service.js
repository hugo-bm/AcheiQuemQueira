import { Session } from "../core/session.js";
import { UserService } from "./user-service.js";

/**
 * Centralizes authentication operations for the application.
 */
export default class AuthService {
  /**
   * Authenticates a user using email and password.
   *
   * @param {string} email - User email.
   * @param {string} password - User password.
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
   */
  static async login(email, password) {
    const user = UserService.getByEmail(email);

    if (!user) {
      return {
        success: false,
        error: "Invalid credentials",
      };
    }

    const hashedPassword = await this.hashPassword(password);

    if (user.password !== hashedPassword) {
      return {
        success: false,
        error: "Invalid credentials",
      };
    }

    Session.login(user.id);

    return {
      success: true,
      user,
    };
  }

  /**
   * Removes the current session.
   *
   * @returns {void}
   */
  static logout() {
    Session.logout();
  }

  /**
   * Registers a new user.
   *
   * @param {Object} user - User data.
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
   */
  static async register(user) {
    // if (this.emailExists(user.email)) {
    if (!UserService.isEmailAvailable(user.email)) {
      return {
        success: false,
        error: "Email already exists",
      };
    }

    // if (this.phoneExists(user.phone)) {
    if (!UserService.isPhoneAvailable(user.phone)) {
      return {
        success: false,
        error: "Phone already exists",
      };
    }

    return UserService.createUser({
      ...user,
      password: await this.hashPassword(user.password),
    });
  }

  /**
   * Returns the currently authenticated user.
   *
   * @returns {Object|null} Authenticated user or null.
   */
  static getCurrentUser() {
    const userId = Session.getUserId();

    if (!userId) {
      return null;
    }

    return UserService.getById(userId);
  }

  /**
   * Checks whether a session is active.
   *
   * @returns {boolean}
   */
  static isAuthenticated() {
    return Session.isAuthenticated();
  }

 
  /**
   * Generates a SHA-256 hash when Web Crypto API is available.
   * Returns the original password otherwise.
   *
   * @param {string} password - Password to hash.
   * @returns {Promise<string>}
   */
  static async hashPassword(password) {
    if (!globalThis.crypto || !globalThis.crypto.subtle) {
      return password;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
}
