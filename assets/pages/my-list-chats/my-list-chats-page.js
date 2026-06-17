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

  async initialize() {
    try {
      const userId = Session.getUserId();

      if (!userId) {
        window.location.href =  ROUTES['login'];
        return;
      }

      this.bindEvents();

      await this.renderChatList();
    } catch (error) {
      console.error(error);

      this.alert.danger('Erro ao carregar conversas', 'Tente novamente.');
    }
  }

  bindEvents() {
    if (!this.backButton) {
      return;
    }
    Events.on(this.backButton, "click", () => {
        window.location.href = ROUTES['dashboard'];
      }
    );
  }

  async loadChats() {
    const userId = Session.getUserId();

    return ChatService.getUserChats(userId);
  }

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
      proposalStatus:  proposal?.status ?? 'pending',
      lastActivityDate: this.formatDate(activityDate),
      unreadCount,
      onClick: proposalId => this.openChat(proposalId),
    };
  }

  async renderChatList() {
    this.clearChatList();

    const chats = await this.loadChats();
    if (!Array.isArray(chats) || chats.length === 0 ) {
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

  renderEmptyState() {
    const emptyState =  new EmptyState({
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

  openChat(proposalId) {
    NavStorage.set('chat-page',
      {
        proposalId: proposalId
      }
    );

    window.location.href = ROUTES['chat'];
  }

  extractFirstName(name) {
    if (!name) {
      return '';
    }

    return name.trim().split(' ')[0];
  }

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

  clearChatList() {
    this.chatCards.forEach(card =>card.destroy());

    this.chatCards = [];

    while (this.chatListContainer?.firstChild) {
      this.chatListContainer.removeChild(this.chatListContainer.firstChild);
    }
  }

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
      const clone =this.backButton.cloneNode(true);

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