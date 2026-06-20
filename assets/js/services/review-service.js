import { AQQStorage } from '../core/aqq-storage.js';
import { NegotiationService } from './negotiation-service.js';
import { ReputationService } from './reputation-service.js';
import { NEGOTIATION_STATUS } from '../core/constants.js';
import "../models/entities.js"

export class ReviewService {
  /**
   * Creates a new review.
   *
   * @param {Object} reviewData - Review data.
   * @param {string} reviewData.negotiationId - Negotiation identifier.
   * @param {string} reviewData.reviewerUserId - Reviewer user identifier.
   * @param {string} reviewData.reviewedUserId - Reviewed user identifier.
   * @param {number} reviewData.rating - Rating value.
   * @param {string} reviewData.comment - Review comment.
   * @returns {Promise<Review>}
   */
  static async createReview(reviewData) {
    const negotiation = NegotiationService.getById(
      reviewData.negotiationId
    );

    if (!negotiation) {
      return {
        success: false,
        error: 'Negotiation not found.'
      };
    }

    if (negotiation.status !== NEGOTIATION_STATUS.COMPLETED) {
      return {
        success: false,
        error: 'Negotiation is not completed.'
      };
    }

    const permission = this.canReview(
      reviewData.negotiationId,
      reviewData.reviewerUserId
    );

    if (!permission.success) {
      return permission;
    }

    if (
      !Number.isInteger(reviewData.rating) ||
      reviewData.rating < 1 ||
      reviewData.rating > 5
    ) {
      return {
        success: false,
        error: 'Invalid rating.'
      };
    }

    if (
      !reviewData.comment ||
      reviewData.comment.trim().length === 0
    ) {
      return {
        success: false,
        error: 'Comment is required.'
      };
    }

    if (reviewData.comment.length > 500) {
      return {
        success: false,
        error: 'Comment exceeds maximum length.'
      };
    }

    try {
      const reviews = AQQStorage.get('reviews') || [];

      const review = {
        id: this.generateId(),
        negotiationId: reviewData.negotiationId,
        reviewerUserId: reviewData.reviewerUserId,
        reviewedUserId: reviewData.reviewedUserId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: new Date().toISOString()
      };

      reviews.push(review);

      AQQStorage.set('reviews', reviews);

      await ReputationService.refreshUserReputation(
        reviewData.reviewedUserId
      );

      return {
        success: true,
        review
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validates whether a user can review a negotiation.
   *
   * @param {string} negotiationId - Negotiation identifier.
   * @param {string} reviewerUserId - Reviewer identifier.
   * @returns {{success: boolean, error?: string}}
   */
  static canReview(negotiationId, reviewerUserId) {
    const negotiation =
      NegotiationService.getById(negotiationId);

    if (!negotiation) {
      return {
        success: false,
        error: 'Negotiation not found.'
      };
    }

    if (
      negotiation.status !==
      NEGOTIATION_STATUS.COMPLETED
    ) {
      return {
        success: false,
        error: 'Negotiation is not completed.'
      };
    }

    const isParticipant =
      negotiation.ownerId === reviewerUserId ||
      negotiation.interestedUserId === reviewerUserId;

    if (!isParticipant) {
      return {
        success: false,
        error: 'User did not participate in this negotiation.'
      };
    }

    const reviews = AQQStorage.get('reviews') || [];

    const alreadyReviewed = reviews.some(
      (review) =>
        review.negotiationId === negotiationId &&
        review.reviewerUserId === reviewerUserId
    );

    if (alreadyReviewed) {
      return {
        success: false,
        error: 'User has already reviewed this negotiation.'
      };
    }

    return {
      success: true
    };
  }

  /**
   * Returns a review by identifier.
   *
   * @param {string} reviewId - Review identifier.
   * @returns {Review|null}
   */
  static getById(reviewId) {
    const reviews = AQQStorage.get('reviews') || [];

    return (
      reviews.find((review) => review.id === reviewId) ||
      null
    );
  }

  /**
   * Returns all reviews for a negotiation.
   *
   * @param {string} negotiationId - Negotiation identifier.
   * @returns {Review[]}
   */
  static getByNegotiationId(negotiationId) {
    const reviews = AQQStorage.get('reviews') || [];

    return reviews
      .filter(
        (review) =>
          review.negotiationId === negotiationId
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );
  }

  /**
   * Returns reviews received by a user.
   *
   * @param {string} userId - User identifier.
   * @returns {Review[]}
   */
  static getReviewsReceived(userId) {
    const reviews = AQQStorage.get('reviews') || [];

    return reviews
      .filter(
        (review) =>
          review.reviewedUserId === userId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
  }

  /**
   * Returns reviews written by a user.
   *
   * @param {string} userId - User identifier.
   * @returns {Review[]}
   */
  static getReviewsWritten(userId) {
    const reviews = AQQStorage.get('reviews') || [];

    return reviews
      .filter(
        (review) =>
          review.reviewerUserId === userId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
  }

  /**
   * Generates a unique identifier.
   *
   * @returns {string}
   */
  static generateId() {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`; // fallback
  }
}