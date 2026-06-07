import { AQQStorage } from '../core/aqq-storage.js';
import { ProposalService } from './proposal-service.js';
import { ItemService } from './item-service.js';
import { NotificationService } from './notification-service.js';
import {
  NEGOTIATION_STATUS,
  PROPOSAL_STATUS,
  ITEM_STATUS,
  NOTIFICATION_TYPES,
  REFERENCE_TYPES
} from '../core/constants.js';
import "../models/entities.js"

/**
 * Centralizes negotiation business operations.
 */
export class NegotiationService {
  /**
   * Generates a unique identifier.
   *
   * @returns {string}
   */
  static generateId() {
    if (globalThis.crypto?.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`; //fallback
  }

  /**
   * Creates a negotiation from an accepted proposal.
   *
   * @param {string} proposalId - Proposal identifier.
   * @returns {{success:boolean, negotiation?:Object, error?:string}}
   */
  static createNegotiation(proposalId) {
    try {
      const proposal = ProposalService.getById(proposalId);

      if (!proposal) {
        return {
          success: false,
          error: 'PROPOSAL_NOT_FOUND'
        };
      }

      if (proposal.status !== PROPOSAL_STATUS.ACCEPTED) {
        return {
          success: false,
          error: 'INVALID_PROPOSAL_STATUS'
        };
      }

      const item = ItemService.getById(proposal.itemId);

      if (!item) {
        return {
          success: false,
          error: 'ITEM_NOT_FOUND'
        };
      }

      const negotiations =
        AQQStorage.get('negotiations') ?? [];

      const negotiation = {
        id: this.generateId(),

        itemId: item.id,
        proposalId: proposal.id,

        ownerId: item.ownerId,
        interestedUserId: proposal.proposerId,

        status: NEGOTIATION_STATUS.OPEN,

        leavingAt: null,
        arrivedAt: null,
        completedAt: null,
        cancelledAt: null,

        createdAt: new Date().toISOString()
      };

      negotiations.push(negotiation);

      AQQStorage.set(
        'negotiations',
        negotiations
      );

      return {
        success: true,
        negotiation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Returns a negotiation by identifier.
   *
   * @param {string} negotiationId - Negotiation identifier.
   * @returns {Object|null}
   */
  static getById(negotiationId) {
    try {
      const negotiations =
        AQQStorage.get('negotiations') ?? [];

      return (
        negotiations.find(
          (negotiation) =>
            negotiation.id === negotiationId
        ) ?? null
      );
    } catch {
      return null;
    }
  }

  /**
   * Returns all negotiations.
   *
   * @returns {Object[]}
   */
  static getAll() {
    try {
      const negotiations =
        AQQStorage.get('negotiations') ?? [];

      return [...negotiations].sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      ); // DESC Order
    } catch {
      return [];
    }
  }

  /**
   * Returns negotiations for an item.
   *
   * @param {string} itemId - Item identifier.
   * @returns {Negotiation[]}
   */
  static getItemNegotiations(itemId) {
    try {
      return this.getAll().filter(
        (negotiation) =>
          negotiation.itemId === itemId
      );
    } catch {
      return [];
    }
  }

  /**
   * Returns negotiations for a user.
   *
   * @param {string} userId - User identifier.
   * @returns {Negotiation[]}
   */
  static getUserNegotiations(userId) {
    try {
      return this.getAll().filter(
        (negotiation) =>
          negotiation.ownerId === userId ||
          negotiation.interestedUserId === userId
      );
    } catch {
      return [];
    }
  }

  /**
   * Returns the negotiation associated with a proposal.
   *
   * @param {string} proposalId - Proposal identifier.
   * @returns {Negotiation|null}
   */
  static getProposalNegotiation(proposalId) {
    try {
      const negotiations =
        AQQStorage.get('negotiations') ?? [];

      return (
        negotiations.find(
          (negotiation) =>
            negotiation.proposalId === proposalId
        ) ?? null
      );
    } catch {
      return null;
    }
  }

  /**
   * Marks a negotiation as leaving.
   *
   * @param {string} negotiationId - Negotiation identifier.
   * @returns {{success:boolean,error?:string}}
   */
  static markAsLeaving(negotiationId) {
    try {
      const negotiations =
        AQQStorage.get('negotiations') ?? [];

      const negotiation =
        negotiations.find(
          (current) =>
            current.id === negotiationId
        );

      if (!negotiation) {
        return {
          success: false,
          error: 'NEGOTIATION_NOT_FOUND'
        };
      }

      if (
        negotiation.status !==
        NEGOTIATION_STATUS.OPEN
      ) {
        return {
          success: false,
          error: 'INVALID_NEGOTIATION_STATUS'
        };
      }

      negotiation.status =
        NEGOTIATION_STATUS.LEAVING;

      negotiation.leavingAt =
        new Date().toISOString();

      AQQStorage.set(
        'negotiations',
        negotiations
      );

      NotificationService.create({
        userId: negotiation.ownerId,
        type: NOTIFICATION_TYPES.NEGOTIATION,
        title: 'Interessado a caminho',
        message:
          'O interessado informou que está a caminho para retirar o item.',
        referenceType:
          REFERENCE_TYPES.NEGOTIATION,
        referenceId: negotiation.id
      });

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marks a negotiation as arrived.
   *
   * @param {string} negotiationId - Negotiation identifier.
   * @returns {{success:boolean,error?:string}}
   */
  static markAsArrived(negotiationId) {
    try {
      const negotiations =
        AQQStorage.get('negotiations') ?? [];

      const negotiation =
        negotiations.find(
          (current) =>
            current.id === negotiationId
        );

      if (!negotiation) {
        return {
          success: false,
          error: 'NEGOTIATION_NOT_FOUND'
        };
      }

      if (
        negotiation.status !==
        NEGOTIATION_STATUS.LEAVING
      ) {
        return {
          success: false,
          error: 'INVALID_NEGOTIATION_STATUS'
        };
      }

      negotiation.status =
        NEGOTIATION_STATUS.ARRIVED;

      negotiation.arrivedAt =
        new Date().toISOString();

      AQQStorage.set(
        'negotiations',
        negotiations
      );

      NotificationService.create({
        userId: negotiation.ownerId,
        type: NOTIFICATION_TYPES.NEGOTIATION,
        title: 'Interessado chegou',
        message:
          'O interessado informou que chegou ao local de retirada.',
        referenceType:
          REFERENCE_TYPES.NEGOTIATION,
        referenceId: negotiation.id
      });

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Completes a negotiation.
   *
   * @param {string} negotiationId - Negotiation identifier.
   * @returns {{success:boolean,negotiation?:Object,error?:string}}
   */
  static completeNegotiation(negotiationId) {
    try {
      const negotiations =
        AQQStorage.get('negotiations') ?? [];

      const negotiation =
        negotiations.find(
          (current) =>
            current.id === negotiationId
        );

      if (!negotiation) {
        return {
          success: false,
          error: 'NEGOTIATION_NOT_FOUND'
        };
      }

      if (
        negotiation.status !==
        NEGOTIATION_STATUS.ARRIVED
      ) {
        return {
          success: false,
          error: 'INVALID_NEGOTIATION_STATUS'
        };
      }

      const now =
        new Date().toISOString();

      negotiation.status =
        NEGOTIATION_STATUS.COMPLETED;

      negotiation.completedAt = now;

      const proposals =
        AQQStorage.get('proposals') ?? [];

      proposals.forEach((proposal) => {
        if (
          proposal.id ===
          negotiation.proposalId
        ) {
          proposal.status =
            PROPOSAL_STATUS.COMPLETED;
        } else if (
          proposal.itemId ===
          negotiation.itemId
        ) {
          proposal.status =
            PROPOSAL_STATUS.CANCELLED;
        }
      });

      AQQStorage.set(
        'proposals',
        proposals
      );

      const item =
        ItemService.getById(
          negotiation.itemId
        );

      if (item) {
        item.status =
          ITEM_STATUS.NEGOTIATED;

        const items =
          AQQStorage.get('items') ?? [];

        const itemIndex =
          items.findIndex(
            (current) =>
              current.id === item.id
          );

        if (itemIndex !== -1) {
          items[itemIndex] = item;

          AQQStorage.set(
            'items',
            items
          );
        }
      }

      negotiations.forEach((current) => {
        if (
          current.id !== negotiation.id &&
          current.itemId ===
            negotiation.itemId
        ) {
          current.status =
            NEGOTIATION_STATUS.CANCELLED;

          current.cancelledAt = now;
        }
      });

      AQQStorage.set(
        'negotiations',
        negotiations
      );

      NotificationService.create({
        userId:
          negotiation.interestedUserId,
        type:
          NOTIFICATION_TYPES.NEGOTIATION,
        title:
          'Retirada concluída',
        message:
          'A retirada foi concluída com sucesso.',
        referenceType:
          REFERENCE_TYPES.NEGOTIATION,
        referenceId: negotiation.id
      });

      NotificationService.create({
        userId: negotiation.ownerId,
        type:
          NOTIFICATION_TYPES.NEGOTIATION,
        title:
          'Negociação concluída',
        message:
          'A negociação foi finalizada com sucesso.',
        referenceType:
          REFERENCE_TYPES.NEGOTIATION,
        referenceId: negotiation.id
      });

      proposals.forEach((proposal) => {
        if (
          proposal.itemId ===
            negotiation.itemId &&
          proposal.id !==
            negotiation.proposalId
        ) {
          NotificationService.create({
            userId:
              proposal.proposerId,
            type:
              NOTIFICATION_TYPES.NEGOTIATION,
            title:
              'Negociação encerrada',
            message:
              'A negociação foi encerrada porque outro interessado concluiu a retirada primeiro.',
            referenceType:
              REFERENCE_TYPES.NEGOTIATION,
            referenceId: negotiation.id
          });
        }
      });

      return {
        success: true,
        negotiation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancels a negotiation.
   *
   * @param {string} negotiationId - Negotiation identifier.
   * @returns {{success:boolean,error?:string}}
   */
  static cancelNegotiation(negotiationId) {
    try {
      const negotiations =
        AQQStorage.get('negotiations') ?? [];

      const negotiation =
        negotiations.find(
          (current) =>
            current.id === negotiationId
        );

      if (!negotiation) {
        return {
          success: false,
          error: 'NEGOTIATION_NOT_FOUND'
        };
      }

      if (
        negotiation.status ===
          NEGOTIATION_STATUS.COMPLETED ||
        negotiation.status ===
          NEGOTIATION_STATUS.CANCELLED
      ) {
        return {
          success: false,
          error: 'INVALID_NEGOTIATION_STATUS'
        };
      }

      negotiation.status =
        NEGOTIATION_STATUS.CANCELLED;

      negotiation.cancelledAt =
        new Date().toISOString();

      AQQStorage.set(
        'negotiations',
        negotiations
      );
      
      ProposalService.cancelProposal(negotiation.proposalId);

      NotificationService.create({
        userId:
          negotiation.interestedUserId,
        type:
          NOTIFICATION_TYPES.NEGOTIATION,
        title:
          'Negociação cancelada',
        message:
          'A negociação foi cancelada.',
        referenceType:
          REFERENCE_TYPES.NEGOTIATION,
        referenceId: negotiation.id
      });

      NotificationService.create({
        userId: negotiation.ownerId,
        type:
          NOTIFICATION_TYPES.NEGOTIATION,
        title:
          'Negociação cancelada',
        message:
          'A negociação foi cancelada.',
        referenceType:
          REFERENCE_TYPES.NEGOTIATION,
        referenceId: negotiation.id
      });

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}