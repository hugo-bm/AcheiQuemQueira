/**
 * ==================================================
 * AQQ - Data Entities
 * ==================================================
 *
 * Official data contracts used by:
 *
 * - dump.json
 * - LocalStorage
 * - Services
 * - Flows
 * - Validation layer
 *
 * These typedefs act as the application's
 * pseudo-database schema.
 */

/**
 * ==================================================
 * Metadata
 * ==================================================
 */

/**
 * System metadata.
 *
 * @typedef {Object} Metadata
 *
 * @property {string} version
 * Application version.
 *
 * @property {string} seedVersion
 * Seed version used to populate the system.
 *
 * @property {string} initializedAt
 * Initial bootstrap date.
 */

/**
 * ==================================================
 * User
 * ==================================================
 */

/**
 * User social links.
 *
 * @typedef {Object} UserSocialLinks
 *
 * @property {string} instagram
 * @property {string} facebook
 */

/**
 * User reputation summary.
 *
 * @typedef {Object} UserReputation
 *
 * @property {number} averageRating
 * @property {number} reviewsCount
 * @property {number} completedDeals
 * @property {number} publishedItems
 */

/**
 * Platform user.
 *
 * @typedef {Object} User
 *
 * @property {string} id
 * @property {string} document
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} phone
 *
 * @property {boolean} verifiedPhone
 * @property {boolean} verifiedIdentity
 *
 * @property {?string} avatar
 *
 * @property {string} state
 * @property {string} city
 * @property {string} neighborhood
 * @property {string} address
 * @property {boolean} active
 * @property {UserSocialLinks} socialLinks
 * @property {UserReputation} reputation
 *
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * ==================================================
 * Item
 * ==================================================
 */

/**
 * Available item quality levels.
 *
 * @typedef {"grau-1"|"grau-2"|"grau-3"|"grau-4"} ItemQuality
 */

/**
 * Image Mock.
 *
 * @typedef Image
 * @property {string} id
 * @property {string} name
 * @property {string} data
 * @property {string} createdAt
 */

/**
 * Available item statuses.
 *
 * @typedef {"active"|"negotiated"|"expired"|"NO_AGREEMENT|REMOVED"} ItemStatus
 */

/**
 * Published item.
 *
 * @typedef {Object} Item
 *
 * @property {string} id
 * @property {string} ownerId
 *
 * @property {string} title
 * @property {string} description
 * @property {string} [volumeDescription]
 *
 * @property {string} categoryId
 * @property {string} subcategoryId
 *
 * @property {Image[]} [images]
 *
 * @property {ItemQuality} quality
 * @property {ItemStatus} status
 *
 * @property {string} expiresAt
 * @property {number} interestedCount
 *
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * ==================================================
 * Catalog
 * ==================================================
 */

/**
 * Item category.
 *
 * @typedef {Object} Category
 *
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 */

/**
 * Item subcategory.
 *
 * @typedef {Object} Subcategory
 *
 * @property {string} id
 * @property {string} categoryId
 * @property {string} name
 */

/**
 * Catalog structure.
 *
 * @typedef {Object} Catalog
 *
 * @property {Category[]} categories
 * @property {Subcategory[]} subcategories
 */

/**
 * ==================================================
 * Proposal
 * ==================================================
 */

/**
 * Proposal status.
 *
 * @typedef {"pending"|"accepted"|"rejected"|"cancelled"|"completed"} ProposalStatus
 */

/**
 * User interest proposal.
 *
 * @typedef {Object} Proposal
 *
 * @property {string} id
 * @property {string} itemId
 * @property {string} proposerId
 *
 * @property {string} message
 *
 * @property {ProposalStatus} status
 *
 * @property {string} createdAt
 */

/**
 * ==================================================
 * Negotiation
 * ==================================================
 */

/**
 * Negotiation status.
 *
 * @typedef {"accepted"|"leaving"|"arrived"|"completed"|"cancelled"} NegotiationStatus
 */

/**
 * Item negotiation.
 *
 * @typedef {Object} Negotiation
 *
 * @property {string} id
 *
 * @property {string} itemId
 * @property {string} proposalId
 *
 * @property {string} ownerId
 * @property {string} interestedUserId
 *
 * @property {NegotiationStatus} status
 *
 * @property {string|null} leavingAt
 * @property {string|null} arrivedAt
 * @property {string|null} completedAt
 * @property {string|null} cancelledAt
 *
 * @property {string} createdAt
 */

/**
 * ==================================================
 * Notification
 * ==================================================
 */

/**
 * Notification type.
 *
 * @typedef {"item"|"proposal"|"negotiation"|"chat"|"system"} NotificationType
 */
/**
 * Notification reference type.
 *
 * @typedef {
 *   "item" |
 *   "proposal" |
 *   "negotiation" |
 *   "chat" |
 *   "user" |
 *   "system"
 * } NotificationReferenceType
 */
/**
 * User notification.
 *
 * @typedef {Object} Notification
 *
 * @property {string} id
 * @property {string} userId
 *
 * @property {NotificationType} type
 *
 * @property {string} title
 * @property {string} message
 *
 * @property {NotificationReferenceType} referenceType
 * @property {string} referenceId
 *
 * @property {string|null} readAt
 *
 * @property {string} createdAt
 */

/**
 * ==================================================
 * Chat
 * ==================================================
 */

/**
 * Conversation between users.
 *
 * @typedef {Object} Chat
 *
 * @property {string} id
 *
 * @property {string} itemId
 * @property {string} proposalId
 *
 * @property {string[]} participants
 *
 * @property {boolean} status
 *
 * @property {string} createdAt
 */

/**
 * ==================================================
 * Message
 * ==================================================
 */

/**
 * Chat message.
 *
 * @typedef {Object} Message
 *
 * @property {string} id
 *
 * @property {string} chatId
 * @property {string} senderId
 *
 * @property {string} content
 *
 * @property {boolean} read
 *
 * @property {string} createdAt
 */

/**
 * ==================================================
 * Review
 * ==================================================
 */

/**
 * Reputation review.
 *
 * @typedef {Object} Review
 *
 * @property {string} id
 *
 * @property {string} negotiationId
 *
 * @property {string} reviewerId
 * @property {string} reviewedUserId
 *
 * @property {number} rating
 *
 * @property {string} comment
 *
 * @property {string} createdAt
 */

/**
 * ==================================================
 * Settings
 * ==================================================
 */

/**
 * Application settings.
 *
 * @typedef {Object} AppSettings
 *
 * @property {boolean} seedApplied
 * @property {string} currentSeedVersion
 */

/**
 * Artificial intelligence settings.
 *
 * @typedef {Object} AISettings
 *
 * @property {boolean} enabled
 * @property {string} provider
 */

/**
 * System settings.
 *
 * @typedef {Object} Settings
 *
 * @property {AppSettings} app
 * @property {AISettings} ai
 */

/**
 * ==================================================
 * Root Database Structure
 * ==================================================
 */

/**
 * Complete AQQ data structure.
 *
 * @typedef {Object} Database
 *
 * @property {Metadata} metadata
 *
 * @property {User[]} users
 * @property {Item[]} items
 * @property {Proposal[]} proposals
 * @property {Negotiation[]} negotiations
 * @property {Notification[]} notifications
 * @property {Chat[]} chats
 * @property {Message[]} messages
 * @property {Review[]} reviews
 *
 * @property {Settings} settings
 * @property {Catalog} catalog
 */
