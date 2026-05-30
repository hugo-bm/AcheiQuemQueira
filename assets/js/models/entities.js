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
 * User address.
 *
 * @typedef {Object} UserAddress
 *
 * @property {string} zipCode
 * @property {string} state
 * @property {string} city
 * @property {string} neighborhood
 * @property {string} street
 * @property {string} number
 * @property {string} complement
 */

/**
 * User social links.
 *
 * @typedef {Object} UserSocialLinks
 *
 * @property {string} instagram
 * @property {string} facebook
 * @property {string} whatsapp
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
 * @property {UserAddress} address
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
 * @typedef {"defective"|"issues"|"esthetic"|"functional"} ItemQuality
 */

/**
 * Available item statuses.
 *
 * @typedef {"available"|"negotiating"|"completed"|"removed"} ItemStatus
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
 *
 * @property {string} categoryId
 * @property {string} subcategoryId
 *
 * @property {string[]} tags
 * @property {string[]} images
 *
 * @property {ItemQuality} quality
 * @property {ItemStatus} status
 *
 * @property {number} durationDays
 * Lifetime of the advertisement.
 *
 * @property {string} expiresAt
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
 * Negotiation flow.
 *
 * @typedef {Object} Negotiation
 *
 * @property {string} id
 *
 * @property {string} proposalId
 * @property {string} itemId
 *
 * @property {string} sellerId
 * @property {string} buyerId
 *
 * @property {boolean} pickupEnabled
 *
 * @property {NegotiationStatus} status
 *
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} closedAt
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
 * @property {string} description
 *
 * @property {string} referenceId
 *
 * @property {boolean} read
 *
 * @property {string} createdAt
 * @property {string} lastLoginAt
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
 * @property {boolean} active
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