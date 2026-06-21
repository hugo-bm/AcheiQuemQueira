import { AQQStorage } from '../core/aqq-storage.js';
import { NOTIFICATION_TYPES, REFERENCE_TYPES } from '../core/constants.js';

/**
 * Centralizes notification management for the application.
 */
export class NotificationService {
  /**
   * Generates a unique identifier.
   *
   * @returns {string}
   */
  static generateId() {
    if (globalThis.crypto?.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  /**
   * Creates a new notification.
   *
   * @param {Object} notification - Notification data.
   * @returns {{success: boolean, notification?: Object, error?: string}}
   */
  static create(notification) {
    const { userId, type, title, message, referenceType, referenceId } =
      notification;

    if (!userId || !type || !title) {
      return {
        success: false,
        error: 'REQUIRED'
      };
    }

    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      return {
        success: false,
        error: 'INVALID_NOTIFICATION_TYPE'
      };
    }

    if (referenceType && !Object.values(REFERENCE_TYPES).includes(referenceType)) {
      return {
        success: false,
        error: 'INVALID_REFERENCE_TYPE'
      };
    }

    const notifications = AQQStorage.get('notifications') ?? [];

    const newNotification = {
      id: this.generateId(),
      userId,
      type,
      title,
      message: message ?? '',
      referenceType: referenceType ?? null,
      referenceId: referenceId ?? null,
      createdAt: new Date().toISOString(),
      readAt: null
    };

    notifications.push(newNotification);

    AQQStorage.set('notifications', notifications);

    return {
      success: true,
      notification: newNotification
    };
  }

  /**
   * Returns all notifications for a user.
   *
   * @param {string} userId - User identifier.
   * @returns {Array}
   */
  static getByUser(userId) {
    const notifications = AQQStorage.get('notifications') ?? [];

    return notifications
      .filter((n) => n.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );
  }

  /**
   * Returns unread notifications for a user.
   *
   * @param {string} userId - User identifier.
   * @returns {Array}
   */
  static getUnreadByUser(userId) {
    const notifications = AQQStorage.get('notifications') ?? [];

    return notifications
      .filter(
        (n) => n.userId === userId && n.readAt === null
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );
  }

  /**
   * Marks a notification as read.
   *
   * @param {string} notificationId - Notification identifier.
   * @returns {boolean}
   */
  static markAsRead(notificationId) {
    const notifications =
      AQQStorage.get('notifications') ?? [];

    const index = notifications.findIndex(
      (n) => n.id === notificationId
    );

    if (index === -1) {
      return false;
    }

    notifications[index] = {
      ...notifications[index],
      readAt: new Date().toISOString()
    };

    AQQStorage.set('notifications', notifications);

    return true;
  }

  /**
   * Removes a notification by id.
   *
   * @param {string} notificationId - Notification identifier.
   * @returns {boolean}
   */
  static remove(notificationId) {
    const notifications =
      AQQStorage.get('notifications') ?? [];

    const filtered = notifications.filter(
      (n) => n.id !== notificationId
    );

    if (filtered.length === notifications.length) {
      return false;
    }

    AQQStorage.set('notifications', filtered);

    return true;
  }

  /**
   * Removes all notifications for a user.
   *
   * @param {string} userId - User identifier.
   * @returns {number} Number of removed notifications.
   */
  static removeAllByUser(userId) {
    const notifications =
      AQQStorage.get('notifications') ?? [];

    const remaining = notifications.filter(
      (n) => n.userId !== userId
    );

    const removedCount =
      notifications.length - remaining.length;

    AQQStorage.set('notifications', remaining);

    return removedCount;
  }
}