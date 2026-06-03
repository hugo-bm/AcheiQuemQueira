import { AQQStorage } from "../core/aqq-storage.js";
import { ProposalService } from "./proposal-service.js";
import { NotificationService } from "./notification-service.js";
import {
  ITEM_STATUS,
  ITEM_TYPES,
  ITEM_DURATIONS,
  NOTIFICATION_TYPES,
  REFERENCE_TYPES,
} from "../core/constants.js";

/**
 * Centralizes item business operations.
 */
export class ItemService {
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
   * Creates an item.
   *
   * @typedef {"grau-1"|"grau-2"|"grau-3"|"grau-4"} ItemQuality
   *
   * @typedef {Object} Item
   *
   * @property {string} ownerId
   *
   * @property {string} title
   * @property {string} description
   * @property {string} [volumeDescription]
   *
   * @property {string} categoryId
   * @property {string} subcategoryId
   *
   * @property {string} type
   *
   * @property {string[]} [images]
   *
   * @property {ItemQuality} quality
   * @property {string} price
   *
   * @property {number} item_duration
   * Lifetime of the advertisement.
   *
   * @param {Item} data - Item data.
   * @returns {{success:boolean,item?:Object,error?:string}}
   */
  static createItem(data) {
    try {
      const requiredFields = [
        "ownerId",
        "title",
        "description",
        "categoryId",
        "subcategoryId",
        "quality",
        "type",
        "price",
        "item_duration",
      ];

      for (const field of requiredFields) {
        if (!data[field]) {
          return {
            success: false,
            error: `${field.toUpperCase()}_REQUIRED`,
          };
        }
      }

      const images = data.images ?? [];

      if (images.length > 5) {
        return {
          success: false,
          error: "MAX_IMAGES_EXCEEDED",
        };
      }

      const now = new Date();

      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + Number(data.item_duration));

      const item = {
        id: this.generateId(),

        ownerId: data.ownerId,

        title: data.title,
        description: data.description,
        volumeDescription: data.volumeDescription ?? "",

        type: data.type,

        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,

        quality: data.quality,

        price: data.price ?? null,

        images,

        interestedCount: 0,

        status: ITEM_STATUS.ACTIVE,

        publishedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),

        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const items = AQQStorage.get("items") ?? [];

      items.push(item);

      AQQStorage.set("items", items);

      return {
        success: true,
        item,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Updates an item.
   *
   * @param {string} itemId - Item identifier.
   * @typedef {"grau-1"|"grau-2"|"grau-3"|"grau-4"} ItemQuality
   *
   * @typedef {Object} Item
   *
   * @property {string} ownerId
   *
   * @property {string} [title]
   * @property {string} [description]
   * @property {string} [volumeDescription]
   *
   * @property {string} [categoryId]
   * @property {string} [subcategoryId]
   *
   * @property {string} [type]
   *
   * @property {string[]} [images]
   *
   * @property {ItemQuality} [quality]
   * @property {string} [price]
   *
   * @param {Item} data - Item data.
   * @returns {{success:boolean,item?:Object,error?:string}}
   */
  static updateItem(itemId, data) {
    try {
      const items = AQQStorage.get("items") ?? [];
      const proposals = AQQStorage.get("proposals") ?? [];

      const index = items.findIndex((item) => item.id === itemId);

      if (index === -1) {
        return {
          success: false,
          error: "ITEM_NOT_FOUND",
        };
      }

      if ((data.images ?? []).length > 5) {
        return {
          success: false,
          error: "MAX_IMAGES_EXCEEDED",
        };
      }

      const current = items[index];

      items[index] = {
        ...current,

        title: data.title ?? current.title,

        description: data.description ?? current.description,

        volumeDescription: data.volumeDescription ?? current.volumeDescription,

        type: data.type ?? current.type,

        categoryId: data.categoryId ?? current.categoryId,

        subcategoryId: data.subcategoryId ?? current.subcategoryId,

        quality: data.quality ?? current.quality,

        price: data.price ?? current.price,

        images: data.images ?? current.images,

        updatedAt: new Date().toISOString(),
      };

      AQQStorage.set("items", items);

      const interestedUsers = [
        ...new Set(
          proposals
            .filter((proposal) => proposal.itemId === itemId)
            .map((proposal) => proposal.proposerId),
        ),
      ];

      interestedUsers.forEach((userId) => {
        NotificationService.create({
          userId,
          type: NOTIFICATION_TYPES.ITEM,
          title: "Anúncio atualizado",
          message: "O anúncio foi atualizado pelo proprietário.",
          referenceType: REFERENCE_TYPES.ITEM,
          referenceId: itemId,
        });
      });

      return {
        success: true,
        item: items[index],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Marks an item as removed.
   *
   * @param {string} itemId - Item identifier.
   * @returns {boolean}
   */
  static removeItem(itemId) {
    try {
      const items = AQQStorage.get("items") ?? [];
      const proposals = AQQStorage.get("proposals") ?? [];

      const index = items.findIndex((item) => item.id === itemId);

      if (index === -1) {
        return false;
      }

      items[index].status = ITEM_STATUS.REMOVED;

      items[index].updatedAt = new Date().toISOString();

      AQQStorage.set("items", items);

      const interestedUsers = [
        ...new Set(
          proposals
            .filter((proposal) => proposal.itemId === itemId)
            .map((proposal) => proposal.proposerId),
        ),
      ];

      interestedUsers.forEach((userId) => {
        NotificationService.create({
          userId,
          type: NOTIFICATION_TYPES.ITEM,
          title: "Anúncio removido",
          message: "O anúncio foi removido pelo proprietário.",
          referenceType: REFERENCE_TYPES.ITEM,
          referenceId: itemId,
        });
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns an item by identifier.
   *
   * @param {string} itemId - Item identifier.
   * @returns {Object|null}
   */
  static getById(itemId) {
    const items = AQQStorage.get("items") ?? [];

    return items.find((item) => item.id === itemId) ?? null;

    return null;
  }

  /**
   * Returns all items.
   *
   * @returns {Object[]}
   */
  static getAll() {
    const items = AQQStorage.get("items") ?? [];

    return [...items].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  /**
   * Returns active items.
   *
   * @returns {Object[]}
   */
  static getActiveItems() {
    try {
      return this.getAll().filter((item) => item.status === ITEM_STATUS.ACTIVE);
    } catch {
      return [];
    }
  }

  /**
   * Returns expired items.
   *
   * @returns {Object[]}
   */
  static getExpiredItems() {
    try {
      return this.getAll().filter(
        (item) => item.status === ITEM_STATUS.EXPIRED,
      );
    } catch {
      return [];
    }
  }

  /**
   * Returns items from a user.
   *
   * @param {string} userId - User identifier.
   * @returns {Object[]}
   */
  static getUserItems(userId) {
    try {
      return this.getAll().filter((item) => item.ownerId === userId);
    } catch {
      return [];
    }
  }

  /**
   * Marks an item as negotiated.
   *
   * @param {string} itemId - Item identifier.
   * @returns {boolean}
   */
  static markAsNegotiated(itemId) {
    const items = AQQStorage.get("items") ?? [];

    const item = items.find((current) => current.id === itemId);

    if (!item) {
      return false;
    }

    item.status = ITEM_STATUS.NEGOTIATED;
    item.updatedAt = new Date().toISOString();

    AQQStorage.set("items", items);

    return true;
  }

  /**
   * Marks an item as no agreement.
   *
   * @param {string} itemId - Item identifier.
   * @returns {boolean}
   */
  static markAsNoAgreement(itemId) {
    const items = AQQStorage.get("items") ?? [];

    const item = items.find((current) => current.id === itemId);

    if (!item) {
      return false;
    }

    item.status = ITEM_STATUS.NO_AGREEMENT;
    item.updatedAt = new Date().toISOString();

    AQQStorage.set("items", items);

    return true;
  }

  /**
   * Processes expired items.
   *
   * @returns {void}
   */
  static processExpiredItems() {
    try {
      const items = AQQStorage.get("items") ?? [];
      const now = new Date();

      items.forEach((item) => {
        if (
          item.status !== ITEM_STATUS.ACTIVE ||
          new Date(item.expiresAt) > now
        ) {
          return;
        }

        const proposals = ProposalService.getByItem(item.id);

        if (proposals.length === 0) {
          item.status = ITEM_STATUS.EXPIRED;

          NotificationService.create({
            userId: item.ownerId,
            type: NOTIFICATION_TYPES.ITEM,
            title: "Anúncio expirado",
            message: "Seu anúncio expirou sem interessados.",
            referenceType: REFERENCE_TYPES.ITEM,
            referenceId: item.id,
          });

          return;
        }

        const accepted = ProposalService.getAcceptedProposals(item.id);

        let selectedProposal = null;

        if (accepted.length > 0) {
          selectedProposal = accepted[0];
        } else {
          const pending = proposals.filter(
            (proposal) => proposal.status === "pending",
          );

          if (pending.length > 0) {
            selectedProposal = pending[0];
          }
        }

        if (!selectedProposal) {
          item.status = ITEM_STATUS.EXPIRED;
          return;
        }

        item.status = ITEM_STATUS.NO_AGREEMENT;

        NotificationService.create({
          userId: item.ownerId,
          type: NOTIFICATION_TYPES.ITEM,
          title: "Confirmação necessária",
          message: "Sua proposta foi selecionada para confirmação final.",
          referenceType: REFERENCE_TYPES.ITEM,
          referenceId: item.id,
        });

        NotificationService.create({
          userId: selectedProposal.proposerId,
          type: NOTIFICATION_TYPES.ITEM,
          title: "Confirmação necessária",
          message: "Sua proposta foi selecionada para confirmação final.",
          referenceType: REFERENCE_TYPES.ITEM,
          referenceId: item.id,
        });
      });

      AQQStorage.set("items", items);
    } catch {
      return;
    }
  }
}
