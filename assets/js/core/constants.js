export const NOTIFICATION_TYPES = {
    ITEM: 'item',
    PROPOSAL: 'proposal',
    NEGOTIATION: 'negotiation',
    CHAT: 'chat',
    SYSTEM: 'system'
};

export const REFERENCE_TYPES = {
    ITEM: 'item',
    PROPOSAL: 'proposal',
    NEGOTIATION: 'negotiation',
    CHAT: 'chat',
    USER: 'user',
    SYSTEM: 'system'
};

export const MESSAGE_TYPES = {
    TEXT: "text",
    SYSTEM: "system"
}

export const CHAT_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed'
}

export const PROPOSAL_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const ITEM_STATUS = {
  ACTIVE: 'active',
  NEGOTIATED: 'negotiated',
  EXPIRED: 'expired',
  NO_AGREEMENT: 'no_agreement',
  REMOVED: 'removed'
}

export const ITEM_DURATIONS = {
  DAY: 1,
  WEEK: 7,
  FORTNIGHT: 15,
  MONTH: 30
};

export const ITEM_TYPES = {
  FREE: 'free',
  SALE: 'sale',
  DISPOSAL: 'disposal'
};

export const NEGOTIATION_STATUS = {
  OPEN: 'open',
  LEAVING: 'leaving',
  ARRIVED: 'arrived',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ROUTES = {
      'my-items': '/assets/pages/my-list-items/my-list-items-page.html',

      'my-chats': '/assets/pages/my-list-chats/my-list-chats-page.html',

      'my-reviews': '/assets/pages/my-list-ratings/my-list-ratings-page.html',

      'profile': '/assets/pages/profile/profile-page.html',

      'login': '/assets/pages/login/login-page.html',

      'register': '/assets/pages/register/register-page.html',

      'add-item': '/assets/pages/add-item/add-item-page.html',

      'describe-item':'/assets/pages/describe-item/describe-item-page.html',

      'search':'/assets/pages/search/search-page.html',

      'dashboard':'/assets/pages/dashboard/dashboard-page.html',

      'identity-validation': '/assets/pages/identity-validation/identity-validation.html',

      'phone-validation': '/assets/pages/phone-validation/phone-validation.html',

      'chat': '/assets/pages/chat/chat-page.html',
    };