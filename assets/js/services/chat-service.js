import { AQQStorage } from '../core/aqq-storage.js';
import { NotificationService } from './notification-service.js';
import {
  CHAT_STATUS,
  MESSAGE_TYPES,
  NOTIFICATION_TYPES,
  REFERENCE_TYPES
} from '../core/constants.js';

/**
 * Centralizes chat and message operations.
 */
export class ChatService {
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
   * Creates a new chat.
   *
   * @param {Object} data - Chat creation data.
   * @param {string} data.proposalId - Proposal identifier.
   * @param {string} data.ownerUserId - Owner user identifier.
   * @param {string} data.interestedUserId - Interested user identifier.
   * @returns {{success: boolean, chat?: Object, error?: string}}
   */
  static createChat(data) {
    if (!data.interestedUserId || !data.ownerUserId || !data.proposalId ) {
      return {
      success: false,
      error: "REQUIRED"
    };
    }
    const chats = AQQStorage.get('chats') ?? [];

    const timestamp = new Date().toISOString();

    const chat = {
      id: this.generateId(),
      proposalId: data.proposalId,
      participants: [
        data.ownerUserId,
        data.interestedUserId
      ],
      status: CHAT_STATUS.ACTIVE,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    chats.push(chat);

    AQQStorage.set('chats', chats);

    return {
      success: true,
      chat
    };
  }

  /**
   * Returns a chat by identifier.
   *
   * @param {string} chatId - Chat identifier.
   * @returns {Object|null}
   */
  static getById(chatId) {
    const chats = AQQStorage.get('chats') ?? [];

    return chats.find((chat) => chat.id === chatId) ?? null;
  }

  /**
   * Returns a chat associated with a proposal.
   *
   * @param {string} proposalId - Proposal identifier.
   * @returns {Object|null}
   */
  static getByProposal(proposalId) {
    const chats = AQQStorage.get('chats') ?? [];

    return (
      chats.find(
        (chat) => chat.proposalId === proposalId
      ) ?? null
    );
  }

  /**
   * Returns all chats for a user.
   *
   * Ordered by updatedAt descending.
   *
   * @param {string} userId - User identifier.
   * @returns {Object[]}
   */
  static getUserChats(userId) {
    const chats = AQQStorage.get('chats') ?? [];

    return chats
      .filter(
        (chat) =>
          chat.participants.includes(userId)
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
      );
  }

  /**
   * Sends a message to a chat.
   *
   * @param {Object} data - Message data.
   * @param {string} data.chatId - Chat identifier.
   * @param {string} data.senderId - Sender identifier.
   * @param {string} data.content - Message content.
   * @returns {{success: boolean, message?: Object, error?: string}}
   */
  static sendMessage(data) {
    if (!data.chatId || !data.senderId) {
      return {
        success: false,
        error: 'REQUIRED'
      };
    }

    const chats = AQQStorage.get('chats') ?? [];

    const chatIndex = chats.findIndex(
      (chat) => chat.id === data.chatId
    );

    if (chatIndex === -1) {
      return {
        success: false,
        error: 'CHAT_NOT_FOUND'
      };
    }

    const chat = chats[chatIndex];

    if (chat.status !== CHAT_STATUS.ACTIVE) {
      return {
        success: false,
        error: 'CHAT_CLOSED'
      };
    }

    if (!data.content) {
      return {
        success: false,
        error: 'REQUIRED'
      };
    }

    const messages =
      AQQStorage.get('messages') ?? [];

    const createdAt = new Date().toISOString();

    const message = {
      id: this.generateId(),
      chatId: data.chatId,
      senderId: data.senderId,
      type: MESSAGE_TYPES.TEXT,
      content: data.content,
      read: false,
      createdAt
    };

    messages.push(message);

    AQQStorage.set('messages', messages);

    chats[chatIndex] = {
      ...chat,
      updatedAt: createdAt
    };

    AQQStorage.set('chats', chats);

    const recipientUserId =
      chat.participants.find(
        (participant) =>
          participant !== data.senderUserId
      ) ?? null;

    if (recipientUserId) {
      NotificationService.create({
        userId: recipientUserId,
        type: NOTIFICATION_TYPES.CHAT,
        title: 'New message',
        message: data.content,
        referenceType: REFERENCE_TYPES.CHAT,
        referenceId: chat.id
      });
    }

    return {
      success: true,
      message
    };
  }

  /**
   * Creates a system message.
   *
   * @param {string} chatId - Chat identifier.
   * @param {string} content - Message content.
   * @returns {Object|null}
   */
  static createSystemMessage(chatId, content) {
    const chat = this.getById(chatId);

    if (!chat) {
      return null;
    }

    const messages =
      AQQStorage.get('messages') ?? [];

    const createdAt = new Date().toISOString();

    const message = {
      id: this.generateId(),
      chatId,
      senderId: null,
      type: MESSAGE_TYPES.SYSTEM,
      content,
      read: true,
      createdAt
    };

    messages.push(message);

    AQQStorage.set('messages', messages);

    const chats = AQQStorage.get('chats') ?? [];

    const chatIndex = chats.findIndex(
      (currentChat) => currentChat.id === chatId
    );

    if (chatIndex !== -1) {
      chats[chatIndex] = {
        ...chats[chatIndex],
        updatedAt: createdAt
      };

      AQQStorage.set('chats', chats);
    }

    return message;
  }

  /**
   * Closes a chat.
   *
   * @param {string} chatId - Chat identifier.
   * @returns {boolean}
   */
  static closeChat(chatId) {
    const chats = AQQStorage.get('chats') ?? [];

    const chatIndex = chats.findIndex(
      (chat) => chat.id === chatId
    );

    if (chatIndex === -1) {
      return false;
    }

    chats[chatIndex] = {
      ...chats[chatIndex],
      status: CHAT_STATUS.CLOSED,
      updatedAt: new Date().toISOString()
    };

    AQQStorage.set('chats', chats);

    this.createSystemMessage(
      chatId,
      'Negociação encerrada.'
    );

    return true;
  }

  /**
   * Marks a message as read.
   *
   * @param {string} messageId - Message identifier.
   * @returns {boolean}
   */
  static markMessageAsRead(messageId) {
    const messages =
      AQQStorage.get('messages') ?? [];

    const messageIndex = messages.findIndex(
      (message) => message.id === messageId
    );

    if (messageIndex === -1) {
      return false;
    }

    messages[messageIndex] = {
      ...messages[messageIndex],
      read: true
    };

    AQQStorage.set('messages', messages);

    return true;
  }

    /**
   * Returns all messages from a chat.
   *
   * Messages are ordered by createdAt ascending.
   *
   * @param {string} chatId - Chat identifier.
   * @returns {Object[]}
   */
  static getMessages(chatId) {
    const messages = AQQStorage.get('messages') ?? [];

    return messages
      .filter((message) => message.chatId === chatId)
      .sort(
        (a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
      );
  }

  /**
   * Returns unread messages from a chat that were not sent by the informed user.
   *
   * Messages are ordered by createdAt ascending.
   *
   * @param {string} chatId - Chat identifier.
   * @param {string} userId - Current user identifier.
   * @returns {Object[]}
   */
  static getUnreadMessages(chatId, userId) {
    const messages = AQQStorage.get('messages') ?? [];

    return messages
      .filter(
        (message) =>
          message.chatId === chatId &&
          message.read === false &&
          message.senderId !== userId
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
      );
  }

  /**
   * Marks all unread messages from a chat as read,
   * excluding messages sent by the informed user.
   *
   * @param {string} chatId - Chat identifier.
   * @param {string} userId - Current user identifier.
   * @returns {number}
   */
  static markChatAsRead(chatId, userId) {
    const messages = AQQStorage.get('messages') ?? [];

    let updatedCount = 0;

    for (const message of messages) {
      if (
        message.chatId === chatId &&
        message.senderId !== userId &&
        message.read === false
      ) {
        message.read = true;
        updatedCount += 1;
      }
    }

    if (updatedCount > 0) {
      AQQStorage.set('messages', messages);
    }

    return updatedCount;
  }
}