/**
 * Manages the current application session..
 */
export class Session {
  /**
   * Key used for session persistence..
   *
   * @type {string}
   */
  static STORAGE_KEY = 'aqq_session';

  /**
   * Creates or replaces the current session.
   *
   * @param {string} userId - User identifier.
   * @returns {void}
   */
  static login(userId) {
    const session = {
      userId,
      loggedAt: new Date().toISOString()
    };

    sessionStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(session)
    );
  }

  /**
   * Remove the current session.
   *
   * @returns {void}
   */
  static logout() {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Retrieves data from the current session.
   *
   * @returns {{userId: string, loggedAt: string}|null} Session data or null.
   */
  static get() {
    const session = sessionStorage.getItem(this.STORAGE_KEY);

    if (session === null) {
      return null;
    }

    return JSON.parse(session);
  }

  /**
   * Retrieves the logged-in user's identifier.
   *
   * @returns {string|null} User identifier or null.
   */
  static getUserId() {
    const session = this.get();

    if (session === null) {
      return null;
    }

    return session.userId;
  }

  /**
   * Checks if there is an active session.
   *
   * @returns {boolean} True quando existir sessão ativa.
   */
  static isAuthenticated() {
    return this.get() !== null;
  }
}