import { AQQStorage } from '../core/aqq-storage.js';
import { UserService } from './user-service.js';
import { NEGOTIATION_STATUS } from '../core/constants.js';

export class ReputationService {
  /**
   * Returns the complete reputation summary for a user.
   *
   * @param {string} userId - User identifier.
   * @returns {{
   * averageRating: number,
   * reviewsCount: number,
   * completedDeals: number,
   * publishedItems: number
   * }}
   */
  static getUserReputation(userId) {
    return {
      averageRating: this.getAverageRating(userId),
      reviewsCount: this.getReviewsCount(userId),
      completedDeals: this.getCompletedDeals(userId),
      publishedItems: this.getPublishedItems(userId)
    };
  }

  /**
   * Calculates the average rating received by a user.
   *
   * @param {string} userId - User identifier.
   * @returns {number}
   */
  static getAverageRating(userId) {
    const reviews = AQQStorage.get('reviews') || [];

    const userReviews = reviews.filter(
      (review) => review.reviewedUserId === userId
    );

    if (userReviews.length === 0) {
      return 0;
    }

    const total = userReviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return Number((total / userReviews.length).toFixed(1));
  }

  /**
   * Returns the number of reviews received by a user.
   *
   * @param {string} userId - User identifier.
   * @returns {number}
   */
  static getReviewsCount(userId) {
    const reviews = AQQStorage.get('reviews') || [];

    return reviews.filter(
      (review) => review.reviewedUserId === userId
    ).length;
  }

  /**
   * Returns the number of completed negotiations involving the user.
   *
   * @param {string} userId - User identifier.
   * @returns {number}
   */
  static getCompletedDeals(userId) {
    const negotiations = AQQStorage.get('negotiations') || [];

    return negotiations.filter(
      (negotiation) =>
        negotiation.status === NEGOTIATION_STATUS.COMPLETED &&
        (
          negotiation.ownerId === userId ||
          negotiation.interestedUserId === userId
        )
    ).length;
  }

  /**
   * Returns the total number of items published by a user.
   *
   * @param {string} userId - User identifier.
   * @returns {number}
   */
  static getPublishedItems(userId) {
    const items = AQQStorage.get('items') || [];

    return items.filter(
      (item) =>
        item.userId === userId ||
        item.ownerId === userId
    ).length;
  }

  /**
   * Recalculates and persists user reputation.
   *
   * @param {string} userId - User identifier.
   * @returns {Promise<{
   * success: boolean,
   * reputation?: {
   * averageRating: number,
   * reviewsCount: number,
   * completedDeals: number,
   * publishedItems: number
   * },
   * error?: string
   * }>}
   */
  static async refreshUserReputation(userId) {
    try {
      const users = AQQStorage.get('users') || [];

      const userIndex = users.findIndex(
        (user) => user.id === userId
      );

      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const reputation = this.getUserReputation(userId);

      users[userIndex].reputation = reputation;
      users[userIndex].updatedAt = new Date().toISOString();

      AQQStorage.set('users', users);

      return {
        success: true,
        reputation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}