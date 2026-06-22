import { Session } from '../../js/core/session.js';
import { UserService } from '../../js/services/user-service.js';
import { ChatService } from '../../js/services/chat-service.js';
import { ProposalService } from '../../js/services/proposal-service.js';

import { ChatCard } from '../../js/components/list-pages/chat-card.js';
import { EmptyState } from '../../js/components/ui/empty-state.js';

import { AlertRender } from '../../js/components/ui/alert-render.js';

import { NavStorage } from '../../js/core/nav-storage.js';
import { ROUTES } from '../../js/core/constants.js';
import { Events } from '../../js/core/events.js';

class MyListChatsPage {
  constructor() {

    this.backButton = document.getElementById('back-button');

    this.chatListContainer = document.getElementById('chat-list-container');

    this.alert = new AlertRender('#alert-container');

    this.chatCards = [];

    this.initialize();
  }

  /**
  * Orchestrates the lifecycle initialization sequence of the page.
  *
  * @returns {void}
  */
  async initialize() {
    try {
      const userId = Session.getUserId();

      if (!userId) {
        window.location.href = ROUTES['login'];
        return;
      }

      this.bindEvents();

      await this.renderChatList();
    } catch (error) {
      console.error(error);

      this.alert.danger('Erro ao carregar conversas', 'Tente novamente.');
    }
  }

  /**
  * Attaches interaction event listeners to the component's root element.
  *
  * @returns {void}
  */
  bindEvents() {
    if (!this.backButton) {
      return;
    }
    Events.on(this.backButton, "click", () => {
      window.location.href = ROUTES['dashboard'];
    }
    );
  }

  /**
   * Fetches the raw collection of chat conversations linked to the logged-in user.
   *
   * @returns {Promise<Object[]>} A promise resolving to the collection of user chat objects.
   */
  async loadChats() {
    const userId = Session.getUserId();

    return ChatService.getUserChats(userId);
  }

  /**
   * Gathers data and constructs the unified visual view model payload for a chat card.
   *
   * @param {Object} chat - The raw chat database entity record.
   * @returns {Promise<Object>} The compiled configuration object for the chat card component.
   */
  async buildChatCardData(chat) {
    const currentUserId = Session.getUserId();

    const otherUserId = chat.participants.find(
      participantId =>
        participantId !== currentUserId
    );

    const otherUser = UserService.getById(otherUserId);

    const messages = ChatService.getMessages(chat.id);

    const unreadMessages = ChatService.getUnreadMessages(chat.id, currentUserId);

    const proposal = ProposalService.getById(chat.proposalId);

    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    const lastMessageText = lastMessage?.content || 'Nenhuma mensagem enviada.';

    const activityDate = lastMessage?.createdAt || chat.createdAt;

    const unreadCount = unreadMessages.length;

    return {
      proposalId: chat.proposalId,
      avatarUrl: otherUser?.avatar ?? null,
      firstName: this.extractFirstName(otherUser?.name),
      fullName: otherUser?.name ?? '',
      lastMessage: lastMessageText,
      proposalStatus: proposal?.status ?? 'pending',
      lastActivityDate: this.formatDate(activityDate),
      unreadCount,
      onClick: proposalId => this.openChat(proposalId),
    };
  }

  /**
   * Asynchronously loads the chat list and handles dynamic batch card mounting.
   *
   * @returns {Promise<void>}
   */
  async renderChatList() {
    this.clearChatList();

    const chats = await this.loadChats();
    if (!Array.isArray(chats) || chats.length === 0) {
      this.renderEmptyState();
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const chat of chats) {
      const cardData = await this.buildChatCardData(chat);

      const wrapper = document.createElement('div');
      const card = new ChatCard(cardData);

      card.mount(wrapper);

      this.chatCards.push(card);

      if (wrapper.firstElementChild) {
        fragment.appendChild(wrapper.firstElementChild);
      }
    }

    this.chatListContainer.appendChild(fragment);
  }

  /**
   * Instantiates and appends the empty placeholder component when no conversations exist.
   *
   * @returns {void}
   */
  renderEmptyState() {
    const emptyState = new EmptyState({
      icon: 'bi-chat-dots',
      title: 'Nenhuma conversa encontrada',
      description: 'Você ainda não iniciou nenhuma negociação.',
      actionText: 'Explorar anúncios',
      actionCallback: () => {
        window.location.href = ROUTES['dashboard'];
      }
    });

    this.chatListContainer.appendChild(emptyState.render());
  }

  /**
   * Persists the proposal ID to navigation storage and diverts to the chat page view.
   *
   * @param {string|number} proposalId - The unique identifier of the target proposal.
   * @returns {void}
   */
  openChat(proposalId) {
    NavStorage.set('chat-page',
      {
        proposalId: proposalId
      }
    );

    window.location.href = ROUTES['chat'];
  }

  /**
   * Extracts and isolates the first name token from a full name string.
   *
   * @param {string|null} name - The raw full name string to evaluate.
   * @returns {string} The first name string token, or an empty string as a fallback.
   */
  extractFirstName(name) {
    if (!name) {
      return '';
    }

    return name.trim().split(' ')[0];
  }

  /**
   * Formats a date string into relative terms ('Hoje', 'Ontem') or a short date pattern ('DD/MM').
   *
   * @param {string|null} dateString - The raw ISO date timestamp string to evaluate.
   * @returns {string} The relative string representation, formatted date, or an empty string as a fallback.
   */
  formatDate(dateString) {
    if (!dateString) {
      return '';
    }

    const targetDate = new Date(dateString);

    const today = new Date(Date.now());

    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const target = targetDate.toDateString();

    if (target === today.toDateString()) {
      return 'Hoje';
    }

    if (target === yesterday.toDateString()) {
      return 'Ontem';
    }

    const day = String(targetDate.getDate()).padStart(2, '0');

    const month = String(targetDate.getMonth() + 1).padStart(2, '0');

    return `${day}/${month}`;
  }

  /**
   * Purges all active chat cards and empties the visual container element from the DOM.
   *
   * @returns {void}
   */
  clearChatList() {
    this.chatCards.forEach(card => card.destroy());

    this.chatCards = [];

    while (this.chatListContainer?.firstChild) {
      this.chatListContainer.removeChild(this.chatListContainer.firstChild);
    }
  }

  /**
   * Releases page resources
   */
  destroy() {
    this.chatCards.forEach(card =>
      card.destroy()
    );

    Events.off(this.backButton, "click", () => {
      window.location.href = ROUTES['dashboard'];
    }
    );

    this.chatCards = [];

    if (this.backButton) {
      const clone = this.backButton.cloneNode(true);

      this.backButton.replaceWith(clone);
    }

    this.backButton = null;
    this.chatListContainer = null;
    this.alert = null;
  }
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    new MyListChatsPage();
  }
);

// I implemented a lifecycle invalidation for the BFCache (Back-Forward Cache)
// feature of mobile browsers, ensuring data reactivity in history rollback events.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});