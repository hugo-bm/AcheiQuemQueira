import { AQQStorage } from '../core/aqq-storage.js';
import { ChatService } from './chat-service.js';
import { NotificationService } from './notification-service.js';
import {
  PROPOSAL_STATUS,
  ITEM_TYPES,
  ITEM_STATUS,
  NOTIFICATION_TYPES,
  REFERENCE_TYPES,
  MESSAGE_TYPES
} from '../core/constants.js';

/**
 * Centralizes proposal management operations.
 */
export class ProposalService {
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
   * Creates a proposal.
   *
   * @param {Object} data - Proposal data.
   * @param {string} data.itemId - Item identifier.
   * @param {string} data.proposerId - User identifier.
   * @param {string} [data.message=''] - Customer-customized message.
   * @returns {{success:boolean, proposal?:Object, error?:string}}
   */
  static createProposal(data) {
    const items = AQQStorage.get('items') ?? [];
    const users = AQQStorage.get('users') ?? [];
    const proposals = AQQStorage.get('proposals') ?? [];

    const item = items.find(
      (currentItem) => currentItem.id === data.itemId
    );

    if (!item) {
      return {
        success: false,
        error: 'ITEM_NOT_FOUND'
      };
    }

    if (item.status !== ITEM_STATUS.ACTIVE) {
      return {
        success: false,
        error: 'ITEM_INACTIVE'
      };
    }

    const proposer = users.find(
      (user) => user.id === data.proposerId
    );

    if (!proposer) {
      return {
        success: false,
        error: 'USER_NOT_FOUND'
      };
    }

    if (item.userId === data.proposerId) {
      return {
        success: false,
        error: 'INVALID_USER'
      };
    }

    if (
      this.hasUserProposal(
        data.itemId,
        data.proposerId
      )
    ) {
      return {
        success: false,
        error: 'PROPOSAL_ALREADY_EXISTS'
      };
    }

    let messageFinal = data.message || '';

    if (data.message.length === 0)
    {
      switch (item.type) {
        case ITEM_TYPES.FREE:
          messageFinal =
            'Olá! Tenho interesse na doação e posso retirar no local. Como combinamos?';
          break;

        case ITEM_TYPES.SALE:
          messageFinal =
            'Olá! Tenho interesse no item para compra e posso retirar no local. Como combinamos?';
          break;

        case ITEM_TYPES.DISPOSAL:
          messageFinal =
            'Olá! Faço a retirada e o descarte do item no local. Qual o seu orçamento?';
          break;

        default:
          messageFinal = '';
      }
    }

    const proposal = {
      id: this.generateId(),
      itemId: data.itemId,
      proposerId: data.proposerId,
      message: messageFinal,
      status: PROPOSAL_STATUS.PENDING,
      createdAt: new Date().toISOString()
    };

    proposals.push(proposal);

    AQQStorage.set('proposals', proposals);

    const itemIndex = items.findIndex(
      (currentItem) => currentItem.id === item.id
    );

    items[itemIndex] = {
      ...item,
      interestedCount:
        (item.interestedCount || 0) + 1
    };

    AQQStorage.set('items', items);

    const chatResult = ChatService.createChat({
      proposalId: proposal.id,
      ownerUserId: items[itemIndex].ownerId,
      interestedUserId: data.proposerId
    });
    if (chatResult.success) {
      ChatService.sendMessage({
        chatId: chatResult.chat.id,
        senderId: data.proposerId,
        content: messageFinal,
      });
    }

    const notification = NotificationService.create({
      userId: item.userId,
      type: NOTIFICATION_TYPES.PROPOSAL,
      title: 'Nova proposta recebida',
      message: messageFinal,
      referenceType: REFERENCE_TYPES.PROPOSAL,
      referenceId: proposal.id
    });

    return {
      success: true,
      proposal
    };
  }

  /**
   * Returns a proposal by identifier.
   *
   * @param {string} proposalId - Proposal identifier.
   * @returns {Object|null}
   */
  static getById(proposalId) {
    const proposals =
      AQQStorage.get('proposals') ?? [];

    return (
      proposals.find(
        (proposal) => proposal.id === proposalId
      ) ?? null
    );
  }

  /**
   * Returns proposals from an item.
   *
   * Ordered by createdAt ascending.
   *
   * @param {string} itemId - Item identifier.
   * @returns {Object[]}
   */
  static getByItem(itemId) {
    const proposals =
      AQQStorage.get('proposals') ?? [];

    return proposals
      .filter(
        (proposal) => proposal.itemId === itemId
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      ); // ASC Order
  }

  /**
   * Returns proposals created by a user.
   *
   * Ordered by createdAt descending.
   *
   * @param {string} userId - User identifier.
   * @returns {Object[]}
   */
  static getByUser(userId) {
    const proposals =
      AQQStorage.get('proposals') ?? [];

    return proposals
      .filter(
        (proposal) => proposal.proposerId === userId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      ); //DESC Order
  }

  /**
   * Checks whether a user already has a proposal for an item.
   *
   * @param {string} itemId - Item identifier.
   * @param {string} userId - User identifier.
   * @returns {boolean}
   */
  static hasUserProposal(itemId, userId) {
    const proposals =
      AQQStorage.get('proposals') ?? [];

    return proposals.some(
      (proposal) =>
        proposal.itemId === itemId &&
        proposal.proposerId === userId
    );
  }

  /**
   * Returns accepted proposals from an item.
   *
   * Ordered by createdAt ascending.
   *
   * @param {string} itemId - Item identifier.
   * @returns {Object[]}
   */
  static getAcceptedProposals(itemId) {
    const proposals =
      AQQStorage.get('proposals') ?? [];

    return proposals
      .filter(
        (proposal) =>
          proposal.itemId === itemId &&
          proposal.status ===
            PROPOSAL_STATUS.ACCEPTED
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      ); //ASC Order
  }

  /**
   * Accepts a proposal.
   *
   * @param {string} proposalId - Proposal identifier.
   * @returns {boolean}
   */
  static acceptProposal(proposalId) {
    return this.updateStatus(
      proposalId,
      PROPOSAL_STATUS.ACCEPTED,
      true
    );
  }

  /**
   * Rejects a proposal.
   *
   * @param {string} proposalId - Proposal identifier.
   * @returns {boolean}
   */
  static rejectProposal(proposalId) {
    return this.updateStatus(
      proposalId,
      PROPOSAL_STATUS.REJECTED,
      true
    );
  }

  /**
   * Cancels a proposal.
   *
   * @param {string} proposalId - Proposal identifier.
   * @returns {boolean}
   */
  static cancelProposal(proposalId) {
    return this.updateStatus(
      proposalId,
      PROPOSAL_STATUS.CANCELLED,
      false
    );
  }

  /**
   * Completes a proposal.
   *
   * @param {string} proposalId - Proposal identifier.
   * @returns {boolean}
   */
  static completeProposal(proposalId) {
    return this.updateStatus(
      proposalId,
      PROPOSAL_STATUS.COMPLETED,
      false
    );
  }

  /**
   * Updates a proposal status.
   *
   * @param {string} proposalId - Proposal identifier.
   * @param {string} status - New status.
   * @param {boolean} notify - Whether a notification should be created.
   * @returns {boolean}
   */
  static updateStatus(
    proposalId,
    status,
    notify
  ) {
    const proposals =
      AQQStorage.get('proposals') ?? [];

    const index = proposals.findIndex(
      (proposal) => proposal.id === proposalId
    );

    if (index === -1) {
      return false;
    }

    proposals[index] = {
      ...proposals[index],
      status
    };

    AQQStorage.set('proposals', proposals);

    if (notify) {
      NotificationService.create({
        userId: proposals[index].proposerId,
        type: NOTIFICATION_TYPES.PROPOSAL,
        title: 'Atualização da proposta',
        message: status,
        referenceType: REFERENCE_TYPES.PROPOSAL,
        referenceId: proposalId
      });
    }

    return true;
  }
}