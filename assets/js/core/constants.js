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